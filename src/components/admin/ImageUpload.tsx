"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Loader2, UploadCloud } from "lucide-react";

interface ImageUploadProps {
  value?: string;
  onUploaded: (url: string) => void;
}

export default function ImageUpload({ value, onUploaded }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB.");
      return;
    }
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      onUploaded(data.url);
      toast.success("Image uploaded!");
    } catch {
      toast.error("Upload failed. Check your Cloudinary credentials.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-3">
      {value ? (
        <div className="relative overflow-hidden rounded-lg border">
          <Image
            src={value}
            alt="Uploaded preview"
            width={400}
            height={300}
            className="object-cover"
          />
        </div>
      ) : (
        <div className="flex h-40 items-center justify-center rounded-lg border border-dashed bg-muted/30">
          {uploading ? (
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          ) : (
            <span className="text-sm text-muted-foreground">No image yet</span>
          )}
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
      >
        {uploading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <UploadCloud className="mr-2 h-4 w-4" />
        )}
        {uploading ? "Uploading..." : value ? "Replace Image" : "Upload Image"}
      </Button>
    </div>
  );
}