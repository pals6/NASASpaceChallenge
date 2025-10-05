"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { getFunFacts } from "@/lib/api";

export function FactsMarquee() {
  const facts = getFunFacts();
  const [currentFact, setCurrentFact] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFact((prev) => (prev + 1) % facts.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative overflow-hidden rounded-xl bg-primary/10 px-6 py-4 border border-primary/20">
      <div className="flex items-center gap-3">
        <Sparkles className="h-5 w-5 text-primary flex-shrink-0" />
        <div className="flex-1">
          <p className="text-xs font-semibold text-primary mb-1">
            Did you know?
          </p>
          <p className="text-sm text-foreground">
            {facts[currentFact]}
          </p>
        </div>
      </div>
    </div>
  );
}
