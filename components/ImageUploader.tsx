"use client";

import { useRef, useState } from "react";
import { uploadImage } from "@/lib/client-api";

type Props = { images: string[]; onChange: (next: string[]) => void; uploadUrl: string; max?: number; onError?: (msg: string) => void };

/** Upload banyak gambar sekaligus; gambar pertama = sampul. Dipakai dashboard toko dan admin. */
export default function ImageUploader({ images, onChange, uploadUrl, max = 10, onError }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function pick(e: React.ChangeEvent<HTMLInputElement>) {
    let files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (!files.length) return;
    if (files.length > max - images.length) {
      files = files.slice(0, max - images.length);
      onError?.(`Maksimal ${max} gambar. Sebagian gambar tidak diupload.`);
    }
    setBusy(true);
    const results = await Promise.allSettled(files.map((f) => uploadImage(uploadUrl, f)));
    const ok = results.filter((r): r is PromiseFulfilledResult<string> => r.status === "fulfilled").map((r) => r.value);
    const failed = results.find((r): r is PromiseRejectedResult => r.status === "rejected");
    if (failed) onError?.((failed.reason as Error).message);
    onChange([...images, ...ok]);
    setBusy(false);
  }

  return (
    <>
      <div className="img-manager">
        {images.map((url, i) => (
          <div className="img-item" key={url + i}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt={`Gambar ${i + 1}`} />
            {i === 0 && <span className="cover">Sampul</span>}
            <button type="button" className="remove" title="Hapus gambar" onClick={() => onChange(images.filter((_, j) => j !== i))}>×</button>
          </div>
        ))}
        {images.length < max && (
          <button type="button" className="img-add" disabled={busy} onClick={() => input.current?.click()}>
            <span className="fs-4 lh-1">{busy ? "⏳" : "+"}</span>
            <span>{busy ? "Upload..." : "Tambah"}</span>
          </button>
        )}
      </div>
      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={pick} />
    </>
  );
}
