import Link from 'next/link'

export function Navbar() {
  return (
    <header className="flex h-14 w-full items-center justify-between border-zinc-800 border-b bg-neutral-950 px-4 sm:px-10">
      <Link href="/" className="flex items-center gap-2">
        <span className="font-bold text-emerald-500 text-xl">{'>'}</span>
        <span className="font-medium text-[18px] text-zinc-50">devroast</span>
      </Link>
      <nav className="flex items-center gap-6">
        <Link
          href="/leaderboard"
          className="text-[13px] text-gray-500 transition-colors hover:text-zinc-50"
        >
          leaderboard
        </Link>
        <Link
          href="/components"
          className="text-[13px] text-gray-500 transition-colors hover:text-zinc-50"
        >
          components
        </Link>
      </nav>
    </header>
  )
}
