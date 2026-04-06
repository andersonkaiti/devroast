export function SectionTitle({ children }: { children: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="font-bold font-mono text-emerald-500 text-sm">
        {'//'}
      </span>
      <span className="font-bold font-mono text-sm text-zinc-50">
        {children}
      </span>
    </div>
  )
}
