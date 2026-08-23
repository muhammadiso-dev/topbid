#!/usr/bin/env python3
"""profile-detail, about, rules, admin view'larıni i18n bilan yangilash."""
import re

def apply(path, replacements, hook_after=None):
    with open(path) as f:
        src = f.read()

    if 'useI18n' not in src:
        m = re.search(r'from "lucide-react";\n', src)
        if m:
            src = src.replace(m.group(0), m.group(0) + 'import { useI18n } from "@/lib/ustar/i18n";\n', 1)

    for old, new in replacements:
        if old in src:
            src = src.replace(old, new)
        else:
            print(f"  SKIP: {old[:70]!r}")

    # hook qo'shish
    if 'const { t, lang } = useI18n();' not in src and 'useI18n();' not in src:
        m = re.search(r'(\n  const \[)', src)
        if m:
            src = src.replace(m.group(1), '\n  const { t, lang } = useI18n();\n' + m.group(1), 1)

    src = re.sub(r'formatSom\(([^,()]+)\)', r'formatSom(\1, lang)', src)
    src = re.sub(r'formatCompactSom\(([^,()]+)\)', r'formatCompactSom(\1, lang)', src)
    src = re.sub(r'timeAgo\(([^,()]+)\)', r'timeAgo(\1, lang)', src)

    with open(path, "w") as f:
        f.write(src)
    print(f"✅ {path}")


# ==================== PROFILE DETAIL VIEW ====================
apply("src/components/ustar/profile-detail-view.tsx", [
    ('Reytingga qaytish\n        </Button>', '{t("detail.back")}\n        </Button>'),
    ('Profil topilmadi', '{t("detail.notFound")}'),
    ('{profile.categoryGroup ? `${profile.categoryGroup} · ${profile.categoryName}` : profile.categoryName}',
     '{profile.categoryGroup ? `${profile.categoryGroup} · ${profile.categoryName}` : profile.categoryName}'),
    ('{profile.subType === "center" ? "Ta\'lim markazi" : "Individual repetitor"}',
     '{profile.subType === "center" ? t("detail.center") : t("detail.individual")}'),
    ('label="Global o\'rin"', 'label={t("detail.globalRank")}'),
    ('label="Reyting summasi"', 'label={t("detail.bidAmount")}'),
    ('label="Ko\'rilgan"', 'label={t("detail.views")}'),
    ('label="Kliklar"', 'label={t("detail.clicks")}'),
    ('Bog\'lanish — {contact.label}', '{t("detail.contact")} {contact.label}'),
    ('O\'rnni yaxshilash\n          </Button>', '{t("detail.improve")}\n          </Button>'),
    ('Verifikatsiya ko\'rib chiqilmoqda\n                </h3>', '{t("detail.pendingTitle")}\n                </h3>'),
    ('''So\'rovingiz admin da. Hujjatlaringiz tekshirilgach, profilingizda ko\'k
                  «Tekshirilgan» belgisi paydo bo\'ladi (odatda 24 soat ichida).''',
     '{t("detail.pendingDesc")}'),
    ('«Tekshirilgan» profil bo\'ling\n                  </h3>', '{t("detail.getCta")}\n                  </h3>'),
    ('''Ko\'k belgi mijozlar ishonchini 2-3 barobar oshiradi. Diplom yoki
                    litsenziyani tasdiqlang — bir martalik to\'lov.''',
     '{t("detail.getDesc")}'),
    ('Verifikatsiyadan o\'tish\n                  </Button>', '{t("detail.verifyCta")}\n                  </Button>'),
    # Reviews bo'limi
    ('Sharhlar\n        </h2>', '{t("reviews.title")}\n        </h2>'),
    ('{reviews.length} ta sharh', '{reviews.length} {t("reviews.count")}'),
    ('Sharhlar bepul va reytingdagi o\'ringa ta\'sir qilmaydi — faqat ishonch uchun',
     '{t("reviews.free")}'),
    ('Hozircha sharh yo\'q — birinchi bo\'lib fikr bildiring!', '{t("reviews.empty")}'),
    ('Fikringizni qoldiring</h3>', '{t("reviews.leave")}</h3>'),
    ('''Siz bu profilga allaqachon sharh yozgansiz. Har bir foydalanuvchi bir profilga bir
              marta yozadi.''', '{t("reviews.already")}'),
    ('Ismingiz\n                </Label>', '{t("reviews.name")}\n                </Label>'),
    ('placeholder="Masalan: Aziza"', 'placeholder={t("reviews.namePlaceholder")}'),
    ('Baho\n                </Label>', '{t("reviews.rating")}\n                </Label>'),
    ('Sharh\n              </Label>', '{t("reviews.comment")}\n                </Label>'),
    ('placeholder="Xizmat sifati qanday edi?"', 'placeholder={t("reviews.commentPlaceholder")}'),
    ('{submitting ? "Yuborilmoqda..." : "Sharh yuborish"}',
     '{submitting ? t("reviews.submitting") : t("reviews.submit")}'),
    ('title: "Rahmat! 🌟", description: "Sharhingiz qo\'shildi."',
     'title: t("reviews.thanks") + " 🌟", description: t("reviews.added")'),
    ('title: "Baho bering", description: "Yulduzchalardan baho tanlang (1-5)"',
     'title: t("reviews.rateFirst"), description: t("reviews.rateFirstDesc")'),
    ('description: err instanceof Error ? err.message : "Sharh qo\'hnmadi"',
     'description: err instanceof Error ? err.message : t("reviews.error")'),
    ('description: err instanceof Error ? err.message : "Sharh qo\'shilmadi"',
     'description: err instanceof Error ? err.message : t("reviews.error")'),
    ('title: "Xatolik"', 'title: t("err.generic")'),
    ('description: data.message || "Admin 24 soat ichida ko\'rib chiqadi."',
     'description: data.message || t("toast.verifyDesc")'),
    ('title: "🛡️ So\'rov yuborildi!"', 'title: t("toast.verifyTitle")'),
])

print("\n=== ABOUT VIEW ===")
apply("src/components/ustar/about-view.tsx", [
    ('TopBid nima?</h1>', '{t("about.title")}</h1>'),
    ('Reytingga qaytish\n        </Button>', '{t("detail.back")}\n        </Button>'),
    ('{t("about.desc")}', '{t("about.desc")}'),
])
