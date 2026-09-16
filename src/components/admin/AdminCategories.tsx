"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  description: string | null;
  _count: { products: number };
}

export default function AdminCategories({ categories }: { categories: AdminCategory[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", slug: "", description: "" });

  async function addCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Name is required");
    setSaving(true);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          slug: form.slug.trim() || undefined,
          description: form.description.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to create category");
      toast.success("Category created");
      setOpen(false);
      setForm({ name: "", slug: "", description: "" });
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create category");
    } finally {
      setSaving(false);
    }
  }

  async function remove(category: AdminCategory) {
    if (confirmId !== category.id) {
      setConfirmId(category.id);
      return;
    }
    setConfirmId(null);
    const res = await fetch(`/api/categories/${category.id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error ?? "Failed to delete category");
      return;
    }
    toast.success("Category deleted");
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {categories.length} categor{categories.length === 1 ? "y" : "ies"}
        </p>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button size="sm" />}>
            <Plus className="mr-2 h-4 w-4" />
            New Category
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={addCategory}>
              <DialogHeader>
                <DialogTitle>New Category</DialogTitle>
                <DialogDescription>
                  Add a category so products can be grouped and filtered.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="cat-name">Name</Label>
                  <Input
                    id="cat-name"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Electronics"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cat-slug">Slug</Label>
                  <Input
                    id="cat-slug"
                    value={form.slug}
                    onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                    placeholder="Auto-generated from name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cat-desc">Description</Label>
                  <Textarea
                    id="cat-desc"
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter className="mt-4">
                <Button type="submit" disabled={saving}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {categories.map((c) => (
          <div key={c.id} className="border rounded-lg p-4 bg-background flex items-start gap-3">
            {c.image ? (
              <Image
                src={c.image}
                alt={c.name}
                width={56}
                height={56}
                className="w-14 h-14 object-cover rounded-lg border"
              />
            ) : (
              <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center text-muted-foreground text-xs">
                {c.name.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium">{c.name}</p>
              <p className="text-xs text-muted-foreground truncate">/{c.slug}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {c._count.products} product{c._count.products === 1 ? "" : "s"}
              </p>
            </div>
            <Button
              variant={confirmId === c.id ? "destructive" : "ghost"}
              size="icon-sm"
              aria-label={confirmId === c.id ? `Confirm delete ${c.name}` : `Delete ${c.name}`}
              onClick={() => remove(c)}
            >
              <Trash2 />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}