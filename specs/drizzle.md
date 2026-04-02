# Spec: Drizzle ORM + PostgreSQL via Docker Compose

## Contexto

O **devroast** precisa persistir submissions de código, os resultados da análise gerados pela IA e expor um leaderboard público dos piores (ou melhores) códigos enviados. Atualmente toda a UI está implementada com dados estáticos/mock. Esta spec cobre a camada de banco de dados: schema, enums, Docker Compose e to-dos de implementação.

---

## Stack do banco

| Camada | Tecnologia |
| --- | --- |
| Banco de dados | PostgreSQL 17 |
| ORM | Drizzle ORM (`drizzle-orm` + `drizzle-kit`) |
| Driver | `postgres` (node-postgres puro, sem pool extra) |
| Migrations | `drizzle-kit migrate` |
| Dev local | Docker Compose |

---

## Docker Compose

Arquivo: `docker-compose.yml` na raiz do projeto.

```yaml
services:
  db:
    image: postgres:17-alpine
    restart: unless-stopped
    environment:
      POSTGRES_USER: devroast
      POSTGRES_PASSWORD: devroast
      POSTGRES_DB: devroast
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### Variáveis de ambiente

Arquivo: `.env.local` (nunca commitar — já deve estar no `.gitignore`).

```env
DATABASE_URL="postgres://devroast:devroast@localhost:5432/devroast"
```

---

## Enums

### `roast_mode`

Controla o tom da análise gerada pela IA. Mapeado do toggle `roastMode: boolean` em `code-input.tsx`.

| Valor | Descrição |
| --- | --- |
| `honest` | Análise direta e técnica, sem sarcasmo |
| `roast` | Roast com sarcasmo máximo ativado |

### `severity`

Classifica cada finding da análise. Mapeado do tipo `BadgeSeverity` em `badge.tsx` e usado pelo `ScoreRing` para coloração.

| Valor | Cor na UI | Score equivalente |
| --- | --- | --- |
| `critical` | Vermelho | ≤ 4.0 |
| `warning` | Âmbar | 4.1 – 6.0 |
| `good` | Esmeralda | > 6.0 |

---

## Tabelas

### `submissions`

Uma linha por envio de código. Entidade central do app.

| Coluna | Tipo Postgres | Drizzle | Obrigatório | Descrição |
| --- | --- | --- | --- | --- |
| `id` | `uuid` | `uuid().primaryKey().defaultRandom()` | sim | PK gerada pelo banco |
| `code` | `text` | `text()` | sim | Código completo enviado pelo usuário |
| `code_preview` | `varchar(160)` | `varchar({ length: 160 })` | sim | Primeiros ~160 chars para exibir no leaderboard sem trazer `code` inteiro |
| `lang` | `text` | `text()` | sim | Linguagem detectada ou informada (ex: `"typescript"`, `"sql"`) |
| `roast_mode` | `roast_mode` (enum) | `roastModeEnum()` | sim | Modo escolhido no toggle |
| `score` | `numeric(3,1)` | `numeric({ precision: 3, scale: 1 })` | sim | Nota de 0 a 10 com 1 casa decimal |
| `roast_text` | `text` | `text()` | sim | Texto principal da análise gerado pela IA |
| `is_public` | `boolean` | `boolean().default(true)` | sim | Se aparece no leaderboard público |
| `created_at` | `timestamptz` | `timestamp({ withTimezone: true }).defaultNow()` | sim | Data/hora do envio |

**Índices:**

- `score DESC` — ordenação do leaderboard
- `created_at DESC` — feed recente

---

### `analysis_findings`

Zero ou mais findings por submission. Cada card exibido na tela "Roast Results" é uma linha.

| Coluna | Tipo Postgres | Drizzle | Obrigatório | Descrição |
| --- | --- | --- | --- | --- |
| `id` | `uuid` | `uuid().primaryKey().defaultRandom()` | sim | PK |
| `submission_id` | `uuid` | `uuid().references(() => submissions.id, { onDelete: 'cascade' })` | sim | FK para `submissions` |
| `severity` | `severity` (enum) | `severityEnum()` | sim | Nível de gravidade do finding |
| `title` | `text` | `text()` | sim | Título curto do finding (ex: `"usando var em vez de const/let"`) |
| `description` | `text` | `text()` | sim | Explicação detalhada |
| `sort_order` | `integer` | `integer().default(0)` | sim | Ordem de exibição dos cards |

**Índices:**

- `(submission_id, sort_order)` — busca dos findings de uma submission em ordem

---

## Relacionamentos

```txt
submissions (1) ──< analysis_findings (N)
  analysis_findings.submission_id → submissions.id  [CASCADE DELETE]
```

Se uma submission for deletada, todos os seus findings somem junto.

---

## Estrutura de arquivos

```txt
src/
  db/
    index.ts          # instância do cliente Drizzle (singleton)
    schema.ts         # definição de todos os enums e tabelas
    migrations/       # arquivos SQL gerados pelo drizzle-kit (não editar à mão)
drizzle.config.ts     # config do drizzle-kit
```

---

## To-dos de implementação

### 1. Dependências

```bash
pnpm add drizzle-orm postgres
pnpm add -D drizzle-kit
```

### 2. `drizzle.config.ts`

Criar na raiz:

```ts
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './src/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
})
```

### 3. `src/db/schema.ts`

- [ ] Declarar enum `roastModeEnum` com valores `honest` e `roast`
- [ ] Declarar enum `severityEnum` com valores `critical`, `warning`, `good`
- [ ] Declarar tabela `submissions` com todas as colunas acima
- [ ] Declarar tabela `analysisFindngs` com FK e `onDelete: 'cascade'`
- [ ] Exportar `schema` como objeto agregado para o drizzle-kit e o cliente

### 4. `src/db/index.ts`

- [ ] Criar conexão com `postgres(process.env.DATABASE_URL!)`
- [ ] Instanciar `drizzle(client, { schema })` com padrão singleton (evitar múltiplas conexões em dev com hot reload)

### 5. `package.json` — scripts

```json
"db:generate": "drizzle-kit generate",
"db:migrate": "drizzle-kit migrate",
"db:studio": "drizzle-kit studio",
"db:push": "drizzle-kit push"
```

> Em dev use `db:push` para aplicar mudanças rápidas sem criar arquivos de migration. Em produção, sempre use `db:generate` + `db:migrate`.

### 6. `.gitignore`

- [ ] Confirmar que `.env.local` já está ignorado
- [ ] Adicionar `src/db/migrations/*.sql` ao `.gitignore` só se preferir não versionar migrations (recomendado: **versionar**)

### 7. Docker Compose

- [ ] Criar `docker-compose.yml` na raiz conforme seção acima
- [ ] Rodar `docker compose up -d` e confirmar que o Postgres sobe na porta 5432
- [ ] Rodar `pnpm db:push` ou `pnpm db:migrate` para criar as tabelas

### 8. Integração com a UI

- [ ] Substituir dados mock em `leaderboard-preview.tsx` por query real `SELECT ... FROM submissions ORDER BY score ASC LIMIT 5`
- [ ] Substituir contadores em `stats-hint.tsx` por `SELECT COUNT(*), AVG(score) FROM submissions`
- [ ] Implementar Server Action ou Route Handler `POST /api/roast` que:
  1. Recebe `{ code, lang, roastMode }`
  2. Chama a IA (Claude ou outro provider)
  3. Persiste na tabela `submissions` + `analysis_findings`
  4. Retorna o `submission.id` para redirecionar para `/results/[id]`

### 9. Validação

- [ ] Usar Zod para validar o payload de entrada antes de inserir no banco
- [ ] Garantir que `score` está entre 0 e 10 antes de persistir (constraint no schema Drizzle ou validação na camada de serviço)

---

## Queries de referência

### Leaderboard (piores scores)

```ts
db
  .select({
    id: submissions.id,
    codePreview: submissions.codePreview,
    lang: submissions.lang,
    score: submissions.score,
    roastMode: submissions.roastMode,
    createdAt: submissions.createdAt,
  })
  .from(submissions)
  .where(eq(submissions.isPublic, true))
  .orderBy(asc(submissions.score))
  .limit(10)
```

### Resultado completo de uma submission

```ts
const result = await db.query.submissions.findFirst({
  where: eq(submissions.id, id),
  with: {
    findings: {
      orderBy: asc(analysisFindngs.sortOrder),
    },
  },
})
```

### Stats do hero

```ts
db
  .select({
    total: count(),
    avgScore: avg(submissions.score),
  })
  .from(submissions)
  .where(eq(submissions.isPublic, true))
```
