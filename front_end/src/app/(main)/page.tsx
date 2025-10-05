"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BrandPatternBg } from "@/components/brand/BrandPatternBg";
import {
  Clock,
  Mic,
  BookOpen,
  Network,
  CreditCard,
  ArrowRight,
  Sparkles,
  Search,
  Zap,
} from "lucide-react";

const features = [
  {
    name: "Timeline",
    description: "Explore space biology research through time with interactive visualizations",
    icon: Clock,
    href: "/timeline",
    color: "from-blue-500 to-cyan-500",
  },
  {
    name: "Podcast Creator",
    description: "Transform any topic into engaging 2-3 exchange dialogues",
    icon: Mic,
    href: "/podcast",
    color: "from-purple-500 to-pink-500",
  },
  {
    name: "Comic Generator",
    description: "Turn space biology stories into visual comics",
    icon: BookOpen,
    href: "/comic",
    color: "from-amber-500 to-orange-500",
  },
  {
    name: "Knowledge Graph",
    description: "Discover connections between studies, topics, and missions",
    icon: Network,
    href: "/graph",
    color: "from-green-500 to-emerald-500",
  },
  {
    name: "Flash Cards",
    description: "Learn key concepts with interactive flash cards",
    icon: CreditCard,
    href: "/flashcards",
    color: "from-red-500 to-rose-500",
  },
];

export default function HomePage() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      router.push(`/chat?q=${encodeURIComponent(trimmed)}`);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#0066FF] to-[#001E3C]">
      {/* Pattern Overlay */}
      <BrandPatternBg className="fixed inset-0 text-white/50" />

      {/* Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="px-6 pt-20 pb-12">
          <div className="mx-auto max-w-5xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-white backdrop-blur-sm border border-white/20">
              <Sparkles className="h-4 w-4" />
              NASA Space Apps Challenge 2025
            </div>
            
            <h1 className="mb-6 text-5xl md:text-6xl lg:text-7xl text-white drop-shadow-lg">
              Explore Space Biology
            </h1>
            
            <p className="mb-8 text-xl md:text-2xl text-white/90 drop-shadow max-w-3xl mx-auto">
              Your AI-powered gateway to space biology research
            </p>

            <p className="text-lg text-white/80 max-w-2xl mx-auto mb-12 drop-shadow">
              Ask questions, generate content, and explore interactive visualizations 
              to understand life science in space
            </p>
          </div>
        </section>

        {/* Search Bar Section */}
        <section className="px-6 pb-16">
          <div className="mx-auto max-w-3xl">
            <Card className="rounded-3xl border-white/20 bg-white/10 backdrop-blur-xl shadow-2xl">
              <CardContent className="pt-8 pb-8">
                <form onSubmit={handleSearch} className="relative">
                  <div className="relative">
                    <Search className="absolute left-6 top-1/2 h-6 w-6 -translate-y-1/2 text-white/60" />
                    <Input
                      type="text"
                      placeholder="Ask a query... (e.g., How do plants grow in space?)"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className="h-16 pl-16 pr-32 text-lg rounded-2xl bg-white/20 border-white/30 text-white placeholder:text-white/50 focus-visible:ring-white/50 focus-visible:ring-offset-0 backdrop-blur"
                    />
                    <Button
                      type="submit"
                      size="lg"
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl gap-2 bg-white text-primary hover:bg-white/90 shadow-lg"
                    >
                      <Zap className="h-5 w-5" />
                      Ask
                    </Button>
                  </div>
                </form>
                
                <div className="mt-4 flex flex-wrap gap-2 justify-center">
                  {["Bone density in space", "Plant growth experiments", "DNA radiation effects"].map((suggestion) => (
                    <Button
                      key={suggestion}
                      variant="ghost"
                      size="sm"
                      onClick={() => setQuery(suggestion)}
                      className="rounded-full bg-white/10 hover:bg-white/20 text-white/90 text-xs backdrop-blur border border-white/20"
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Features Grid */}
        <section className="px-6 pb-16">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl md:text-4xl font-bold text-white drop-shadow-lg">
                Explore Our Tools
              </h2>
              <p className="text-lg text-white/80 drop-shadow">
                Interactive features to discover space biology
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <Link key={feature.name} href={feature.href}>
                  <Card className="group h-full rounded-2xl transition-all duration-300 hover:shadow-2xl tap-scale cursor-pointer bg-white/10 backdrop-blur-xl border-white/20 hover:bg-white/20">
                    <CardHeader>
                      <div
                        className={`mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.color} transition-all duration-300 group-hover:scale-110 shadow-lg`}
                      >
                        <feature.icon className="h-7 w-7 text-white" />
                      </div>
                      <CardTitle className="text-xl text-white group-hover:text-white transition-smooth">
                        {feature.name}
                      </CardTitle>
                      <CardDescription className="text-base text-white/70">
                        {feature.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button
                        variant="ghost"
                        className="group-hover:gap-3 gap-2 p-0 h-auto text-white hover:text-white transition-smooth hover:bg-transparent"
                      >
                        Get Started
                        <ArrowRight className="h-4 w-4 transition-all duration-300 group-hover:translate-x-1" />
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="px-6 pb-20">
          <div className="mx-auto max-w-4xl">
            <Card className="rounded-3xl bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
              <CardContent className="py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                  <div>
                    <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                      100+
                    </div>
                    <p className="text-white/70">Research Studies</p>
                  </div>
                  <div>
                    <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                      5
                    </div>
                    <p className="text-white/70">Interactive Tools</p>
                  </div>
                  <div>
                    <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                      ∞
                    </div>
                    <p className="text-white/70">Learning Possibilities</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}
