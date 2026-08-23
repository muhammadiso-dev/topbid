"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Loader2 } from "lucide-react";
import { useI18n } from "@/lib/ustar/i18n";
import { CITIES, CATEGORY_GROUP_ORDER } from "@/lib/ustar/constants";
import type { CategoryDTO, ProfileDTO } from "@/lib/ustar/types";
import { cn } from "@/lib/utils";

interface EditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: ProfileDTO;
  editToken: string;
  onSaved: () => void;
}

/** Profil tahrirlash modali (editToken bilan) */
export function EditModal({ open, onOpenChange, profile, editToken, onSaved }: EditModalProps) {
  const { t } = useI18n();
  const { toast } = useToast();

  const [name, setName] = useState(profile.name);
  const [description, setDescription] = useState(profile.description);
  const [city, setCity] = useState(profile.city);
  const [categoryId, setCategoryId] = useState(profile.categoryId);
  const [imageUrl, setImageUrl] = useState(profile.imageUrl || "");
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<CategoryDTO[]>([]);

  useEffect(() => {
    setName(profile.name);
    setDescription(profile.description);
    setCity(profile.city);
    setCategoryId(profile.categoryId);
    setImageUrl(profile.imageUrl || "");
  }, [profile]);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d: { categories: CategoryDTO[] }) => setCategories(d.categories))
      .catch(() => null);
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/profiles/${profile.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ editToken, name, description, city, categoryId, imageUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Xatolik");
      toast({ title: `✅ ${t("edit.saved")}`, description: t("edit.savedDesc") });
      onOpenChange(false);
      onSaved();
    } catch (e) {
      toast({
        title: t("err.generic"),
        description: e instanceof Error ? e.message : t("err.server"),
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const groups = (() => {
    const map = new Map<string, CategoryDTO[]>();
    for (const c of categories) {
      const key = c.group || "Boshqa";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(c);
    }
    const orderMap = new Map(CATEGORY_GROUP_ORDER.map((g, i) => [g, i]));
    return Array.from(map.entries()).sort(
      (a, b) =>
        (orderMap.get(a[0]) ?? 99) - (orderMap.get(b[0]) ?? 99) || a[0].localeCompare(b[0])
    );
  })();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white dark:bg-[#201a14] border-[#e8ddd0] rounded-2xl max-w-md p-0 overflow-hidden max-h-[90vh] overflow-y-auto scrollbar-thin gap-0 block">
        <DialogHeader className="p-5 pb-4 border-b border-[#f0e6da] sticky top-0 bg-white z-10">
          <DialogTitle className="text-lg font-extrabold text-[#241c14] dark:text-[#f2ebe2] flex items-center gap-2">
            <Pencil className="w-5 h-5 text-[#d97b29]" />
            {t("edit.title")}
          </DialogTitle>
          <DialogDescription className="text-[#6b5d4d] dark:text-[#a3937f] text-sm truncate">{profile.name}</DialogDescription>
        </DialogHeader>

        <div className="p-5 space-y-4">
          <div>
            <Label htmlFor="edit-name" className="text-[13px] font-bold text-[#574634] dark:text-[#c9bba7] mb-1.5 block">
              {t("form.name")}
            </Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={60}
              className="h-11 bg-white text-sm font-semibold rounded-lg border-[#e8ddd0]"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <Label htmlFor="edit-desc" className="text-[13px] font-bold text-[#574634] dark:text-[#c9bba7]">
                {t("form.description")}
              </Label>
              <span className="text-[11px] font-bold text-[#94836f] dark:text-[#8a7a68] tabular-nums">{description.length}/300</span>
            </div>
            <Textarea
              id="edit-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={300}
              rows={3}
              className="bg-white text-sm font-medium rounded-lg resize-none border-[#e8ddd0]"
            />
          </div>

          <div>
            <Label className="text-[13px] font-bold text-[#574634] dark:text-[#c9bba7] mb-1.5 block">{t("form.categoryLabel")}</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger className="h-11 bg-white text-sm font-semibold rounded-lg border-[#e8ddd0]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-[#201a14] border-[#e8ddd0] max-h-72">
                {groups.map(([group, items]) => (
                  <SelectGroup key={group}>
                    <SelectLabel className="text-[11px] font-extrabold uppercase tracking-wide text-[#b25e14]">
                      {group}
                    </SelectLabel>
                    {items.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-[13px] font-bold text-[#574634] dark:text-[#c9bba7] mb-1.5 block">{t("form.city")}</Label>
            <Select value={city} onValueChange={setCity}>
              <SelectTrigger className="h-11 bg-white text-sm font-semibold rounded-lg border-[#e8ddd0]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-[#201a14] border-[#e8ddd0] max-h-72">
                {CITIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="edit-logo" className="text-[13px] font-bold text-[#574634] dark:text-[#c9bba7] mb-1.5 block">
              {t("form.logo")} <span className="text-[#94836f] dark:text-[#8a7a68] font-medium">({t("form.optional")})</span>
            </Label>
            <Input
              id="edit-logo"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://... yoki /api/media/..."
              className="h-11 bg-white text-sm font-semibold rounded-lg border-[#e8ddd0]"
            />
          </div>

          <Button
            onClick={save}
            disabled={saving || name.trim().length < 2}
            className="w-full h-12 bg-[#d97b29] hover:bg-[#c2691f] text-white font-extrabold rounded-xl text-sm"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t("edit.saving")}
              </>
            ) : (
              t("edit.save")
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
