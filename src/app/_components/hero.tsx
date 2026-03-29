export function HeroTitle() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline gap-2 sm:gap-3">
        <span className="font-bold text-2xl text-emerald-500 sm:text-4xl">
          $
        </span>
        <h1 className="font-bold text-2xl text-zinc-50 sm:text-4xl">
          paste your code. get roasted.
        </h1>
      </div>
      <p className="font-sans text-[13px] text-gray-500 sm:text-[14px]">
        {
          "// drop your code below and we'll rate it — brutally honest or full roast mode"
        }
      </p>
    </div>
  )
}
