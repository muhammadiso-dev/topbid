#!/usr/bin/env python3
"""Katta komponentlarni i18n bilan yangilash (ma'lum almashtirishlar jadvali)."""
import re

def apply(path, replacements, add_i18n=True, add_lang_vars=None):
    with open(path) as f:
        src = f.read()

    if add_i18n and 'useI18n' not in src:
        # import qo'shish (oxirgi lucide importidan keyin)
        m = re.search(r'from "lucide-react";\n', src)
        if m:
            src = src.replace(m.group(0), m.group(0) + 'import { useI18n } from "@/lib/ustar/i18n";\n', 1)

    for old, new in replacements:
        if old in src:
            src = src.replace(old, new)
        else:
            print(f"  SKIP (topilmadi): {old[:60]!r}")

    # useI18n hook qo'shish — birinchi "const [" dan oldin
    if add_i18n and 'useI18n()' not in src:
        m = re.search(r'(\n  const \[)', src)
        if m:
            src = src.replace(m.group(1), '\n  const { t, lang } = useI18n();\n' + m.group(1), 1)

    # formatSom/formatCompactSom/timeAgo ga lang argumenti
    src = re.sub(r'formatSom\(([^,()]+)\)', r'formatSom(\1, lang)', src)
    src = re.sub(r'formatCompactSom\(([^,()]+)\)', r'formatCompactSom(\1, lang)', src)
    src = re.sub(r'timeAgo\(([^,()]+)\)', r'timeAgo(\1, lang)', src)

    with open(path, "w") as f:
        f.write(src)
    print(f"✅ {path} yangilandi")


# ============ FOOTER ============
apply("src/components/ustar/footer.tsx", [
    ('O\'zbekistondagi ta\'lim va IT mutaxassislar reytingi. O\'z o\'rinngizni egallang yoki\n              eng yaxshi mutaxassisni toping.',
     '{t("footer.desc")}'),
    ('Reytinglar', '{t("footer.rankings")}'),
    ('Platforma', '{t("footer.platform")}'),
    ('© 2026 TopBid.uz. Barcha huquqlar himoyalangan.', '{t("footer.copyright")}'),
    ('To\'lovlar Telegram bot orqali', '{t("footer.payments")}'),
    # Admin tugmasini olib tashlash (yashirish)
    ('''              <button
                onClick={() => setView({ name: "admin" })}
                className="flex items-center gap-1.5 text-[13px] font-semibold text-[#94836f] hover:text-[#b25e14] transition-colors cursor-pointer text-left"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Admin
              </button>
''', ''),
    ('import { GraduationCap, Briefcase, Info, ScrollText, ShieldCheck } from "lucide-react";',
     'import { GraduationCap, Briefcase, Info, ScrollText } from "lucide-react";'),
    # O'rganish/Yollash
    ('O\'rganish\n              </button>', '{t("home.tabEdu")}\n              </button>'),
    ('Yollash\n              </button>', '{t("home.tabIt")}\n              </button>'),
    ('>Haqida</button>', '>{t("nav.about")}</button>'),
    ('>Qoidalar</button>', '>{t("nav.rules")}</button>'),
], add_i18n=True)

# Footer'da footer o'zgarmasi kerak emas, lekin entryPrice ishlatilgan
with open("src/components/ustar/footer.tsx") as f:
    footer_src = f.read()
print("Footer ShieldCheck qoldiqlari:", "ShieldCheck" in footer_src)
