"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import clsx from "clsx"

const links = [
  { href: "/",            label: "🏠 Home" },
  { href: "/lessons",     label: "📖 Lessons" },
  { href: "/flashcards",  label: "🃏 Flashcards" },
  { href: "/assessment",  label: "📝 Assessment" },
  { href: "/profile",     label: "⚙️ Profile" },
]

export default function Nav() {
  const path = usePathname()
  return (
    <nav className="bg-[#1a1a2e] text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-3xl mx-auto px-4 flex items-center gap-1 overflow-x-auto">
        <span className="font-bold text-[#e94560] pr-4 py-3 whitespace-nowrap shrink-0">
          한국어
        </span>
        {links.map(l => (
          <Link
            key={l.href}
            href={l.href}
            className={clsx(
              "px-3 py-3 text-sm whitespace-nowrap transition-colors",
              path === l.href
                ? "border-b-2 border-[#e94560] text-white"
                : "text-gray-400 hover:text-white"
            )}
          >
            {l.label}
          </Link>
        ))}
      </div>
    </nav>
  )
}
