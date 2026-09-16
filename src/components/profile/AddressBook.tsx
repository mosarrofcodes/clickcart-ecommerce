"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Loader2,
  MapPin,
  Plus,
  Pencil,
  Trash2,
  Star,
} from "lucide-react";
import type { Address } from "@/types";

interface AddressBookProps {
  initialAddresses: Address[];
}

interface AddressFormState {
  name: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  zipCode: string;
}

const EMPTY_FORM: AddressFormState = {
  name: "",
  phone: "",
  address: "",
  city: "",
  district: "",
  zipCode: "",
};

export default function AddressBook({ initialAddresses }: AddressBookProps) {
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Address | null>(null);
  const [form, setForm] = useState<AddressFormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const startAdd = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setOpen(true);
  };

  const startEdit = (address: Address) => {
    setEditing(address);
    setForm({
      name: address.name,
      phone: address.phone,
      address: address.address,
      city: address.city,
      district: address.district,
      zipCode: address.zipCode ?? "",
    });
    setOpen(true);
  };

  const updateForm = (field: keyof AddressFormState) => (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async () => {
    for (const field of ["name", "phone", "address", "city", "district"] as const) {
      if (!form[field].trim()) {
        toast.error(
          `${field.charAt(0).toUpperCase() + field.slice(1)} is required`,
        );
        return;
      }
    }

    setSaving(true);
    try {
      const url = editing ? `/api/user/addresses/${editing.id}` : "/api/user/addresses";
      const res = await fetch(url, {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          zipCode: form.zipCode.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Failed to save address");
        return;
      }
      toast.success(editing ? "Address updated" : "Address added");
      setOpen(false);
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this address?")) return;
    try {
      const res = await fetch(`/api/user/addresses/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Failed to delete address");
        return;
      }
      toast.success("Address deleted");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    }
  };

  const setDefault = async (id: string) => {
    try {
      const res = await fetch(`/api/user/addresses/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDefault: true }),
      });
      if (!res.ok) {
        toast.error("Failed to set default address");
        return;
      }
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    }
  };

  return (
    <section className="border rounded-lg p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">Saved Addresses</h2>
          <p className="text-sm text-muted-foreground">
            Your delivery addresses for faster checkout
          </p>
        </div>
        <Button size="sm" onClick={startAdd}>
          <Plus className="w-4 h-4" />
          Add Address
        </Button>
      </div>

      {addresses.length === 0 ? (
        <p className="text-sm text-muted-foreground border border-dashed rounded-lg p-6 text-center">
          No saved addresses yet. Add one to speed up checkout.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {addresses.map((address) => (
            <div
              key={address.id}
              className="border rounded-lg p-4 space-y-2 relative"
            >
              {address.isDefault && (
                <span className="absolute top-2 right-2 inline-flex items-center gap-1 text-[10px] font-semibold bg-primary/10 text-primary rounded-full px-2 py-0.5">
                  <Star className="w-3 h-3 fill-current" />
                  DEFAULT
                </span>
              )}
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-muted-foreground" />
                <div className="text-sm space-y-0.5 pr-16">
                  <p className="font-medium">{address.name}</p>
                  <p className="text-muted-foreground">{address.phone}</p>
                  <p className="text-muted-foreground">
                    {address.address}
                  </p>
                  <p className="text-muted-foreground">
                    {address.city}
                    {address.district ? `, ${address.district}` : ""}
                    {address.zipCode ? ` - ${address.zipCode}` : ""}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                {!address.isDefault && (
                  <Button variant="ghost" size="xs" onClick={() => setDefault(address.id)}>
                    Set Default
                  </Button>
                )}
                <Button variant="ghost" size="xs" onClick={() => startEdit(address)}>
                  <Pencil className="w-3 h-3" />
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="xs"
                  className="text-destructive hover:text-destructive"
                  onClick={() => handleDelete(address.id)}
                >
                  <Trash2 className="w-3 h-3" />
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Address" : "Add Address"}</DialogTitle>
            <DialogDescription>
              Fill in the delivery details for this address.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="addr-name">Full Name</Label>
              <Input
                id="addr-name"
                value={form.name}
                onChange={updateForm("name")}
                placeholder="Recipient name"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="addr-phone">Phone</Label>
              <Input
                id="addr-phone"
                value={form.phone}
                onChange={updateForm("phone")}
                placeholder="01XXXXXXXXX"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="addr-address">Address</Label>
              <Input
                id="addr-address"
                value={form.address}
                onChange={updateForm("address")}
                placeholder="House, Road, Area"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="addr-city">City</Label>
              <Input
                id="addr-city"
                value={form.city}
                onChange={updateForm("city")}
                placeholder="Dhaka"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="addr-district">District</Label>
              <Input
                id="addr-district"
                value={form.district}
                onChange={updateForm("district")}
                placeholder="Dhaka"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="addr-zip">Postal Code (optional)</Label>
              <Input
                id="addr-zip"
                value={form.zipCode}
                onChange={updateForm("zipCode")}
                placeholder="1205"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editing ? "Save Changes" : "Add Address"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}