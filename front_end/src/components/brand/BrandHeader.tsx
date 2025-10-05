"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export function BrandHeader() {
  const [logoVariant, setLogoVariant] = useState<
    "default" | "motif" | "small"
  >("default");

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setLogoVariant("small");
      } else if (width < 1024) {
        setLogoVariant("motif");
      } else {
        setLogoVariant("default");
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const logoSizes = {
    default: { width: 200, height: 60 },
    motif: { width: 120, height: 50 },
    small: { width: 40, height: 40 },
  };

  const { width, height } = logoSizes[logoVariant];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src={`/brand/logos/${logoVariant}.svg`}
            alt="NASA Space Apps logo"
            width={width}
            height={height}
            priority
            className="transition-smooth"
          />
        </Link>
        <p className="hidden text-sm text-muted-foreground md:block">
          Exploring space biology for everyone
        </p>
      </div>
    </header>
  );
}
