# Specs

Crie um spec antes de implementar qualquer feature nova de médio ou grande porte. O spec serve como contrato entre o que foi pesquisado/decidido e o que será implementado.

## Formato

```txt
# Spec: [Nome da Feature]

## Contexto
Por que essa feature existe e o que ela resolve.

## Decisões
Tabela ou lista das decisões técnicas chave (tecnologia, abordagem, padrão adotado) com justificativa breve.
Inclua alternativas rejeitadas se a escolha não for óbvia.

## Arquitetura / Estrutura
Arquivos criados/modificados, schema de banco, componentes principais, data flow.
Use listas, tabelas ou diagramas ASCII quando ajudar.

## Implementação
Checklist ordenado de tarefas:
- [ ] Passo 1
- [ ] Passo 2

## Non-Goals
O que explicitamente não faz parte do escopo.

## Checklist de Aceitação
Critérios para considerar a feature completa.
```

## Regras

- **Contexto e Implementação são obrigatórios.** O restante é opcional — inclua apenas o que agrega clareza.
- Mantenha o spec atualizado se o escopo mudar durante a implementação.
- Nome do arquivo: `kebab-case.md` descrevendo a feature (ex: `auth-flow.md`, `drizzle.md`).
