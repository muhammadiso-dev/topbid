#!/usr/bin/env python
"""TopBid vizual audit — DOM o'lchovlari (VLM da'volarini tekshirish uchun)."""
import json
from playwright.sync_api import sync_playwright

BASE = "http://localhost:3000"
OUT = {}

def measure_viewport(page, label, w, h):
    res = {"viewport": f"{w}x{h}"}
    # Gorizontal overflow
    res["h_overflow"] = page.evaluate(
        "() => document.documentElement.scrollWidth - document.documentElement.clientWidth"
    )
    # Next.js dev tools tugmasi ('N')
    dev_btn = page.evaluate(
        """() => {
        const els = [...document.querySelectorAll('button, div, span')];
        const n = els.find(e => e.textContent.trim() === 'N' && getComputedStyle(e).position === 'fixed');
        if (!n) return null;
        const r = n.getBoundingClientRect();
        return {x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height)};
    }"""
    )
    res["dev_N_button"] = dev_btn
    # Tugma o'lchovlari
    res["targets"] = page.evaluate(
        """() => {
        const sels = [
            ["navbar_cta", "header button.bg-\\\\[\\\\#d97b29\\\\]"],
            ["hamburger", "header button[aria-label*='Menyu']"],
            ["hero_cta", "main section:first-of-type button"],
            ["banner_mobile_cta", "button.rounded-lg.bg-\\\\[\\\\#241c14\\\\]"],
            ["banner_desktop_cta", "button.h-10.px-4"],
        ];
        const out = {};
        for (const [k, s] of sels) {
            const e = document.querySelector(s);
            if (e) { const r = e.getBoundingClientRect(); out[k] = {w: Math.round(r.width), h: Math.round(r.height)}; }
        }
        // Filter pastki tablar (Barchasi/Markaz/Repetitor)
        const pills = [...document.querySelectorAll('button')].filter(b => ['Barchasi','Markaz','Repetitor'].includes(b.textContent.trim()));
        if (pills.length) {
            const r = pills[0].getBoundingClientRect();
            out["filter_pill_barchasi"] = {w: Math.round(r.width), h: Math.round(r.height), x: Math.round(r.x), y: Math.round(r.y)};
        }
        // Select triggerlar
        const trig = document.querySelector('[role=combobox]');
        if (trig) { const r = trig.getBoundingClientRect(); out["select_trigger"] = {w: Math.round(r.width), h: Math.round(r.height)}; }
        return out;
    }"""
    )
    # Banner ichki spacing
    res["banner_spacing"] = page.evaluate(
        """() => {
        const banner = [...document.querySelectorAll('div')].find(d => d.className.includes && d.className.includes('from-[#d97b29]'));
        if (!banner) return null;
        const r = banner.getBoundingClientRect();
        const desc = [...banner.querySelectorAll('p')][1];
        const cta = banner.querySelector('button');
        const units = banner.querySelectorAll('.min-w-\\\\[38px\\\\], [class*=min-w]');
        const g = {};
        g.banner = {h: Math.round(r.height), w: Math.round(r.width)};
        if (desc) g.desc_bottom = Math.round(desc.getBoundingClientRect().bottom);
        if (units.length) {
            const u = [...units].map(u => Math.round(u.getBoundingClientRect().top));
            g.countdown_top = Math.min(...u);
        }
        if (cta) {
            const cr = cta.getBoundingClientRect();
            g.cta_top = Math.round(cr.top);
            g.cta_h = Math.round(cr.height);
        }
        return g;
    }"""
    )
    # Dev N tugmasi filter pill bilan ustma-ust tushadimi
    if dev_btn and res["targets"].get("filter_pill_barchasi"):
        p = res["targets"]["filter_pill_barchasi"]
        n = dev_btn
        res["N_overlaps_pill"] = not (n["x"] + n["w"] < p["x"] or p["x"] + p["w"] < n["x"] or n["y"] + n["h"] < p["y"] or p["y"] + p["h"] < n["y"])
    return res

def measure_cards(page, label):
    """Reyting kartochkalari tuzilishi (scroll qilib topadi)."""
    return page.evaluate(
        """() => {
        const cards = [...document.querySelectorAll('article')];
        if (!cards.length) return {found: 0};
        const out = {found: cards.length, cards: []};
        cards.slice(0, 3).forEach((c, i) => {
            const r = c.getBoundingClientRect();
            const num = c.querySelector('span.text-4xl, span.text-2xl, span.text-xl');
            const av = c.querySelector('img, [class*=rounded-2xl], [class*=rounded-xl]');
            const price = [...c.querySelectorAll('p')].find(p => /so'm/.test(p.textContent));
            const name = c.querySelector('h3');
            const card = {idx: i + 1, w: Math.round(r.width), h: Math.round(r.height), has_top_badge: !!c.querySelector('[class*=absolute]')};
            if (num) card.num = {text: num.textContent.trim(), x: Math.round(num.getBoundingClientRect().x), size: getComputedStyle(num).fontSize};
            if (name) card.name = {text: name.textContent.trim().slice(0, 30)};
            if (price) card.price = {text: price.textContent.trim(), x: Math.round(price.getBoundingClientRect().x)};
            // kichik 'o'rin' yozuvi
            const ord = [...c.querySelectorAll('span')].find(s => s.textContent.trim() === "o'rin");
            if (ord) card.orin_label_size = getComputedStyle(ord).fontSize;
            // CTA
            const cta = [...c.querySelectorAll('button')].find(b => b.textContent.includes("O'rinni egallash"));
            if (cta) { const cr = cta.getBoundingClientRect(); card.cta = {h: Math.round(cr.height), w: Math.round(cr.width)}; }
            // truncate/line-clamp borliqi
            const trunc = c.querySelector('.truncate, .line-clamp-2');
            card.has_truncation_class = !!trunc;
            const cat = c.querySelector('.max-w-\\\\[55\\\\%\\\\]');
            if (cat) card.category_chip_truncates = true;
            out.cards.push(card);
        });
        return out;
    }"""
    )

with sync_playwright() as pw:
    browser = pw.chromium.launch()
    for label, w, h, dsf in [("mobile_390", 390, 844, 3), ("small_375", 375, 667, 2)]:
        ctx = browser.new_context(viewport={"width": w, "height": h}, device_scale_factor=dsf, is_mobile=True, has_touch=True)
        page = ctx.new_page()
        page.goto(BASE, wait_until="networkidle")
        page.wait_for_timeout(1500)
        OUT[label] = measure_viewport(page, label, w, h)
        # Kartochkalarga scroll
        page.evaluate("() => window.scrollBy(0, 1400)")
        page.wait_for_timeout(800)
        OUT[label]["cards"] = measure_cards(page, label)
        ctx.close()

    # Desktop 1440 — HOME view (berilgan skrinshotda detail page, lekin strukturani tekshiramiz)
    ctx = browser.new_context(viewport={"width": 1440, "height": 900})
    page = ctx.new_page()
    page.goto(BASE, wait_until="networkidle")
    page.wait_for_timeout(1500)
    OUT["desktop_1440_home"] = measure_viewport(page, "desktop", 1440, 900)
    OUT["desktop_1440_home"]["cards"] = measure_cards(page, "desktop")
    # Banner desktop ko'rinishi
    page.evaluate("() => window.scrollTo(0, 0)")
    page.wait_for_timeout(500)
    ctx.close()
    browser.close()

print(json.dumps(OUT, indent=2, ensure_ascii=False))
