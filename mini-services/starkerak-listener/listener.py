#!/usr/bin/env python3
"""
TopBid — StarKerak to'lov listeneri.

HumoCardBot (Telegram) → StarKerak (wss://check.paystars.uz) → shu listener → Next.js /api/payments/internal

Har real to'lov tushganda xabar avtomatik o'qiladi va saytga yuboriladi.
Sayt to'lovni kutilayotgan profil bilan match qiladi va admin guruhga xabar yuboradi.

Ishga tushirish: mini-services/starkerak-listener/ papkasida `bun run dev`
"""

import asyncio
import json
import logging
import os
import sys
import time

import aiohttp


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
            logging.getLogger("topbid-listener").info(f".env yuklandi: {path}")
            return


load_env()

# starkerak pip user site-packages'da bo'lishi mumkin
for p in (
    os.path.expanduser("~/.local/lib/python3.11/site-packages"),
    os.path.expanduser("~/.local/lib/python3.12/site-packages"),
    os.path.expanduser("~/.local/lib/python3.10/site-packages"),
):
    if os.path.isdir(p):
        sys.path.insert(0, p)

try:
    from starkerak import StarKerakClient
    HAS_SDK = True
except ImportError:
    HAS_SDK = False
    # Fallback: xom WebSocket
    pass

API_KEY = os.environ.get("STARKERAK_API_KEY", "")
NEXT_URL = os.environ.get("NEXT_INTERNAL_URL", "http://localhost:3000/api/payments/internal")
SECRET = os.environ.get("INTERNAL_PAYMENT_SECRET", "topbid_internal_2026_x7k")
WSS_URL = os.environ.get("STARKERAK_WSS", "wss://check.paystars.uz/api/ws/payments")

logging.basicConfig(level=logging.INFO, format="%(asctime)s [TopBid-Listener] %(message)s")
log = logging.getLogger("topbid-listener")


async def forward_to_site(payment: dict):
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
                    log.info(f"✅ To'lov yuborildi va MATCH: {payment.get('amount')} so'm → {data.get('profileName')}")
                else:
                    log.info(f"📤 To'lov yuborildi (match yo'q): {payment.get('amount')} so'm")
    except Exception as e:
        log.error(f"Saytga yuborishda xato: {e}")


async def run_with_sdk():
    """Rasmiy StarKerak SDK bilan (qayta ulanishlar SDK ichida)."""
    client = StarKerakClient(API_KEY)

    @client.on_payment
    async def on_payment(payment):
        log.info(f"💰 Yangi to'lov: {payment.get('amount')} so'm, karta: ****{payment.get('card_last4', '????')}")
        await forward_to_site(payment)

    log.info("StarKerak SDK bilan ishga tushdi (HumoCardBot tinglanmoqda)...")
    client.start_listening()


async def run_raw_ws():
    """SDK yo'q bo'lsa — xom WebSocket (qayta ulanish mantiqi bilan)."""
    last_id_file = os.path.join(os.path.dirname(__file__), ".last_payment_id")
    last_id = None
    if os.path.exists(last_id_file):
        try:
            with open(last_id_file) as f:
                last_id = int(f.read().strip())
        except Exception:
            pass

    while True:
        url = f"{WSS_URL}?api_key={API_KEY}"
        if last_id:
            url += f"&last_payment_id={last_id}"
        try:
            log.info("StarKerak serveriga ulanilmoqda...")
            async with aiohttp.ClientSession() as session:
                async with session.ws_connect(url, heartbeat=30.0) as ws:
                    log.info("✅ Ulandi! HumoCardBot to'lovlarini kutmoqda...")
                    async for msg in ws:
                        if msg.type == aiohttp.WSMsgType.TEXT:
                            try:
                                payment = json.loads(msg.data)
                            except Exception:
                                continue
                            pid = payment.get("id")
                            if pid and (last_id is None or int(pid) > last_id):
                                last_id = int(pid)
                                try:
                                    with open(last_id_file, "w") as f:
                                        f.write(str(last_id))
                                except Exception:
                                    pass
                                log.info(f"💰 Yangi to'lov: {payment.get('amount')} so'm, karta: ****{payment.get('card_last4', '????')}")
                                await forward_to_site(payment)
                        elif msg.type == aiohttp.WSMsgType.ERROR:
                            log.error(f"WS xato: {ws.exception()}")
                            break
        except Exception as e:
            log.error(f"Ulanish xatosi: {e} — 10 sekunddan keyin qayta urinish")
            await asyncio.sleep(10)


async def main():
    if not API_KEY:
        log.error("STARKERAK_API_KEY berilmagan!")
        return
    log.info(f"Next.js manzili: {NEXT_URL}")
    if HAS_SDK:
        await run_with_sdk()
    else:
        log.warning("starkerak SDK topilmadi — xom WebSocket rejimi")
        await run_raw_ws()


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        log.info("To'xtatildi")
