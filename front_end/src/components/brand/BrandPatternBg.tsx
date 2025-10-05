"use client";

export function BrandPatternBg({ className = "" }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 ${className}`}
      style={{
        backgroundImage: `url('/brand/patterns/scientific.svg')`,
        backgroundRepeat: "repeat",
        backgroundSize: "400px 400px",
        opacity: 0.25,
      }}
      aria-hidden="true"
    />
  );
}
