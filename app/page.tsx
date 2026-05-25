import Link from "next/link"
import Image from "next/image"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"
import { formatSalary, formatFees } from "@/lib/insights"

async function getStats() {
  const [collegeCount, avgRating, topColleges] = await Promise.all([
    prisma.college.count(),
    prisma.college.aggregate({ _avg: { rating: true } }),
    prisma.college.findMany({
      take: 6,
      orderBy: { rating: "desc" },
      select: {
        id: true, name: true, slug: true, type: true, city: true, state: true,
        totalFees: true, rating: true, image: true,
        placementStats: { select: { avgSalary: true }, orderBy: { year: "desc" }, take: 1 },
      },
    }),
  ])
  return { collegeCount, avgRating: avgRating._avg.rating ?? 0, topColleges }
}

export default async function HomePage() {
  const { collegeCount, avgRating, topColleges } = await getStats()

  return (
    <div className="flex flex-col">
      {/* ── Editorial Hero ── */}
      <section className="bg-stone-50 dark:bg-gray-950 border-b border-gray-200/70 dark:border-gray-800 py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, #000 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }} />
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 mb-8 text-xs font-medium tracking-widest text-gray-500 dark:text-gray-400 uppercase fade-in">
            <span className="w-6 h-px bg-gray-400 dark:bg-gray-600" />
            India&apos;s College Discovery Platform
            <span className="w-6 h-px bg-gray-400" />
          </div>
          <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl leading-[1.05] text-gray-900 dark:text-gray-50 mb-6 fade-in-up">
            Find your perfect college,
            <br />
            <span className="italic text-indigo-700">with data-driven clarity.</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl mx-auto mb-10 leading-relaxed fade-in-up" style={{ animationDelay: "0.1s" }}>
            Search, compare, and analyze <span className="numeric text-gray-900 dark:text-gray-100">{collegeCount}+</span> top engineering colleges across India.
            Real placement data, ROI calculator, smart recommendations.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center fade-in-up" style={{ animationDelay: "0.2s" }}>
            <Link
              href="/colleges"
              className="press inline-flex items-center justify-center bg-gray-900 text-white font-medium px-7 py-3.5 rounded-full hover:bg-indigo-700 transition-colors duration-300 group"
            >
              Explore Colleges
              <span className="ml-2 transition-transform duration-300 group-hover:translate-x-1">→</span>
            </Link>
            <Link
              href="/compare"
              className="press inline-flex items-center justify-center border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-medium px-7 py-3.5 rounded-full hover:bg-white dark:hover:bg-gray-800 hover:border-gray-400 transition"
            >
              Compare Colleges
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats strip ── */}
      <section className="bg-white dark:bg-gray-900 border-b border-gray-200/70 dark:border-gray-800 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-gray-200 dark:divide-gray-700">
            {[
              { label: "Colleges", value: `${collegeCount}+` },
              { label: "Avg Rating", value: `${avgRating.toFixed(1)}` },
              { label: "States", value: "15+" },
              { label: "Years of Data", value: "3" },
            ].map(({ label, value }, i) => (
              <div key={label} className="text-center px-3 fade-in-up" style={{ animationDelay: `${i * 0.05}s` }}>
                <p className="numeric text-4xl text-gray-900 dark:text-gray-100">{value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 tracking-wider uppercase">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Top Colleges ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2">Curated Selection</p>
            <h2 className="font-serif text-4xl text-gray-900 dark:text-gray-100">Top rated colleges</h2>
          </div>
          <Link href="/colleges" className="link-underline text-sm text-indigo-600 font-medium">
            View all
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 stagger-children">
          {topColleges.map((college) => (
            <Link key={college.id} href={`/colleges/${college.slug}`} className="group">
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 hover:-translate-y-0.5 transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 overflow-hidden flex-shrink-0">
                    {college.image ? (
                      <Image src={college.image} alt={college.name} width={48} height={48} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-serif text-xl text-gray-400 dark:text-gray-600">{college.name[0]}</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-1 group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition">{college.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{college.city}, {college.state}</p>
                  </div>
                  <span className="text-[10px] tracking-wider uppercase text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-600 px-1.5 py-0.5 rounded flex-shrink-0">
                    {college.type}
                  </span>
                </div>
                <div className="flex justify-between text-sm border-t border-gray-100 dark:border-gray-700 pt-4">
                  <div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 tracking-wider uppercase">Fees</p>
                    <p className="numeric text-base text-gray-900 dark:text-gray-100 mt-0.5">{formatFees(college.totalFees)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-400 dark:text-gray-500 tracking-wider uppercase">Rating</p>
                    <p className="numeric text-base text-gray-900 dark:text-gray-100 mt-0.5">{college.rating.toFixed(1)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400 dark:text-gray-500 tracking-wider uppercase">Avg CTC</p>
                    <p className="numeric text-base text-gray-900 dark:text-gray-100 mt-0.5">
                      {college.placementStats[0] ? formatSalary(college.placementStats[0].avgSalary) : "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="bg-white dark:bg-gray-900 border-t border-gray-200/70 dark:border-gray-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-xs uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2">What You Get</p>
            <h2 className="font-serif text-4xl text-gray-900 dark:text-gray-100">Why CollegeDiscovery</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-gray-200 dark:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
            {[
              {
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75Z M9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625Z M16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
                  </svg>
                ),
                title: "Placement Analytics",
                desc: "3-year placement trends with salary graphs for every college.",
              },
              {
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0 0 12 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52 2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 0 1-2.031.352 5.988 5.988 0 0 1-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971Zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0 2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 0 1-2.031.352 5.989 5.989 0 0 1-2.032-.352c-.482-.174-.71-.703-.589-1.202L5.25 4.971Z" />
                  </svg>
                ),
                title: "Side-by-Side Compare",
                desc: "Compare up to 3 colleges on fees, placements, rating, and more.",
              },
              {
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
                  </svg>
                ),
                title: "ROI Calculator",
                desc: "See your payback period and net gain over 5 years for any college.",
              },
              {
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z M6 6h.008v.008H6V6Z" />
                  </svg>
                ),
                title: "Smart Badges",
                desc: "Auto-computed badges: Top ROI, Best Value, Rising Placements.",
              },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="bg-white dark:bg-gray-900 p-6 hover:bg-stone-50 dark:hover:bg-gray-800 transition-colors duration-300 group">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-300">
                  {icon}
                </div>
                <h3 className="font-serif text-xl text-gray-900 dark:text-gray-100 mb-1.5">{title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
