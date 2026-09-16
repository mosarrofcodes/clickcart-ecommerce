"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface ProfileUser {
  name: string;
  email: string;
  role: string;
}

export default function ProfileForm({ user }: { user: ProfileUser }) {
  const router = useRouter();
  const [info, setInfo] = useState({ name: user.name, email: user.email });
  const [savingInfo, setSavingInfo] = useState(false);
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
  });
  const [savingPassword, setSavingPassword] = useState(false);

  const saveInfo = async () => {
    if (!info.name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!info.email.trim().includes("@")) {
      toast.error("Please enter a valid email");
      return;
    }
    setSavingInfo(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: info.name.trim(), email: info.email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Failed to update profile");
        return;
      }
      toast.success("Profile updated");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSavingInfo(false);
    }
  };

  const savePassword = async () => {
    if (passwords.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    setSavingPassword(true);
    try {
      const res = await fetch("/api/user/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(passwords),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Failed to change password");
        return;
      }
      toast.success("Password changed");
      setPasswords({ currentPassword: "", newPassword: "" });
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <section className="border rounded-lg p-6 space-y-4">
        <h2 className="text-lg font-bold">Account Information</h2>
        <div className="space-y-1.5">
          <Label htmlFor="profile-name">Full Name</Label>
          <Input
            id="profile-name"
            value={info.name}
            onChange={(e) => setInfo({ ...info, name: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="profile-email">Email</Label>
          <Input
            id="profile-email"
            type="email"
            value={info.email}
            onChange={(e) => setInfo({ ...info, email: e.target.value })}
          />
        </div>
        <Button onClick={saveInfo} disabled={savingInfo}>
          {savingInfo && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Save Changes
        </Button>
      </section>

      <section className="border rounded-lg p-6 space-y-4">
        <h2 className="text-lg font-bold">Change Password</h2>
        <div className="space-y-1.5">
          <Label htmlFor="current-password">Current Password</Label>
          <Input
            id="current-password"
            type="password"
            value={passwords.currentPassword}
            onChange={(e) =>
              setPasswords({ ...passwords, currentPassword: e.target.value })
            }
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="new-password">New Password</Label>
          <Input
            id="new-password"
            type="password"
            value={passwords.newPassword}
            onChange={(e) =>
              setPasswords({ ...passwords, newPassword: e.target.value })
            }
          />
        </div>
        <Button onClick={savePassword} disabled={savingPassword} variant="outline">
          {savingPassword && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Update Password
        </Button>
      </section>
    </div>
  );
}