import { CodeBlock } from '@components/ui'
import { Code2, Trophy } from 'lucide-react'
import type { BundledLanguage } from 'shiki'

export const metadata = {
  title: 'Leaderboard - DevRoast',
  description: 'The most roasted code on the internet',
}

interface LeaderboardEntry {
  id: string
  rank: number
  code: string
  language: string
  score: number
  author: string
}

const LEADERBOARD_DATA: LeaderboardEntry[] = [
  {
    id: '1',
    rank: 1,
    code: `function add(a, b) {
  return a + b;
}`,
    language: 'javascript',
    score: 2.5,
    author: 'dev_noob',
  },
  {
    id: '2',
    rank: 2,
    code: `var x = 1;
var y = 2;
var z = x + y;`,
    language: 'javascript',
    score: 3.1,
    author: 'junior_dev',
  },
  {
    id: '3',
    rank: 3,
    code: `if (a > b) {
  max = a;
} else {
  max = b;
}`,
    language: 'python',
    score: 4.2,
    author: 'code_warrior',
  },
  {
    id: '4',
    rank: 4,
    code: `setTimeout(() => {
  console.log("hello");
}, 1000);`,
    language: 'javascript',
    score: 5.0,
    author: 'async_lover',
  },
  {
    id: '5',
    rank: 5,
    code: `try {
  doSomething();
} catch (e) {
  console.log("error");
}`,
    language: 'javascript',
    score: 5.8,
    author: 'error_handler',
  },
]

async function LeaderboardCard({ entry }: { entry: LeaderboardEntry }) {
  const previewCode = entry.code.split('\n').slice(0, 3).join('\n')
  const lineCount = previewCode.split('\n').length

  return (
    <div className="flex flex-col border border-zinc-800 bg-neutral-950">
      {/* Meta Row */}
      <div className="flex h-12 items-center justify-between border-zinc-800 border-b px-5">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Trophy className="h-4 w-4 text-amber-500" />
            <span className="text-xs text-zinc-600">{entry.rank}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Code2 className="h-4 w-4 text-emerald-500" />
            <span className="text-xs text-zinc-600">
              {entry.score.toFixed(1)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="text-zinc-500">{entry.language}</span>
          <span className="text-zinc-700">{lineCount} lines</span>
        </div>
      </div>

      {/* Code Block */}
      <CodeBlock
        code={previewCode}
        lang={entry.language as BundledLanguage}
        className="border-0"
      />
    </div>
  )
}

export default function LeaderboardPage() {
  const totalSubmissions = 247
  const avgScore = 5.2

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 pt-12 pb-10 sm:px-10 sm:pt-20 sm:pb-16">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        {/* Hero Section */}
        <section className="mb-10 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-amber-500" />
            <h1 className="font-bold font-mono text-3xl">shame leaderboard</h1>
          </div>
          <p className="font-mono text-sm text-zinc-500">
            {/* the most roasted code on the internet */}
          </p>
          <div className="flex items-center gap-8 pt-2">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-zinc-600">
                total submissions
              </span>
              <span className="font-bold font-mono text-lg text-zinc-50">
                {totalSubmissions}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-zinc-600">avg score</span>
              <span className="font-bold font-mono text-emerald-500 text-lg">
                {avgScore.toFixed(1)}
              </span>
            </div>
          </div>
        </section>

        {/* Leaderboard Entries */}
        <section className="flex flex-col gap-5">
          {LEADERBOARD_DATA.map((entry) => (
            <LeaderboardCard key={entry.id} entry={entry} />
          ))}
        </section>
      </div>
    </main>
  )
}
