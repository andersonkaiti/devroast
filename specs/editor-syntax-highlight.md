# Especificação: Editor com Syntax Highlight

**Status**: Research & Design  
**Data**: Abril 2026  
**Autor**: Claude Code

---

## 1. Contexto e Motivação

O `CodeInput` atual em `src/app/_components/code-input.tsx` é um `<textarea>` puro sem nenhum destaque de sintaxe (syntax highlight). Quando o usuário cola código, o programa roast detecta a linguagem e exibe o resultado em um `CodeBlock` com highlight via Shiki.

**Proposta**: adicionar syntax highlighting em **tempo real** no próprio `CodeInput`, tanto para melhor UX/visual quanto para permitir que o usuário **veja imediatamente** qual linguagem foi detectada ou escolha manualmente qual aplicar.

**Benefícios**:

- Feedback visual instantâneo — o usuário vê o highlight enquanto digita
- Melhor indicação de qual linguagem será roasted
- Consistência visual (mesmo tema `vesper` do `CodeBlock`)
- Experiência semelhante ao ray-so, Codepenm ou outras ferramentas modernas

---

## 2. Pesquisa de Tecnologias

### 2.1 Alternativas Avaliadas

#### **Opção A: Textarea Overlay + Shiki (Recomendado ✓)**

**Como funciona**:

- `<textarea>` **transparente** sobreposto a um `<div>` com HTML sintaticamente destacado
- Padrão usado por ray-so, CodePen, ray.so, e similares
- JavaScript monitora mudanças no textarea, renderiza highlight no div, mantém posição/scroll sincronizados

**Vantagens**:

- Controle total da UX — customização fácil
- Leve e rápido (sem dependência pesada de editor)
- Shiki v4 já está no projeto (`shiki@^4.0.2`)
- Integra bem com a estética terminal do devroast

**Desvantagens**:

- Scroll, cursor, wrap-text precisam ser sincronizados manualmente
- Sem features avançadas como folding, breadcrumbs, etc. (não necessárias para o devroast)

**Stack Tecnológico**:

- **Shiki v4**: `createHighlighter()` (client-side WASM) + `codeToTokens()`
- **highlight.js v11**: `highlightAuto()` para auto-detecção de linguagem
- **React hooks**: `useEffect`, `useState`, `useCallback`, `useRef`, `useReducer`
- **Debounce**: implementado via `useCallback` + `setTimeout` ou lib leve (ex.: `lodash.debounce`)

---

#### **Opção B: CodeMirror 6**

**Como funciona**: editor completo, extensível, com highlight integrado

**Vantagens**:

- Feature-rich: folding, breadcrumbs, undo, collab-ready
- Acessibilidade built-in
- Comunidade grande

**Desvantagens**:

- Bundle pesado (~150KB min+gzip)
- Overkill para um input simples
- Customização de tema e estilo é complexa
- Quebra a estética terminal do devroast (default dark mas não matches `vesper`)

**Decisão**: ❌ Rejeitado — muito pesado para o caso de uso

---

#### **Opção C: Monaco Editor**

**Como funciona**: editor VS Code, muito poderoso

**Vantagens**:

- Excelente UX, auto-complete, etc.
- Familiar para devs

**Desvantagens**:

- Bundle gigante (~300KB+), WASM requer worker
- Overkill demais
- Difícil de customizar para match `vesper` theme

**Decisão**: ❌ Rejeitado

---

#### **Opção D: Apenas Shiki (sem hljs)**

**Como funciona**: pedir ao usuário selecionar linguagem antes de colar, ou usar apenas Shiki `codeToTokens` sem detection

**Vantagens**:

- Mais simples, uma lib só

**Desvantagens**:

- Sem auto-detecção → UX ruim (usuário esquece de selecionar linguagem)
- Força o usuário a pensar em detalhes técnicos

**Decisão**: ❌ Rejeitado — auto-detecção é esperado

---

### 2.2 Comparação Shiki vs Highlight.js vs Prism

| Aspecto | Shiki | Highlight.js | Prism |
| --- | --- | --- | --- |
| **Bundle size** | ~250KB (WASM) | ~180KB | ~18KB |
| **Speed** | 50ms para 10 blocos | 14ms | 5ms |
| **Quality** | ⭐⭐⭐⭐⭐ VS Code-level | ⭐⭐⭐ Boa | ⭐⭐⭐ Boa |
| **Auto-detect** | ❌ Não | ✓ Sim | ❌ Não |
| **Server-side** | ✓ Sim | ✓ Sim | ❌ Client only |
| **Client-side** | ✓ (WASM) | ✓ | ✓ |
| **Já no projeto** | ✓ Shiki v4 | ❌ | ❌ |

**Conclusão**:

- **Shiki** para rendering → melhor qualidade, já instalado
- **highlight.js** para auto-detecção → `highlightAuto()` com fallback robusto
- Ambos necessários: **Shiki renderiza, hljs detecta**

---

## 3. Decisões Tomadas

Com base na pesquisa e nos requisitos do usuário:

| Decisão | Opção | Racional |
| --- | --- | --- |
| **Padrão de UI** | Textarea overlay | Leve, customizável, já aprovado em ray-so |
| **Lib de highlight** | Shiki v4 | Já instalado, melhor qualidade visual |
| **Auto-detecção** | highlight.js v11 | `highlightAuto()` confiável |
| **Tema** | `vesper` | Consistência com `CodeBlock` existente |
| **Trigger** | Debounce 300ms | Feedback real-time sem overhead |
| **Linguagens** | Todas do Shiki (~200) | Seletor com busca/filtro para discovery |
| **Estado** | React Context + URL | Compartilha linguagem detectada com `CodeBlock` resultado |

---

## 4. Arquitetura

### 4.1 Componentes Principais

```txt
CodeInputWithHighlight (nova client component)
├── EditorHighlighter (novo custom hook)
│   ├── Shiki highlighter singleton
│   └── hljs auto-detect
├── <textarea> (transparent overlay)
├── <pre><code> (highlight render)
├── LanguageSelector (novo sub-component)
│   └── @base-ui-components/react combobox
└── EditorState (Context)
    ├── code: string
    ├── language: string (user-selected or auto-detected)
    ├── detectedLanguage: string
    └── isHighlighting: boolean

CodeBlock (existente, modificado)
└── Recebe `language` do Context/props passado pelo CodeInputWithHighlight
```

### 4.2 Data Flow

```txt
[Usuário cola/digita código]
         ↓
    [onInput/onChange]
         ↓
[Debounce 300ms]
         ↓
[hljs.highlightAuto(code) → detect language]
         ↓
[Update EditorState.detectedLanguage]
         ↓
[Se userSelectedLanguage vazio, usar detected]
         ↓
[Shiki.codeToTokens(code, { lang, theme: 'vesper' })]
         ↓
[Render tokens em <pre><code> (highlight div)]
         ↓
[Compartilha linguagem com CodeBlock via Context/URL]
```

### 4.3 Exemplo Visual (Textual)

```txt
┌─────────────────────────────────────────────┐
│ ⚫ 🟠 🟢                                     │  ← window chrome (macOS dots)
├─────────────────────────────────────────────┤
│ 1  const hello = () => {                    │  ← CodeInput com overlay
│ 2    console.log("world")                   │
│ 3  }                                        │
│                                              │
│  [TypeScript ▼] ⚡ Detected: JavaScript     │  ← Language selector + hint
└─────────────────────────────────────────────┘

Abaixo, quando clica "roast":
┌─────────────────────────────────────────────┐
│ ⚫ 🟠 🟢  result.ts                          │  ← CodeBlock com mesmo theme
├─────────────────────────────────────────────┤
│ 1  const hello = () => {                    │  ← Renderizado com highlight
│ 2    console.log("world")                   │     (mesma linguagem detectada)
│ 3  }                                        │
└─────────────────────────────────────────────┘
```

---

## 5. Dependências

### 5.1 Novas dependências

- **`highlight.js@^11.10.0`** — auto-detecção de linguagem
  - Bundle ~180KB, leve para detecção apenas
  - Pode ficar no `dependencies` (cliente) ou no servidor (análise)

### 5.2 Já existentes

- **`shiki@^4.0.2`** ✓ instalado
- **`@base-ui-components/react`** ✓ instalado (para combobox de linguagem)
- **`react@19`** ✓ instalado
- **`next@16`** ✓ instalado

**Nenhuma dependência pesada nova é necessária.**

---

## 6. Implementação — Plano de Ação

### Phase 1: Scaffolding

- [ ] Criar `src/lib/shiki-highlighter.ts` — singleton Shiki v4 `createHighlighter()`
  - Inicializa com todas as linguagens do Shiki
  - Exporta função `getHighlighter()` que retorna a instância (lazy init)
  - Tema hardcoded: `vesper`

- [ ] Criar `src/lib/language-utils.ts` — utilitários de linguagem
  - Map hljs lang names → Shiki `BundledLanguage` (ex: `"javascript"` → `"js"`)
  - Fallback gracioso para linguagens não suportadas
  - Função `formatLanguageName()` para exibir nomes legíveis

- [ ] Instalar `highlight.js@^11.10.0`
  - `pnpm add highlight.js`

### Phase 2: EditorHighlighter Hook

- [ ] Criar `src/hooks/useEditorHighlighter.ts`
  - Gerencia state: `code`, `language`, `detectedLanguage`, `isHighlighting`
  - `setCode(newCode)` → dispara debounce → hljs auto-detect → Shiki highlight
  - `setLanguage(lang)` → user override
  - Retorna tokens e metadata para render
  - Error boundary: se Shiki falhar, fallback para `<code>` sem cores

### Phase 3: LanguageSelector Component

- [ ] Criar `src/components/ui/language-selector.tsx`
  - Combobox com busca em tempo real
  - Todos os idiomas do Shiki (~200) — data pode vir de `getBundledLanguages()` do Shiki
  - Hint de "Detected: JavaScript" quando auto-detectado
  - Simples, sem dependência além de @base-ui-components/react

### Phase 4: Renderização do Highlight

- [ ] Criar sub-component `HighlightedCodeDisplay.tsx`
  - Recebe tokens do `useEditorHighlighter`
  - Renderiza `<pre><code>{tokens.map(...)}</code></pre>`
  - Mantém mesmo estilo que `CodeBlock` para consistência

### Phase 5: CodeInputWithHighlight (Main Component)

- [ ] Modificar ou criar `src/app/_components/code-input-v2.tsx`
  - `<textarea>` + `HighlightedCodeDisplay` sobreposto
  - Sync scroll, wrap, line-height manualmente
  - Layout: flex container, `<textarea>` com `position: absolute; z-index: 2; opacity: 0`
  - Div highlight com `pointer-events: none`
  - Integra `LanguageSelector`
  - Exporta estado via Context para que `CodeBlock` possa consumir

### Phase 6: Context & State Sharing

- [ ] Criar `src/context/editor-context.tsx`
  - `EditorProvider` wrapper para homepage
  - Fornece: `code`, `language`, `detectedLanguage`
  - Consumido por `CodeBlock` para saber qual language usar no render

- [ ] Modificar `src/app/_components/code-input.tsx`
  - Opção A: Substituir direto por nova versão (breaking change menor, pois é interno)
  - Opção B: Criar novo e manter ambas (mais seguro, migração gradual)
  - **Recomendação**: Opção A, renomear para `code-input-v2.tsx`, atualizar imports na homepage

### Phase 7: Integração no CodeBlock

- [ ] Modificar `src/components/ui/code-block.tsx`
  - Consumir `language` do Context se disponível, fallback para prop
  - Se `language` vem do Context, pode ser `BundledLanguage` ou string genérica
  - Converter para `BundledLanguage` com fallback seguro

### Phase 8: Testes Manuais

- [ ] Homepage: colar diferentes linguagens, verificar highlight + detecção
- [ ] Mudar seletor de language, verificar que sobrescreve detecção
- [ ] Clicar "roast", verificar que `CodeBlock` usa mesma linguagem
- [ ] Mobile: verificar scroll, wrap text, overflow
- [ ] Dark/light mode (se aplicável): cores do `vesper` tema

### Phase 9: Performance & Polish

- [ ] Medir bundle size (Shiki WASM é 250KB, hljs ~180KB)
- [ ] Profile render com DevTools
- [ ] Debounce value: testar 300ms (pode ajustar para 200ms se muito lag)
- [ ] Fallback: se Shiki WASM falha, mostrar código sem highlight sem quebrar
- [ ] Scroll sync: verificar que textarea e div highlight scrollam juntos

---

## 7. Notas Técnicas & Pegadinhas

### 7.1 Scroll & Position Sync

**Problema**: Quando o usuário scrolls a `<textarea>`, o div de highlight precisa scrollar junto.

**Solução**:

```tsx
// Ambas têm position relativa, scroll container comum
<div className="relative overflow-auto">
  <textarea ref={textareaRef} onScroll={syncScroll} />
  <pre className="absolute inset-0 pointer-events-none">
    {/* highlight content */}
  </pre>
</div>
```

Ou mais simples: span hidden placeholder, mesma font/size na textarea e pre, deixar overflow:auto manejar.

### 7.2 Line Height & Wrap

**Desafio**: Se a `<textarea>` wraps palavras, mas a renderização não wraps igual, elas descasam.

**Solução**:

- `white-space: pre-wrap` na `<pre>`
- `word-wrap: break-word` em ambas
- Mesmo `font-size`, `line-height`, `letter-spacing` em ambas

### 7.3 Shiki WASM Init

**Desafio**: `createHighlighter()` é assíncrono e pesado (primeira chamada ~500ms).

**Solução**:

- Inicializar no mount da página (não lazy em handler)
- Ou usar Web Worker (overkill para devroast)
- Mostrar "Initializing syntax highlight..." enquanto carrega
- Cache a instância em um singleton global ou module-level

**Implementação sugerida**:

```typescript
// src/lib/shiki-highlighter.ts
let highlighter: Highlighter | null = null

export async function getHighlighter() {
  if (highlighter) return highlighter
  highlighter = await createHighlighter({
    themes: ['vesper'],
    langs: [/* all */],
    loadWasm: getWasm,
  })
  return highlighter
}
```

### 7.4 hljs → Shiki Language Mapping

**Desafio**: hljs retorna `language: "javascript"`, mas Shiki espera `"js"`, `"ts"`, etc.

**Solução**: Mapa de mapping em `src/lib/language-utils.ts`:

```typescript
const HLJS_TO_SHIKI: Record<string, BundledLanguage> = {
  'javascript': 'js',
  'typescript': 'ts',
  'python': 'py',
  'shell': 'bash',
  'html': 'html',
  // ... etc
}

export function mapLanguage(hljsLang: string | null): BundledLanguage {
  if (!hljsLang) return 'plaintext'
  return HLJS_TO_SHIKI[hljsLang.toLowerCase()] || 'plaintext'
}
```

### 7.5 Fallback para linguagem desconhecida

Sempre ter um fallback seguro — se a linguagem não existe em Shiki, usar `plaintext` (sem cores).

---

## 8. Non-Goals / Out of Scope

❌ **Não fazer**:

- Undo/redo (React state é suficiente, native textarea undo funciona)
- Autocomplete ou IntelliSense
- Formatação automática (prettier, etc.)
- Dark/light mode theme switcher para highlight (vesper é hardcoded)
- Line folding ou breadcrumbs
- Collab editing ou multiplayer
- Exporter para imagem (não é escopo inicial)
- Terminal emulation ou custom REPL

Essas features são "nice-to-have" e podem ser adicionadas depois se houver demanda.

---

## 9. Checklist de Aceitação

Quando implementado, validar:

- [ ] `CodeInput` mostra syntax highlight em tempo real enquanto digita
- [ ] Linguagem é auto-detectada ao colar código
- [ ] Usuário pode selecionar linguagem manualmente via combobox
- [ ] Scroll e wrap-text funcionam corretamente
- [ ] `CodeBlock` de resultado usa mesma linguagem detectada
- [ ] Tema `vesper` é consistente entre input e resultado
- [ ] Mobile: input é usável (keyboard, scroll, sem layout shift)
- [ ] Performance: debounce de 300ms não causa lag visível
- [ ] Fallback: se Shiki WASM falha, código continua visível (sem cores)
- [ ] Accessibility: textarea é focusável, labels estão presentes

---

## 10. Referências

### Código-fonte consultado

- **ray-so** (`https://github.com/raycast/ray-so`)
  - `app/(navigation)/(code)/components/Editor.tsx` — textarea overlay pattern
  - `app/(navigation)/(code)/code.tsx` — Shiki WASM setup
  - `app/(navigation)/(code)/store/themes.ts` — CSS variables theme

### Documentação

- [Shiki v4 Docs](https://shiki.style/)
- [Highlight.js Docs](https://highlightjs.org/)
- [ray-so GitHub](https://github.com/raycast/ray-so)

### Artigos comparativos

- [Better Syntax Highlighting (dbushell.com)](https://dbushell.com/2024/03/14/better-syntax-highlighting/)
- [Comparing web code highlighters (chsm.dev)](https://chsm.dev/blog/2025/01/08/comparing-web-code-highlighters)
- [LogRocket: Best code editor components for React](https://blog.logrocket.com/best-code-editor-components-react/)

---

## Próximos Passos

1. ✅ **Spec aprovada** — documento atual
2. 🔜 **Implementação** — seguir plan de ação em Phase 1–9
3. 🔜 **QA & testes manuais**
4. 🔜 **Deploy & monitoring**

Qualquer dúvida ou mudança de escopo → abrir issue e atualizar este documento.
