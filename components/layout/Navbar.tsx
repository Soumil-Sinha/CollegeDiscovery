"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect, useRef } from "react"
import { useSession, signIn, signOut } from "next-auth/react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/Button"

interface CollegeResult {
  id: string
  name: string
  slug: string
  city: string
  state: string
  type: string
}

interface LocationResult {
  label: string
  type: "city" | "state"
}

interface SearchCategories {
  colleges: CollegeResult[]
  locations: LocationResult[]
  courses: string[]
}

export function Navbar() {
  const { data: session } = useSession()
  const { theme, setTheme } = useTheme()
  const [query, setQuery] = useState("")
  const [categories, setCategories] = useState<SearchCategories | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [mounted, setMounted] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (query.length < 2) { setCategories(null); setIsOpen(false); return }

    debounceRef.current = setTimeout(async () => {
      setIsSearching(true)
      try {
        const res = await fetch(`/api/colleges/search?q=${encodeURIComponent(query)}`)
        const data = await res.json()
        if (data.categories) {
          setCategories(data.categories)
          const hasResults = data.categories.colleges.length > 0 || data.categories.locations.length > 0 || data.categories.courses.length > 0
          setIsOpen(hasResults)
        }
      } finally {
        setIsSearching(false)
      }
    }, 300)
  }, [query])

  const hasResults = categories && (
    categories.colleges.length > 0 ||
    categories.locations.length > 0 ||
    categories.courses.length > 0
  )

  const typeColors: Record<string, string> = {
    IIT: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
    NIT: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
    IIIT: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400",
    DEEMED: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400",
    PRIVATE: "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-400",
    STATE: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400",
    CENTRAL: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400",
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/85 dark:bg-gray-900/85 backdrop-blur-md border-b border-gray-200/80 dark:border-gray-700/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2 flex-shrink-0 group">
          <div className="w-8 h-8 bg-gray-900 dark:bg-gray-100 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:rotate-6 group-hover:bg-indigo-700 dark:group-hover:bg-indigo-500">
            <span className="text-white dark:text-gray-900 font-serif italic text-base leading-none">cd</span>
          </div>
          <span className="font-serif text-lg text-gray-900 dark:text-gray-100 hidden sm:block tracking-tight">CollegeDiscovery</span>
        </Link>

        {/* Search */}
        <div ref={searchRef} className="flex-1 max-w-md relative">
          <input
            type="text"
            placeholder="Search colleges, cities, courses..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 px-4 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-gray-700 transition"
          />
          {isSearching && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <svg className="animate-spin w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          )}

          {isOpen && hasResults && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden z-50 slide-down">
              {categories!.colleges.length > 0 && (
                <div>
                  <div className="px-4 pt-3 pb-1">
                    <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Colleges</p>
                  </div>
                  {categories!.colleges.map((r) => (
                    <Link
                      key={r.id}
                      href={`/colleges/${r.slug}`}
                      onClick={() => { setIsOpen(false); setQuery("") }}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className={`px-1.5 py-0.5 rounded text-xs font-bold flex-shrink-0 ${typeColors[r.type] ?? "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"}`}>
                        {r.type}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-1">{r.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{r.city}, {r.state}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {categories!.locations.length > 0 && (
                <div className={categories!.colleges.length > 0 ? "border-t border-gray-100 dark:border-gray-700" : ""}>
                  <div className="px-4 pt-3 pb-1">
                    <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Locations</p>
                  </div>
                  {categories!.locations.map((l) => (
                    <Link
                      key={l.label}
                      href={`/colleges?${l.type === "state" ? "state" : "q"}=${encodeURIComponent(l.label)}`}
                      onClick={() => { setIsOpen(false); setQuery("") }}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="w-7 h-7 bg-sky-50 dark:bg-sky-900/30 rounded-md flex items-center justify-center flex-shrink-0 text-sky-500">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{l.label}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{l.type}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {categories!.courses.length > 0 && (
                <div className={(categories!.colleges.length > 0 || categories!.locations.length > 0) ? "border-t border-gray-100 dark:border-gray-700" : ""}>
                  <div className="px-4 pt-3 pb-1">
                    <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Courses</p>
                  </div>
                  {categories!.courses.map((c) => (
                    <Link
                      key={c}
                      href={`/colleges?course=${encodeURIComponent(c)}`}
                      onClick={() => { setIsOpen(false); setQuery("") }}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="w-7 h-7 bg-emerald-50 dark:bg-emerald-900/30 rounded-md flex items-center justify-center flex-shrink-0 text-emerald-600 dark:text-emerald-400">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
                        </svg>
                      </div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{c}</p>
                    </Link>
                  ))}
                </div>
              )}

              <div className="px-4 py-2.5 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                <Link
                  href={`/colleges?q=${encodeURIComponent(query)}`}
                  onClick={() => { setIsOpen(false); setQuery("") }}
                  className="text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
                >
                  See all results for &quot;{query}&quot; →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-1">
          <Link href="/colleges" className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition">
            Colleges
          </Link>
          <Link href="/compare" className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition">
            Compare
          </Link>
          <Link href="/heatmap" className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition">
            Heatmap
          </Link>
        </div>

        {/* Theme toggle */}
        {mounted && (
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition flex-shrink-0"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
              </svg>
            )}
          </button>
        )}

        {/* Auth */}
        {session ? (
          <div className="flex items-center gap-2 flex-shrink-0">
            <Link href="/dashboard" className="hidden sm:block text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition">
              Dashboard
            </Link>
            <button onClick={() => signOut()} className="flex items-center gap-2">
              {session.user?.image ? (
                <Image src={session.user.image} alt="avatar" width={32} height={32} className="rounded-full" />
              ) : (
                <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-semibold text-sm">
                  {session.user?.name?.[0] ?? "U"}
                </div>
              )}
            </button>
          </div>
        ) : (
          <Button size="sm" onClick={() => signIn()} className="flex-shrink-0">
            Sign in
          </Button>
        )}
      </div>
    </nav>
  )
}
