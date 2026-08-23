#!/usr/bin/env python3
"""
TopBid — StarKerak to'lov listeneri (RAVNAKLANGAN VERSIYA).

HumoCardBot (Telegram) → StarKerak WebSocket → shu listener → Next.js /api/payments/internal
→ matchPayment → profil avtomatik reytingga chiqadi / o'rin yangilanadi.

Ishga tushirish: avtomatik (dev.sh orqali) yoki qo'lda `python3 listener.py`
"""

import asyncio
import json
import logging
import os
import sys
import time

import aiohttp

# pip user site-packages (starkerak SDK uchun)
for p in (
    os.path.expanduser("~/.local/lib/python3.11/site-packages"),
    os.path.expanduser("~/.local/lib/python3.12/site-packages"),
    os.path.expanduser("~/.local/lib/python3.10/site-packages"),
):
    if os.path.isdir(p):
        sys.path.insert(0, p)


def load_env():
    """Oddiy .env yuklovchi — root va local papkalardan."""
    candidates = [
        os.path.join(os.path.dirname(__file__), ".env"),
        os.path.join(os.path.dirname(__file__), "..", "..", ".env"),
    ]
    for path in candidates:
        if os.path.exists(path):
            with open(path) as f:
                for line in f:
                    line = line.strip()
                    if not line or line.startswith("#") or "=" not in line:
                        continue
                    key, _, val = line.partition("=")
                    key = key.strip()
                    val = val.strip().strip('"').strip("'")
                    if key and key not in os.environ:
                        os.environ[key] = val
            logging.getLogger("topbid-listener").info(f".env yuklandi: {os.path.abspath(path)}")
            return


load_env()

logging.basicConfig(level=logging.INFO, format="%(asctime)s [TopBid-Listener] %(message)s")
log = logging.getLogger("topbid-listener")

API_KEY = os.environ.get("STARKERAK_API_KEY", "")
NEXT_URL = os.environ.get("NEXT_INTERNAL_URL", "http://localhost:3000/api/payments/internal")
SECRET = os.environ.get("INTERNAL_PAYMENT_SECRET", "topbid_internal_2026_x7k")
WSS_URL = os.environ.get("STARKERAK_WSS", "wss://check.paystars.uz/api/ws/payments")
REST_URL = WSS_URL.replace("wss://", "https://").replace("/api/ws/", "/api/")

STATE_FILE = os.path.join(os.path.dirname(__file__), ".last_payment_id")

# Qayta ulanish sozlamalari
RECONNECT_DELAYS = [2, 5, 10, 30, 60]  # sekundlar — ketma-ket xatolarda o'sadi


def load_last_id() -> int:
    try:
        if os.path.exists(STATE_FILE):
            with open(STATE_FILE) as f:
                return int(f.read().strip())
    except Exception:
        pass
    return 0


def save_last_id(pid: int):
    try:
        with open(STATE_FILE, "w") as f:
            f.write(str(pid))
    except Exception as e:
        log.error(f"last_id saqlashda xato: {e}")


async def forward_to_site(payment: dict) -> bool:
    """To'lov xabarini Next.js ichki webhook'iga yuborish."""
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(
                NEXT_URL,
                json={"secret": SECRET, "payment": payment},
                timeout=aiohttp.ClientTimeout(total=15),
            ) as resp:
                data = await resp.json()
                matched = data.get("matched")
                if matched:
                    log.info(
                        f"✅ To'lov MATCH: {payment.get('amount')} so'm → {data.get('profileName')} "
                        f"({data.get('position', '')}-o'rin)"
                    )
                else:
                    log.info(f"📤 To'lov yuborildi (match yo'q): {payment.get('amount')} so'm")
                return True
    except Exception as e:
        log.error(f"Saytga yuborishda xato: {e}")
        return False


async def try_sdk():
    """Rasmiy StarKerak SDK bilan ishga tushirish (agar o'rnatilgan bo'lsa)."""
    try:
        from starkerak import StarKerakClient

        client = StarKerakClient(API_KEY, last_payment_id=load_last_id() or None)

        @client.on_payment
        async def on_payment(payment):
            pid = payment.get("id")
            if pid:
                save_last_id(int(pid))
            log.info(
                f"💰 Yangi to'lov: {payment.get('amount')} so'm, "
                f"karta: ****{payment.get('card_last4', '????')}"
            )
            await forward_to_site(payment)

        log.info("StarKerak SDK bilan ishga tushdi (HumoCardBot tinglanmoqda)...")
        client.start_listening()
        return True
    except ImportError:
        return False
    except Exception as e:
        log.error(f"SDK xatosi: {e} — xom WebSocket'ga o'tamiz")
        return False


async def run_raw_ws():
    """Xom WebSocket — SDK yo'q bo'lsa yoki xato bersa."""
    last_id = load_last_id()
    fail_count = 0

    while True:
        url = f"{WSS_URL}?api_key={API_KEY}"
        if last_id:
            url += f"&last_payment_id={last_id}"

        try:
            log.info("StarKerak serveriga ulanilmoqda...")
            async with aiohttp.ClientSession() as session:
                async with session.ws_connect(url, heartbeat=30.0) as ws:
                    log.info("✅ Ulandi! HumoCardBot to'lovlarini kutmoqda...")
                    fail_count = 0  # muvaffaqiyatli ulanish — hisobni reset

                    async for msg in ws:
                        if msg.type == aiohttp.WSMsgType.TEXT:
                            try:
                                payment = json.loads(msg.data)
                            except Exception:
                                continue

                            pid = payment.get("id")
                            if pid and (not last_id or int(pid) > last_id):
                                last_id = int(pid)
                                save_last_id(last_id)
                                log.info(
                                    f"💰 Yangi to'lov: {payment.get('amount')} so'm, "
                                    f"karta: ****{payment.get('card_last4', '????')}"
                                )
                                # 3 marta qayta urinish bilan yuborish
                                for attempt in range(3):
                                    if await forward_to_site(payment):
                                        break
                                    await asyncio.sleep(2)
                        elif msg.type == aiohttp.WSMsgType.ERROR:
                            log.error(f"WS xato: {ws.exception()}")
                            break
        except Exception as e:
            delay = RECONNECT_DELAYS[min(fail_count, len(RECONNECT_DELAYS) - 1)]
            log.error(f"Ulanish xatosi: {e} — {delay} sekunddan keyin qayta urinish ({fail_count + 1})")
            fail_count += 1
            await asyncio.sleep(delay)


async def test_connection():
    """REST API orqali ulanishni tekshirish (birinchi marta)."""
    try:
        headers = {"X-API-Key": API_KEY}
        async with aiohttp.ClientSession() as session:
            async with session.get(
                f"{REST_URL}payments?limit=1", headers=headers,
                timeout=aiohttp.ClientTimeout(total=10),
            ) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    payments = data.get("payments", [])
                    if payments:
                        log.info(
                            f"🔑 API kalit ishlayapti! Oxirgi to'lov: {payments[0].get('amount')} so'm"
                        )
                    else:
                        log.info("🔑 API kalit ishlayapti! Hozircha to'lovlar yo'q")
                    return True
                else:
                    log.error(f"❌ API kalit xato (HTTP {resp.status})")
                    return False
    except Exception as e:
        log.warning(f"REST tekshiruv o'tmadi: {e} (WS baribir uriniladi)")
        return True


async def main():
    if not API_KEY:
        log.error("STARKERAK_API_KEY berilmagan! .env ni tekshiring")
        return

    log.info(f"Next.js manzili: {NEXT_URL}")
    log.info(f"StarKerak WSS: {WSS_URL}")

    await test_connection()

    # Avval SDK, keyin xom WS
    if not await try_sdk():
        log.info("Xom WebSocket rejimi")
        await run_raw_ws()


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        log.info("To'xtatildi")
