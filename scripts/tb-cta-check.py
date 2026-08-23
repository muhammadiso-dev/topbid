#!/usr/bin/env python
"""Mobil kartochka CTA — wrap/overflow tekshiruvi (375px va 390px)."""
import json
from playwright.sync_api import sync_playwright

BASE = "http://localhost:3000"

with sync_playwright() as pw:
    browser = pw.chromium.launch()
    out = {}
    for label, w in [("375", 375), ("390", 390)]:
        ctx = browser.new_context(viewport={"width": w, "height": 800}, device_scale_factor=2, is_mobile=True, has_touch=True)
        page = ctx.new_page()
        page.goto(BASE, wait_until="networkidle")
        page.wait_for_timeout(1200)
        page.evaluate("() => window.scrollBy(0, 1500)")
        page.wait_for_timeout(1000)
        res = page.evaluate(
            """() => {
            const cards = [...document.querySelectorAll('article')];
            const out = [];
            cards.slice(0, 6).forEach((c, i) => {
                const cta = [...c.querySelectorAll('button')].find(b => b.textContent.includes("O'rinni egallash"));
                if (!cta) return;
                const r = cta.getBoundingClientRect();
                // matn qatorlari soni — span'larni tekshirish
                const h = Math.round(r.height);
                const cs = getComputedStyle(cta);
                out.push({
                    card: i + 1,
                    cta_h: h,
                    cta_w: Math.round(r.width),
                    font: cs.fontSize,
                    overflow: cta.scrollWidth > cta.clientWidth + 1 || cta.scrollHeight > cta.clientHeight + 1,
                    text: cta.textContent.trim().replace(/\\s+/g, ' ').slice(0, 45),
                });
            });
            return out;
        }"""
        )
        out[label] = res
        ctx.close()
    browser.close()
print(json.dumps(out, indent=2, ensure_ascii=False))
