"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Home,
  Clock,
  Mic,
  BookOpen,
  Network,
  CreditCard,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";

const navigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "Search with AI", href: "/chat", icon: MessageCircle },
  { name: "Timeline", href: "/timeline", icon: Clock },
  { name: "Podcast", href: "/podcast", icon: Mic },
  { name: "Comic", href: "/comic", icon: BookOpen },
  { name: "Graph", href: "/graph", icon: Network },
  { name: "Flash Cards", href: "/flashcards", icon: CreditCard },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 z-40 h-screen border-r bg-card/95 backdrop-blur-sm transition-all duration-300",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      <div className="flex h-full flex-col gap-2 overflow-y-auto px-3 py-4">
        {/* Logo */}
        <Link href="/" className={cn("mb-6 flex items-center px-3", isCollapsed ? "justify-center" : "justify-center")}>
          {isCollapsed ? (
            <Image
              src="/brand/logos/small.svg"
              alt="NASA Space Apps logo"
              width={40}
              height={40}
              priority
              className="transition-smooth"
            />
          ) : (
            <Image
              src="/brand/logos/default.svg"
              alt="NASA Space Apps logo"
              width={180}
              height={54}
              priority
              className="transition-smooth"
            />
          )}
        </Link>

        {/* Toggle Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="mb-2 rounded-xl hover:bg-primary/10"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4 mr-2" />
              <span className="text-xs">Collapse</span>
            </>
          )}
        </Button>

        {/* Navigation */}
        <nav className="flex-1 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-smooth tap-scale",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  isCollapsed && "justify-center"
                )}
                title={isCollapsed ? item.name : undefined}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!isCollapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        {!isCollapsed && (
          <div className="border-t pt-4">
            <p className="px-3 text-xs text-muted-foreground">
              NASA Space Apps Challenge 2025
            </p>
            <p className="px-3 text-xs text-muted-foreground mt-1">
              Exploring space biology for everyone
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}
