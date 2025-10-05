'use client';

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

interface MarkdownProps {
  content: string;
  className?: string;
}

export function Markdown({ content, className }: MarkdownProps) {
  return (
    <ReactMarkdown
      className={cn(
        "space-y-3 text-sm leading-relaxed text-white/90",
        "[&_h1]:mt-6 [&_h1]:text-2xl [&_h1]:font-semibold [&_h1]:text-white",
        "[&_h2]:mt-4 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-white",
        "[&_h3]:mt-3 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-white",
        "[&_ul]:ml-5 [&_ul]:list-disc [&_ol]:ml-5 [&_ol]:list-decimal",
        "[&_li]:text-white/90",
        "[&_strong]:text-white",
        "[&_a]:text-primary [&_a]:underline [&_a:hover]:text-primary/80",
        "[&_code]:rounded [&_code]:bg-black/30 [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-xs [&_code]:text-emerald-200",
        className
      )}
      remarkPlugins={[remarkGfm]}
    >
      {content}
    </ReactMarkdown>
  );
}
