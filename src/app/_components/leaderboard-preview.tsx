import { Button } from '@components/ui/button'
import { LeaderboardRow } from '@components/ui/leaderboard-row'

const ENTRIES = [
  {
    rank: 1,
    score: 1.2,
    codePreview: 'eval(prompt("enter code"))',
    lang: 'javascript',
  },
  {
    rank: 2,
    score: 1.8,
    codePreview:
      'if (x == true) { return true; } else if (x == false) { return false; } else { return !false; }',
    lang: 'typescript',
  },
  {
    rank: 3,
    score: 2.1,
    codePreview: 'SELECT * FROM users WHERE 1=1 -- TODO: add authentication',
    lang: 'sql',
  },
]

function LeaderboardTable() {
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[420px] overflow-hidden border border-zinc-800">
        <div className="flex h-10 items-center border-zinc-800 border-b bg-neutral-950 px-5">
          <span className="w-10 shrink-0 font-medium text-[12px] text-gray-600">
            #
          </span>
          <span className="w-[60px] shrink-0 font-medium text-[12px] text-gray-600">
            score
          </span>
          <span className="flex-1 font-medium text-[12px] text-gray-600">
            code
          </span>
          <span className="w-[100px] shrink-0 font-medium text-[12px] text-gray-600">
            lang
          </span>
        </div>
        {ENTRIES.map((entry) => (
          <LeaderboardRow key={entry.rank}>
            <LeaderboardRow.Rank>{entry.rank}</LeaderboardRow.Rank>
            <LeaderboardRow.Score score={entry.score} />
            <LeaderboardRow.Code>{entry.codePreview}</LeaderboardRow.Code>
            <LeaderboardRow.Lang>{entry.lang}</LeaderboardRow.Lang>
          </LeaderboardRow>
        ))}
      </div>
    </div>
  )
}

export function LeaderboardPreview() {
  return (
    <section className="flex w-full flex-col gap-4 sm:gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[14px] text-emerald-500">
            {'// '}
          </span>
          <span className="font-bold text-[14px] text-zinc-50">
            shame_leaderboard
          </span>
        </div>
        <Button variant="outline" size="sm">
          $ view_all {'>>'}
        </Button>
      </div>

      <p className="font-sans text-[12px] text-gray-600 sm:text-[13px]">
        {'// the worst code on the internet, ranked by shame'}
      </p>

      <LeaderboardTable />

      <p className="text-center font-sans text-[12px] text-gray-600">
        showing top 3 of 2,847 · view full leaderboard {'>>'}
      </p>
    </section>
  )
}
