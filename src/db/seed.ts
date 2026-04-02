import { faker } from '@faker-js/faker'
import { db } from './index'
import { analysisFindings, submissions } from './schemas'

const LANGUAGES = [
  'javascript',
  'typescript',
  'python',
  'java',
  'cpp',
  'csharp',
  'php',
  'ruby',
  'go',
  'rust',
  'kotlin',
  'swift',
  'html',
  'css',
  'sql',
  'bash',
  'dockerfile',
  'yaml',
]

const ROAST_MODES = ['honest', 'roast'] as const

const SEVERITIES = ['critical', 'warning', 'good'] as const

const ROAST_TITLES = [
  'Variável mal nomeada',
  'Lógica desnecessariamente complexa',
  'Falta de tratamento de erro',
  'Performance questionável',
  'Code duplication',
  'Magic numbers everywhere',
  'Função muito grande',
  'Falta de testes',
  'Arquitetura confusa',
  'Segurança comprometida',
  'Indentação inconsistente',
  'Comentários desatualizados',
  'Import não utilizado',
  'Tipo genérico em demasia',
  'Loop infinito potencial',
  'Memory leak detectado',
  'Race condition provável',
  'SQL injection risk',
  'XSS vulnerability',
  'CORS headers ausentes',
]

const ROAST_DESCRIPTIONS = [
  'Este código parece ter sido escrito enquanto dormia. Considere usar um naming convention.',
  'A complexidade ciclomática deste algoritmo é maior que a população de uma cidade média.',
  'Sem tratamento de erro, este código vai quebrar tão rápido quanto um vidro em um furacão.',
  'Se performance fosse uma corrida, este código estaria a pé enquanto outros estão em um foguete.',
  'Você copiou e colou esse código tanta vez que até o Git desistiu de contar.',
  'Magic numbers? Mais como números de magia negra que ninguém consegue entender.',
  'Esta função é tão grande que precisa de um mapa para navegar pelo código.',
  'Sem testes unitários, você está confiando na sorte. E a sorte não é um strategy bom.',
  'A arquitetura aqui parece ter sido desenhada por alguém com os olhos fechados.',
  'As vulnerabilidades de segurança aqui são tão óbvias que até um script kiddie enxergaria.',
  'A indentação está mais confusa que GPS em um túnel subterrâneo.',
  'Os comentários aqui são tão desatualizados quanto notícias do século passado.',
  'Você está importando algo que nunca usa? Limpe isso.',
  'Genéricos demais. Nem o TypeScript consegue entender o que está acontecendo.',
  'Esse loop pode rodar para sempre. Boa sorte parando ele sem Force Kill.',
  'Memory leak detectado: este código perde memória tão rápido quanto furo em balde.',
  'Race conditions esperando para acontecer. O timing é tudo, e aqui é nada.',
  'SQL injection é um convite aberto para hackers. Você deixou a porta da frente aberta.',
  'XSS vulnerability: você está executando JavaScript não validado no navegador.',
  'CORS headers ausentes = violação de segurança em produção.',
]

async function generateRoasts() {
  const startTime = Date.now()

  try {
    console.log('🌱 Começando seed de 100 roasts...\n')

    const submissionIds: string[] = []

    // Inserir 100 roasts
    for (let i = 0; i < 100; i++) {
      const lang = faker.helpers.arrayElement(LANGUAGES)
      const roastMode = faker.helpers.arrayElement(ROAST_MODES)
      const score = parseFloat((Math.random() * 10).toFixed(1))
      const codePreview = faker.lorem.words({ min: 5, max: 15 })

      const roastText = faker.lorem.sentences({ min: 2, max: 4 })

      const result = await db
        .insert(submissions)
        .values({
          code: faker.lorem.sentences({ min: 5, max: 15 }),
          codePreview,
          lang,
          roastMode,
          score: score.toString(),
          roastText,
          isPublic: faker.datatype.boolean({ probability: 0.8 }),
          createdAt: faker.date.past({ years: 1 }),
        })
        .returning({ id: submissions.id })

      submissionIds.push(result[0].id)
    }

    console.log(`✓ 100 roasts inseridos\n`)

    // Inserir 1-3 findings por roast
    let totalFindings = 0

    for (const submissionId of submissionIds) {
      const findingsCount = faker.number.int({ min: 1, max: 3 })

      for (let j = 0; j < findingsCount; j++) {
        const severity = faker.helpers.arrayElement(SEVERITIES)
        const title = faker.helpers.arrayElement(ROAST_TITLES)
        const description = faker.helpers.arrayElement(ROAST_DESCRIPTIONS)

        await db.insert(analysisFindings).values({
          submissionId,
          severity,
          title,
          description,
          sortOrder: j,
        })

        totalFindings++
      }
    }

    console.log(`✓ ${totalFindings} findings inseridos\n`)

    const elapsed = Date.now() - startTime

    console.log('✅ Seed completo!')
    console.log(`   - 100 roasts em 100 languages diferentes`)
    console.log(`   - ${totalFindings} findings (média de ${(totalFindings / 100).toFixed(1)} por roast)`)
    console.log(`   - Tempo: ${elapsed}ms\n`)
  } catch (error) {
    console.error('❌ Erro durante seed:', error)
    process.exit(1)
  }
}

generateRoasts()
