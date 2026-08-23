#!/usr/bin/env python
"""Dev-tools 'N' tugmasi overlap tekshiruvi + mobil kartochka zonasi skrinshotlari."""
import json
from playwright.sync_api import sync_playwright

BASE = "http://localhost:3000"
OUT = {}

with sync_playwright() as pw:
    browser = pw.chromium.launch()
    for label, w, h in [("v390", 390, 844), ("v375", 375, 667)]:
        ctx = browser.new_context(viewport={"width": w, "height": h}, device_scale_factor=2, is_mobile=True, has_touch=True)
        page = ctx.new_page()
        page.goto(BASE, wait_until="networkidle")
        page.wait_for_timeout(2500)  # dev indicator kechikib chiqadi
        # nextjs-portal shadow DOM ichidagi tugma
        info = page.evaluate(
            """() => {
            const portal = document.querySelector('nextjs-portal');
            if (!portal || !portal.shadowRoot) return {portal: false};
            const root = portal.shadowRoot;
            const btns = [...root.querySelectorAll('button')];
            const out = {portal: true, buttons: btns.map(b => {
                const r = b.getBoundingClientRect();
                return {text: (b.textContent || '').trim().slice(0, 12), x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height)};
            })};
            return out;
        }"""
        )
        # 'Barchasi' pill va banner CTA koordinatalari
        targets = page.evaluate(
            """() => {
            const pills = [...document.querySelectorAll('button')].filter(b => b.textContent.trim() === 'Barchasi');
            const cta = [...document.querySelectorAll('button')].find(b => b.textContent.includes('Chegirmadan foydalanish'));
            const o = {};
            if (pills[0]) { const r = pills[0].getBoundingClientRect(); o.barchasi = {x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height)}; }
            if (cta) { const r = cta.getBoundingClientRect(); o.banner_cta = {x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height)}; }
            return o;
        }"""
        )
        OUT[label] = {"dev_indicator": info, "targets": targets}
        # Banner + filtr pillar zonasini suratga olish (viewport)
        page.screenshot(path=f"tb-{label}-top.png")
        # Kartochka zonasiga scroll va surat
        page.evaluate("() => window.scrollBy(0, 1500)")
        page.wait_for_timeout(1200)
        page.screenshot(path=f"tb-{label}-cards.png")
        ctx.close()
    browser.close()

print(json.dumps(OUT, indent=2, ensure_ascii=False))
