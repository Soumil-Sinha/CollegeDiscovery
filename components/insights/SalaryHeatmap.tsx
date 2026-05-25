"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import Link from "next/link"
import { ComposableMap, Geographies, Geography } from "react-simple-maps"

const GEO_URL = "/india-states.json"

const GEO_NAME_MAP: Record<string, string> = {
  "Jammu & Kashmir": "Jammu and Kashmir",
}
function normalizeGeoName(name: string) {
  return GEO_NAME_MAP[name] ?? name
}

interface StateData {
  state: string
  avgSalary: number
  collegeCount: number
  topColleges: string[]
  types: string[]
}

function fmt(n: number) {
  return n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : `₹${(n / 1000).toFixed(0)}K`
}

function salaryColor(value: number, min: number, max: number) {
  const t = (value - min) / (max - min || 1)
  if (t >= 0.85) return "#312e81"
  if (t >= 0.68) return "#4338ca"
  if (t >= 0.50) return "#6366f1"
  if (t >= 0.30) return "#a5b4fc"
  return "#e0e7ff"
}

const TOOLTIP_W = 230
const TOOLTIP_H = 160
const CURSOR_OFFSET = 14

export function SalaryHeatmap({ data }: { data: StateData[] }) {
  const [hovered, setHovered] = useState<StateData | null>(null)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })
  const [view, setView] = useState<"map" | "rank">("map")
  const [modalState, setModalState] = useState<{ data: StateData; rank: number } | null>(null)

  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)

  const min = Math.min(...data.map((d) => d.avgSalary))
  const max = Math.max(...data.map((d) => d.avgSalary))
  const dataByState = Object.fromEntries(data.map((d) => [d.state, d]))

  const enter = useCallback((d: StateData) => {
    if (leaveTimer.current) clearTimeout(leaveTimer.current)
    setHovered(d)
  }, [])

  const leave = useCallback(() => {
    leaveTimer.current = setTimeout(() => setHovered(null), 80)
  }, [])

  const handleMouseMove = useCallback(
    (e: React.MouseEvent, d: StateData | undefined) => {
      if (!d || !mapContainerRef.current) return
      const rect = mapContainerRef.current.getBoundingClientRect()
      const rawX = e.clientX - rect.left + CURSOR_OFFSET
      const rawY = e.clientY - rect.top - CURSOR_OFFSET
      const x = Math.min(rawX, rect.width - TOOLTIP_W - 4)
      const y = rawY + TOOLTIP_H > rect.height ? rawY - TOOLTIP_H + CURSOR_OFFSET : rawY
      setTooltipPos({ x, y })
    },
    []
  )

  // Close modal on Escape
  useEffect(() => {
    if (!modalState) return
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setModalState(null)
    }
    document.addEventListener("keydown", onKey)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = ""
    }
  }, [modalState])

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex rounded-lg border border-gray-200 overflow-hidden text-sm bg-white">
          {(["map", "rank"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`press px-4 py-2 font-medium transition-all duration-200 ${
                view === v ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {v === "map" ? "India Map" : "Ranked List"}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 ml-1">
          <span className="text-xs text-gray-400 tracking-wider uppercase">Low</span>
          {["#e0e7ff", "#a5b4fc", "#6366f1", "#4338ca", "#312e81"].map((c) => (
            <div key={c} className="w-5 h-3.5 rounded-sm" style={{ background: c }} />
          ))}
          <span className="text-xs text-gray-400 tracking-wider uppercase">High</span>
        </div>
      </div>

      {view === "map" ? (
        /* ── India Map ── */
        <div
          ref={mapContainerRef}
          className="relative bg-white rounded-2xl border border-gray-200 overflow-hidden select-none fade-in"
        >
          <ComposableMap
            projection="geoMercator"
            projectionConfig={{ center: [82.8, 22.5], scale: 1050 }}
            width={800}
            height={620}
            style={{ width: "100%", height: "auto", display: "block" }}
          >
            <Geographies geography={GEO_URL}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const geoStateName = geo.properties.ST_NM as string
                  const normalized = normalizeGeoName(geoStateName)
                  const d = dataByState[normalized]
                  const isHovered = hovered?.state === normalized
                  const fill = d ? salaryColor(d.avgSalary, min, max) : "#f1f5f9"

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={fill}
                      stroke="#ffffff"
                      strokeWidth={isHovered ? 2.5 : 0.6}
                      style={{
                        default: { outline: "none", transition: "fill 0.15s" },
                        hover: {
                          outline: "none",
                          fill: d ? salaryColor(d.avgSalary, min, max) : "#f1f5f9",
                          filter: d ? "brightness(1.18) drop-shadow(0 1px 3px rgba(0,0,0,0.25))" : "none",
                          cursor: d ? "crosshair" : "default",
                        },
                        pressed: { outline: "none" },
                      }}
                      onMouseEnter={() => d && enter(d)}
                      onMouseMove={(e: React.MouseEvent) => handleMouseMove(e, d)}
                      onMouseLeave={leave}
                    />
                  )
                })
              }
            </Geographies>
          </ComposableMap>

          {hovered && (
            <div
              key={hovered.state}
              className="absolute z-20 pointer-events-none"
              style={{ left: tooltipPos.x, top: tooltipPos.y, width: TOOLTIP_W }}
            >
              <div className="tooltip-pop bg-white rounded-xl border border-gray-200 shadow-xl p-3.5 text-left">
                <div className="flex items-start justify-between gap-2 mb-2.5">
                  <div>
                    <p className="text-sm font-semibold text-gray-900 leading-tight">{hovered.state}</p>
                    <p
                      className="numeric text-2xl mt-0.5"
                      style={{ color: salaryColor(hovered.avgSalary, min, max) === "#e0e7ff" ? "#6366f1" : salaryColor(hovered.avgSalary, min, max) }}
                    >
                      {fmt(hovered.avgSalary)}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-[10px] text-gray-400 tracking-wider uppercase">Avg salary</p>
                    <p className="text-xs font-semibold text-gray-600 mt-0.5">
                      {hovered.collegeCount} college{hovered.collegeCount > 1 ? "s" : ""}
                    </p>
                  </div>
                </div>

                <div className="w-full bg-gray-100 rounded-full h-1.5 mb-2.5 overflow-hidden">
                  <div
                    className="h-1.5 rounded-full transition-all duration-500"
                    style={{
                      width: `${((hovered.avgSalary - min) / (max - min || 1)) * 100}%`,
                      background: salaryColor(hovered.avgSalary, min, max),
                    }}
                  />
                </div>

                <div className="flex flex-wrap gap-1 mb-2">
                  {hovered.types.map((t) => (
                    <span
                      key={t}
                      className="text-[10px] tracking-wider uppercase px-1.5 py-0.5 rounded font-medium bg-indigo-50 text-indigo-700"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                {hovered.topColleges.length > 0 && (
                  <ul className="space-y-0.5">
                    {hovered.topColleges.slice(0, 2).map((c) => (
                      <li key={c} className="text-xs text-gray-500 truncate flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-indigo-300 flex-shrink-0" />
                        {c}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          <p className="text-xs text-gray-400 text-center pb-3 pt-1 tracking-wide">
            States in light grey have no colleges in the database yet
          </p>
        </div>
      ) : (
        /* ── Ranked list — click opens floating modal ── */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 stagger-children">
          {data.map((d, i) => {
            const ratio = (d.avgSalary - min) / (max - min || 1)
            const fill = salaryColor(d.avgSalary, min, max)

            return (
              <button
                key={d.state}
                onClick={() => setModalState({ data: d, rank: i + 1 })}
                className="press group bg-white rounded-xl border border-gray-200 overflow-hidden text-left hover:shadow-md hover:border-gray-300 transition-all duration-300"
              >
                <div className="px-4 py-3.5 flex items-center gap-3">
                  <span className="numeric text-2xl text-gray-300 w-9 flex-shrink-0 group-hover:text-gray-500 transition">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="flex-1 font-semibold text-gray-900 text-sm group-hover:text-indigo-700 transition">{d.state}</span>
                  <div className="text-right flex-shrink-0">
                    <p
                      className="numeric text-lg"
                      style={{ color: fill === "#e0e7ff" ? "#6366f1" : fill }}
                    >
                      {fmt(d.avgSalary)}
                    </p>
                    <p className="text-[10px] text-gray-400 tracking-wider uppercase">
                      {d.collegeCount} college{d.collegeCount > 1 ? "s" : ""}
                    </p>
                  </div>
                  <svg
                    className="w-4 h-4 text-gray-300 flex-shrink-0 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all duration-300"
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>

                <div className="px-4 pb-3">
                  <div className="w-full bg-gray-100 rounded-full h-1 overflow-hidden">
                    <div
                      className="h-1 rounded-full transition-all duration-700"
                      style={{ width: `${ratio * 100}%`, background: fill }}
                    />
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* ── Floating Modal for selected state ── */}
      {modalState && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4 overlay-fade"
          onClick={() => setModalState(null)}
          role="dialog"
          aria-modal="true"
        >
          <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" />
          <StateDetailModal
            state={modalState.data}
            rank={modalState.rank}
            min={min}
            max={max}
            onClose={() => setModalState(null)}
          />
        </div>
      )}
    </div>
  )
}

function StateDetailModal({
  state,
  rank,
  min,
  max,
  onClose,
}: {
  state: StateData
  rank: number
  min: number
  max: number
  onClose: () => void
}) {
  const fill = salaryColor(state.avgSalary, min, max)
  const isLight = fill === "#e0e7ff" || fill === "#a5b4fc"
  const ratio = (state.avgSalary - min) / (max - min || 1)

  return (
    <div
      className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md modal-pop overflow-hidden"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Top color bar */}
      <div className="h-1.5" style={{ background: fill }} />

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition press"
        aria-label="Close"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
        </svg>
      </button>

      <div className="p-6">
        {/* Rank */}
        <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">
          Rank · <span className="numeric text-gray-700">#{rank}</span> nationally
        </p>

        {/* State name */}
        <h2 className="font-serif text-3xl text-gray-900 leading-tight mb-4">{state.state}</h2>

        {/* Salary headline */}
        <div className="flex items-baseline gap-3 mb-4">
          <p
            className="numeric text-5xl"
            style={{ color: fill === "#e0e7ff" ? "#6366f1" : fill }}
          >
            {fmt(state.avgSalary)}
          </p>
          <p className="text-xs text-gray-500 tracking-wider uppercase">Avg salary</p>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-100 rounded-full h-1.5 mb-6 overflow-hidden">
          <div
            className="h-1.5 rounded-full"
            style={{
              width: `${ratio * 100}%`,
              background: fill,
              animation: "fade-in 0.6s ease-out forwards, modal-pop 0.6s ease-out forwards",
            }}
          />
        </div>

        {/* Meta row */}
        <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b border-gray-100">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">Colleges</p>
            <p className="numeric text-2xl text-gray-900">{state.collegeCount}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">Institute types</p>
            <div className="flex flex-wrap gap-1 mt-1.5">
              {state.types.map((t) => (
                <span
                  key={t}
                  className="text-[10px] tracking-wider uppercase font-medium px-1.5 py-0.5 rounded"
                  style={{ background: isLight ? "#e0e7ff" : fill + "22", color: fill === "#e0e7ff" ? "#4338ca" : fill }}
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Top colleges */}
        {state.topColleges.length > 0 && (
          <div className="mb-6">
            <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-3">Top Colleges</p>
            <ul className="space-y-2 stagger-children">
              {state.topColleges.map((c) => (
                <li key={c} className="text-sm text-gray-700 flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: fill }} />
                  {c}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* CTA */}
        <Link
          href={`/colleges?state=${encodeURIComponent(state.state)}`}
          className="press group block w-full text-center bg-gray-900 hover:bg-indigo-700 text-white font-medium px-5 py-3 rounded-full transition-colors duration-300"
        >
          Browse {state.state} colleges
          <span className="ml-2 inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
        </Link>
      </div>
    </div>
  )
}
