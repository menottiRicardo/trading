"use client";

import { useRef } from "react";
import { ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
}

export function ImageUpload({
  images,
  onChange,
  maxImages = 5,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const remaining = maxImages - images.length;
    if (remaining <= 0) return;

    const toRead = Array.from(files).slice(0, remaining);
    const readers = toRead.map(
      (file) =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        })
    );

    Promise.all(readers).then((dataUrls) => {
      onChange([...images, ...dataUrls]);
    });
  }

  function remove(index: number) {
    onChange(images.filter((_, i) => i !== index));
  }

  const canAdd = images.length < maxImages;

  return (
    <div className="flex flex-col gap-3">
      {images.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {images.map((src, i) => (
            <div key={i} className="group relative size-20 shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`Imagen ${i + 1}`}
                className="size-full rounded-md border object-cover"
              />
              <button
                type="button"
                onClick={() => remove(i)}
                className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100"
                aria-label="Eliminar imagen"
              >
                <X className="size-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {canAdd && (
        <>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
            // reset so the same file can be re-added after removal
            onClick={(e) => {
              (e.target as HTMLInputElement).value = "";
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-fit gap-2"
            onClick={() => inputRef.current?.click()}
          >
            <ImagePlus className="size-4" />
            Agregar imagen
            {maxImages > 1 && (
              <span className="text-xs text-muted-foreground">
                ({images.length}/{maxImages})
              </span>
            )}
          </Button>
        </>
      )}
    </div>
  );
}
