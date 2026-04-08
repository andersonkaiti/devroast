export function buildPrompt(code: string, lang: string): string {
  return `
    Review this ${lang} code:

    \`\`\`
    ${code}
    \`\`\`

    Rules:
    - Score: 1.0–10.0 with exactly one decimal place
    - Exactly 4 findings (any mix of critical/warning/good)
    - suggestedCode: corrected snippet only, no markdown fences, MUST EXACTLY preserve the original indentation and line breaks
    - quote: single sentence, in double quotes, all lowercase
  `
}
