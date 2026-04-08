type Severity = 'critical' | 'warning' | 'good'

const verdictColors: Record<Severity, string> = {
  critical: '#EF4444',
  warning: '#F59E0B',
  good: '#10B981',
}

interface OgImageProps {
  score: number
  lang: string
  lineCount: number
  roastQuote: string
  verdictSlug: string
  severity: Severity
}

export function OgImage({
  score,
  lang,
  lineCount,
  roastQuote,
  verdictSlug,
  severity,
}: OgImageProps) {
  const verdictColor = verdictColors[severity]

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        backgroundColor: '#0A0A0A',
        border: '1px solid #1f1f1f',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          height: '100%',
          padding: '64px',
          gap: '28px',
        }}
      >
        {/* logoRow */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span
            style={{
              fontFamily: 'JetBrains Mono',
              fontSize: 28,
              color: '#10B981',
            }}
          >
            {'>'}
          </span>
          <span
            style={{
              fontFamily: 'JetBrains Mono',
              fontSize: 28,
              color: '#FAFAFA',
            }}
          >
            devroast
          </span>
        </div>

        {/* scoreRow */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'flex-end',
            gap: '4px',
          }}
        >
          <span
            style={{
              fontFamily: 'JetBrains Mono',
              fontSize: 160,
              fontWeight: 900,
              lineHeight: 1,
              color: '#F59E0B',
            }}
          >
            {score.toFixed(1)}
          </span>
          <span
            style={{
              fontFamily: 'JetBrains Mono',
              fontSize: 56,
              color: '#8B8B8B',
              paddingBottom: '16px',
            }}
          >
            /10
          </span>
        </div>

        {/* verdictRow */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              backgroundColor: verdictColor,
            }}
          />
          <span
            style={{
              fontFamily: 'JetBrains Mono',
              fontSize: 24,
              color: verdictColor,
            }}
          >
            {verdictSlug}
          </span>
        </div>

        {/* langInfo */}
        <span
          style={{
            fontFamily: 'JetBrains Mono',
            fontSize: 18,
            color: '#8B8B8B',
          }}
        >
          lang: {lang} {'\u00b7'} {lineCount} lines
        </span>

        {/* roastQuote */}
        <span
          style={{
            fontFamily: 'IBM Plex Mono',
            fontSize: 22,
            color: '#FAFAFA',
            textAlign: 'center',
            lineHeight: 1.5,
            maxWidth: '900px',
          }}
        >
          {'\u201C'}
          {roastQuote}
          {'\u201D'}
        </span>
      </div>
    </div>
  )
}
