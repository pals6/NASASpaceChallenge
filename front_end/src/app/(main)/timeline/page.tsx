"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, TrendingUp } from "lucide-react";
import { useAppContext } from "@/contexts/AppContext";
import { getTimelineData, getTimelineStats } from "@/lib/api";

export default function TimelinePage() {
  const { selectedYear, setSelectedYear } = useAppContext();
  const timelineData = getTimelineData();
  const stats = getTimelineStats();

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500">
            <Clock className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">Timeline</h1>
            <p className="text-muted-foreground">
              Space biology research through the years
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <Card className="rounded-xl">
            <CardContent className="flex items-center gap-3 pt-6">
              <Calendar className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{stats.totalYears}</p>
                <p className="text-sm text-muted-foreground">Years</p>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-xl">
            <CardContent className="flex items-center gap-3 pt-6">
              <TrendingUp className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{stats.totalStudies}</p>
                <p className="text-sm text-muted-foreground">Total Studies</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Interactive Timeline Chart */}
      <Card className="rounded-2xl mb-8">
        <CardHeader>
          <CardTitle>Studies by Year</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative h-80 w-full">
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 1000 300"
              preserveAspectRatio="xMidYMid meet"
            >
              {/* Grid lines */}
              {[0, 25, 50, 75, 100].map((percent) => (
                <g key={percent}>
                  <line
                    x1="60"
                    y1={260 - (percent / 100) * 220}
                    x2="980"
                    y2={260 - (percent / 100) * 220}
                    stroke="currentColor"
                    strokeWidth="1"
                    className="text-border"
                    opacity="0.3"
                  />
                  <text
                    x="40"
                    y={260 - (percent / 100) * 220 + 5}
                    fontSize="12"
                    fill="currentColor"
                    textAnchor="end"
                    className="text-muted-foreground"
                  >
                    {Math.round((percent / 100) * stats.maxCount)}
                  </text>
                </g>
              ))}

              {/* Bars */}
              {timelineData.map((item, i) => {
                const x = 80 + (i / (timelineData.length - 1)) * 880;
                const height = (item.count / stats.maxCount) * 220;
                const y = 260 - height;
                const isSelected = selectedYear === item.year;

                return (
                  <g key={item.year}>
                    <rect
                      x={x - 25}
                      y={y}
                      width="50"
                      height={height}
                      fill="currentColor"
                      className={`cursor-pointer transition-all ${
                        isSelected
                          ? "text-primary"
                          : "text-primary/70 hover:text-primary"
                      }`}
                      rx="4"
                      onClick={() =>
                        setSelectedYear(isSelected ? null : item.year)
                      }
                    />
                    <text
                      x={x}
                      y="280"
                      fontSize="14"
                      fill="currentColor"
                      textAnchor="middle"
                      className="text-foreground font-semibold"
                    >
                      {item.year}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
          <p className="text-sm text-muted-foreground text-center mt-4">
            Click on any bar to see highlights from that year
          </p>
        </CardContent>
      </Card>

      {/* Year Details */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {timelineData.map((item) => {
          const isSelected = selectedYear === item.year;
          return (
            <Card
              key={item.year}
              className={`rounded-2xl transition-smooth cursor-pointer ${
                isSelected
                  ? "ring-2 ring-primary shadow-lg"
                  : "hover:shadow-md"
              }`}
              onClick={() => setSelectedYear(isSelected ? null : item.year)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">{item.year}</CardTitle>
                  <Badge variant={isSelected ? "default" : "secondary"} className="rounded-lg">
                    {item.count} studies
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {item.highlight}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
