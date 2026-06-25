"use client";

import { useEffect, useState, useCallback } from "react";

type GalleryImage = {
  src: string;
  alt: string;
  caption?: string | null;
};

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-6 w-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  );
}

function ChevronLeftIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-6 w-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-6 w-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}

function Lightbox({
  images,
  startIndex,
  onClose,
}: {
  images: GalleryImage[];
  startIndex: number;
  onClose: () => void;
}) {
  const [current, setCurrent] = useState(startIndex);

  const prev = useCallback(() => setCurrent((i) => (i - 1 + images.length) % images.length), [images.length]);
  const next = useCallback(() => setCurrent((i) => (i + 1) % images.length), [images.length]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    }
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose, prev, next]);

  const img = images[current];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute right-4 top-4 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-surface/10 text-white transition hover:bg-surface/20"
        aria-label="Close"
      >
        <CloseIcon />
      </button>

      {/* Prev */}
      {images.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); prev(); }}
          className="absolute left-4 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-surface/10 text-white transition hover:bg-surface/20"
          aria-label="Previous image"
        >
          <ChevronLeftIcon />
        </button>
      )}

      {/* Image */}
      <div
        className="relative mx-16 flex max-h-[90vh] max-w-[90vw] flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={img.src}
          alt={img.alt}
          className="max-h-[80vh] max-w-full object-contain shadow-2xl"
        />
        {img.caption && (
          <p className="mt-3 text-center text-sm text-slate-300">{img.caption}</p>
        )}
        {images.length > 1 && (
          <p className="mt-2 text-xs text-ink-soft">{current + 1} / {images.length}</p>
        )}
      </div>

      {/* Next */}
      {images.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); next(); }}
          className="absolute right-4 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-surface/10 text-white transition hover:bg-surface/20"
          aria-label="Next image"
        >
          <ChevronRightIcon />
        </button>
      )}
    </div>
  );
}

export function GalleryLightbox({ images }: { images: GalleryImage[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  if (images.length === 0) return null;

  return (
    <>
      <ul className="grid gap-4 sm:grid-cols-2">
        {images.map((img, index) => (
          <li key={index} className="group overflow-hidden border border-bridge/40">
            <button
              className="w-full cursor-pointer text-left"
              onClick={() => setActiveIndex(index)}
              aria-label={`View ${img.alt} fullscreen`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.src}
                alt={img.alt}
                className="w-full object-contain transition-opacity duration-200 group-hover:opacity-90"
              />
              {img.caption && (
                <p className="border-t border-bridge/40 px-4 py-3 text-sm leading-relaxed text-ink-soft">
                  {img.caption}
                </p>
              )}
            </button>
          </li>
        ))}
      </ul>

      {activeIndex !== null && (
        <Lightbox
          images={images}
          startIndex={activeIndex}
          onClose={() => setActiveIndex(null)}
        />
      )}
    </>
  );
}
