export function computeDiff(
  original: string,
  suggested: string,
): { variant: 'context' | 'removed' | 'added'; content: string }[] {
  const origLines = original.split('\n')
  const suggLines = suggested.split('\n')
  const m = origLines.length
  const n = suggLines.length

  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    new Array(n + 1).fill(0),
  )
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (origLines[i - 1] === suggLines[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
      }
    }
  }

  const result: {
    variant: 'context' | 'removed' | 'added'
    content: string
  }[] = []
  let i = m
  let j = n
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && origLines[i - 1] === suggLines[j - 1]) {
      result.unshift({ variant: 'context', content: origLines[i - 1] })
      i--
      j--
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      result.unshift({ variant: 'added', content: suggLines[j - 1] })
      j--
    } else {
      result.unshift({ variant: 'removed', content: origLines[i - 1] })
      i--
    }
  }

  // Post-processing: inherit indentation from removed lines if added lines lack it
  for (let k = 0; k < result.length; k++) {
    if (result[k].variant === 'added') {
      let nearestRemovedIdx = -1
      // Search backwards in the current diff block
      for (let l = k - 1; l >= 0; l--) {
        if (result[l].variant === 'context') break
        if (result[l].variant === 'removed') {
          nearestRemovedIdx = l
          break
        }
      }
      // If not found backwards, search forwards in the current diff block
      if (nearestRemovedIdx === -1) {
        for (let l = k + 1; l < result.length; l++) {
          if (result[l].variant === 'context') break
          if (result[l].variant === 'removed') {
            nearestRemovedIdx = l
            break
          }
        }
      }

      if (nearestRemovedIdx !== -1) {
        const match = result[nearestRemovedIdx].content.match(/^(\s+)/)
        if (match && !/^\s+/.test(result[k].content)) {
          result[k].content = match[1] + result[k].content
        }
      }
    }
  }

  return result
}
