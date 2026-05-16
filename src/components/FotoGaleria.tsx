"use client";

import { useState, useRef } from "react";
import Image from "next/image";

type Props = {
  fotos: string[];
  onUpload?: (urls: string[]) => void;
  uploading?: boolean;
};

export default function FotoGaleria({ fotos, onUpload, uploading }: Props) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function prev() {
    if (lightboxIndex === null) return;
    setLightboxIndex(lightboxIndex === 0 ? fotos.length - 1 : lightboxIndex - 1);
  }

  function next() {
    if (lightboxIndex === null) return;
    setLightboxIndex(lightboxIndex === fotos.length - 1 ? 0 : lightboxIndex + 1);
  }

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || !onUpload) return;
    const urls: string[] = [];
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (res.ok) {
        const { url } = await res.json();
        urls.push(url);
      }
    }
    if (urls.length > 0) onUpload(urls);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <>
      <div className="card p-4 space-y-3">
        {fotos.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {fotos.map((url, i) => (
              <div
                key={i}
                className="relative aspect-[4/3] rounded-lg overflow-hidden cursor-pointer group"
                onClick={() => setLightboxIndex(i)}
              >
                <Image src={url} alt={`Foto ${i + 1}`} fill sizes="(max-width: 640px) 50vw, 33vw" className="object-cover transition-transform group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted">Nenhuma foto adicionada.</p>
        )}

        {onUpload && (
          <label className="btn-secondary inline-flex items-center gap-2 cursor-pointer text-sm">
            {uploading ? "Enviando..." : "Adicionar fotos"}
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFiles}
              className="hidden"
              disabled={uploading}
            />
          </label>
        )}
      </div>

      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={() => setLightboxIndex(null)}>
          <div className="relative max-w-[90vw] max-h-[90vh] flex items-center" onClick={(e) => e.stopPropagation()}>
            {fotos.length > 1 && (
              <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-navy w-9 h-9 rounded-full text-lg font-bold z-10">
                &lsaquo;
              </button>
            )}
            <Image
              src={fotos[lightboxIndex]}
              alt={`Foto ${lightboxIndex + 1}`}
              width={1600}
              height={1200}
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
            />
            {fotos.length > 1 && (
              <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-navy w-9 h-9 rounded-full text-lg font-bold z-10">
                &rsaquo;
              </button>
            )}
            <div className="absolute top-3 right-3 flex gap-2">
              <a
                href={fotos[lightboxIndex]}
                download
                className="bg-white/90 hover:bg-white text-navy px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                Baixar
              </a>
              <button
                onClick={() => setLightboxIndex(null)}
                className="bg-white/90 hover:bg-white text-navy w-8 h-8 rounded-lg text-lg font-bold transition-colors"
              >
                &times;
              </button>
            </div>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs px-3 py-1 rounded-full">
              {lightboxIndex + 1} / {fotos.length}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
