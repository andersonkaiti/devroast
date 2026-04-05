export function LeaderboardTableHeader() {
  return (
    <div className="flex h-10 items-center border-zinc-800 border-b bg-neutral-950 px-5">
      <span className="w-10 shrink-0 font-medium text-[12px] text-gray-600">
        #
      </span>
      <span className="w-[60px] shrink-0 font-medium text-[12px] text-gray-600">
        score
      </span>
      <span className="flex-1 font-medium text-[12px] text-gray-600">code</span>
      <span className="w-[100px] shrink-0 font-medium text-[12px] text-gray-600">
        lang
      </span>
    </div>
  )
}
