"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, BookOpen, Download, Wand2 } from "lucide-react";
import { useAppContext } from "@/contexts/AppContext";
import { generateComic, getComicExamples, ComicPage as ComicPageType } from "@/lib/api";

export default function ComicPage() {
  const { addToComicHistory } = useAppContext();
  const [storyIdea, setStoryIdea] = useState("");
  const [pages, setPages] = useState<1 | 2>(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [comicPages, setComicPages] = useState<ComicPageType[]>([]);

  const handleGenerate = async () => {
    if (!storyIdea.trim()) return;

    setIsGenerating(true);
    try {
      const result = await generateComic(storyIdea, pages);
      setComicPages(result);
      addToComicHistory(storyIdea);
    } catch (error) {
      console.error("Failed to generate comic:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const exampleStories = getComicExamples();

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500">
            <BookOpen className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">Comic Generator</h1>
            <p className="text-muted-foreground">
              Transform stories into visual comics
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr,400px]">
        {/* Main Content */}
        <div className="space-y-6">
          {/* Input Card */}
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="h-5 w-5 text-primary" />
                Create Your Story
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="e.g., A tomato plant named Tom discovers how to grow tall in space by following the special LED lights..."
                value={storyIdea}
                onChange={(e) => setStoryIdea(e.target.value)}
                className="min-h-32 rounded-xl resize-none"
              />

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Number of Pages
                </label>
                <div className="flex gap-2">
                  {[1, 2].map((num) => (
                    <Button
                      key={num}
                      variant={pages === num ? "default" : "outline"}
                      onClick={() => setPages(num as 1 | 2)}
                      className="rounded-xl flex-1"
                    >
                      {num} Page{num > 1 ? "s" : ""} ({num * 4} panels)
                    </Button>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !storyIdea.trim()}
                className="w-full gap-2 rounded-xl h-12"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Creating Comic...
                  </>
                ) : (
                  <>
                    <BookOpen className="h-5 w-5" />
                    Generate Comic
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Generated Comic */}
          {comicPages.length > 0 && (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Your Comic</h2>
                <Button variant="outline" className="gap-2 rounded-xl">
                  <Download className="h-4 w-4" />
                  Download All
                </Button>
              </div>

              <div className="space-y-6">
                {comicPages.map((page) => (
                  <Card key={page.pageNumber} className="rounded-2xl overflow-hidden">
                    <CardHeader className="bg-gradient-to-br from-amber-500/10 to-orange-500/10">
                      <div className="flex items-center justify-between">
                        <CardTitle>Page {page.pageNumber}</CardTitle>
                        <Badge
                          variant="secondary"
                          className="rounded-lg bg-amber-500/20"
                        >
                          4 Panels
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-8">
                      <div className="aspect-[4/5] rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-950 dark:to-orange-950 flex items-center justify-center border-2 border-dashed border-amber-500/30">
                        <div className="text-center space-y-2">
                          <BookOpen className="h-12 w-12 mx-auto text-amber-500" />
                          <p className="text-lg font-semibold text-amber-700 dark:text-amber-300">
                            Comic Page {page.pageNumber}
                          </p>
                          <p className="text-sm text-muted-foreground max-w-xs">
                            {page.title}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg">Story Ideas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {exampleStories.map((story, i) => (
                <Button
                  key={i}
                  variant="ghost"
                  className="w-full justify-start text-left h-auto py-3 rounded-xl"
                  onClick={() => setStoryIdea(story)}
                >
                  {story}
                </Button>
              ))}
            </CardContent>
          </Card>

          <Card className="rounded-2xl bg-muted/50">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">Comic Format</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Each page has 4 panels</li>
                <li>• Text bubbles with clear backgrounds</li>
                <li>• Engaging visual storytelling</li>
                <li>• Educational and fun</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
