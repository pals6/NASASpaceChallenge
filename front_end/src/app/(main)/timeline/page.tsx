"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CURATED_TOPICS,
  fetchPopularTopics,
  fetchExtraTopics,       // optional
  fetchTimeline,
} from "@/lib/api";

type Item = {
  title: string; year: number; date: string;
  mission: string; impact: string; summary: string; link: string;
};

export default function TimelinePage() {
  const [topics, setTopics] = useState<string[]>([...CURATED_TOPICS]);
  const [extras, setExtras] = useState<string[]>([]); // optional second group
  const [topic, setTopic] = useState<string>("Microgravity");

  const [items, setItems] = useState<Item[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [err, setErr] = useState<string>("");

  useEffect(() => {
    (async () => {
      // curated set (always)
      const curated = await fetchPopularTopics(20);
      setTopics(curated);
      if (curated.length && !curated.includes(topic)) setTopic(curated[0] as string);

      // OPTIONAL: also fetch extras to show under a second group
      const more = await fetchExtraTopics(30);
      setExtras(more);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true); setErr(""); setItems([]); setSelectedYear(null);
      try {
        const data = await fetchTimeline(topic);
        if (!alive) return;
        setItems(data);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Failed to load timeline.";
        setErr(msg);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [topic]);

  const { years, counts, byYear, maxCount } = useMemo(() => {
    const map = new Map<number, Item[]>();
    for (const it of items) {
      const y = Number(it.year) || 0;
      if (!map.has(y)) map.set(y, []);
      map.get(y)!.push(it);
    }
    const ys = Array.from(map.keys()).sort((a, b) => a - b);
    const cs = ys.map((y) => map.get(y)!.length);
    return { years: ys, counts: cs, byYear: map, maxCount: cs.length ? Math.max(...cs) : 1 };
  }, [items]);

  const totalStudies = items.length;
  const totalYears = years.length;
  const visibleYears = selectedYear ? [selectedYear] : years;

  return (
    <div className="px-6 py-8 max-w-[1100px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight">NASA Space Apps — Timeline</h1>

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Topic</label>
          <select
            value={topic}
            onChange={(e) => setTopic(e.currentTarget.value)}
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none"
            disabled={loading}
          >
            {/* Curated only */}
            {topics.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}

            {/* OPTIONAL: Uncomment to show server extras as a second group */}
            {/* {extras.length > 0 && (
              <optgroup label="More from data">
                {extras.map((t) => (
                  <option key={`x-${t}`} value={t}>{t}</option>
                ))}
              </optgroup>
            )} */}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <StatCard label="Years" value={totalYears} />
        <StatCard label="Total Studies" value={totalStudies} />
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 mb-6">
        <h2 className="font-semibold mb-2">Studies by Year</h2>

        {loading ? (
          <div className="py-16 text-center text-gray-500">Loading timeline…</div>
        ) : err ? (
          <div className="py-16 text-center text-rose-600">Error: {err}</div>
        ) : !years.length ? (
          <EmptyState topic={topic} />
        ) : (
          <>
            <div className="relative h-64 flex items-end gap-4 px-2 bg-gray-50 rounded-md">
              {years.map((y, i) => {
                const c = counts[i]!;
                const hPct = (c / maxCount) * 100;
                const active = selectedYear === y;
                return (
                  <button
                    key={y}
                    onClick={() => setSelectedYear(active ? null : y)}
                    className="group flex-1 h-full flex flex-col items-center justify-end gap-2 focus:outline-none"
                    title={`${y}: ${c} ${c === 1 ? "study" : "studies"}`}
                  >
                    <div
                      className={`w-full rounded-t-lg transition-all duration-200 ${
                        active ? "bg-blue-600" : "bg-blue-400/70 group-hover:bg-blue-500"
                      }`}
                      style={{ height: `${Math.max(6, hPct)}%` }}
                    />
                    <div className="text-xs text-gray-600">{y}</div>
                  </button>
                );
              })}
              <div className="absolute inset-x-0 bottom-0 border-t border-gray-200 pointer-events-none" />
            </div>
            <div className="mt-2 text-center text-xs text-gray-500">
              Click on any bar to see highlights from that year
            </div>
          </>
        )}
      </div>

      {!!visibleYears.length && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {visibleYears.map((y) => {
            const list = byYear.get(y) ?? [];
            const first = list[0];
            return (
              <button
                key={y}
                className={`text-left rounded-2xl border bg-white p-4 transition ${
                  selectedYear === y ? "border-blue-600 ring-2 ring-blue-100" : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => setSelectedYear(selectedYear === y ? null : y)}
              >
                <div className="flex items-center justify-between">
                  <div className="text-lg font-semibold">{y}</div>
                  <span className="text-xs bg-gray-900 text-white rounded-full px-2 py-1">
                    {list.length} {list.length === 1 ? "study" : "studies"}
                  </span>
                </div>

                <div className="mt-3 text-sm text-gray-700 line-clamp-1">
                  {first ? first.title : "—"}
                </div>

                {selectedYear === y && (
                  <ul className="mt-3 space-y-2">
                    {list.map((it, idx) => (
                      <li key={idx} className="text-sm text-gray-700">
                        <span className="font-medium">{it.title}</span>
                        {it.mission && <span className="text-gray-500"> — {it.mission}</span>}
                        {it.link && (
                          <> <a href={it.link} target="_blank" rel="noreferrer" className="text-blue-600 underline">link</a></>
                        )}
                        <div className="text-gray-600">{it.summary}</div>
                      </li>
                    ))}
                  </ul>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-3xl font-extrabold mt-1">{value}</div>
    </div>
  );
}

function EmptyState({ topic }: { topic: string }) {
  return (
    <div className="py-10 text-center">
      <div className="text-gray-700 font-medium mb-2">
        No results for “{topic}” (yet).
      </div>
      <div className="text-gray-600 text-sm">
        Try another topic, e.g. <em>Microgravity</em>, <em>Radiation</em>, <em>Bone Health</em>, or <em>Plants & Food</em>.
      </div>
    </div>
  );
}
