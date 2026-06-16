# Processo de SDD - TarefasApp

## 1. Objetivo

Aplicar o processo de SDD no projeto TarefasApp, usando seguranca e qualidade como criterios obrigatorios antes da entrega final.

Neste projeto, o SDD foi organizado como um fluxo de desenvolvimento com validacao continua:

1. Definir os requisitos principais do sistema.
2. Identificar riscos de seguranca com base no padrao OWASP.
3. Implementar controles de seguranca e tratamento de erros.
4. Criar testes automatizados com Playwright.
5. Gerar evidencias com prints.
6. Executar validacoes locais.
7. Configurar pipeline no GitHub Actions.

## 2. Requisitos funcionais validados

- Tela de login.
- Login com usuario valido.
- Bloqueio de login invalido.
- Cadastro de tarefas.
- Edicao de tarefas.
- Exclusao de tarefas.
- Busca de tarefas.
- Logout e retorno para login.
- Funcionamento online ou offline.
- Tratamento de falha quando o backend nao esta disponivel.

## 3. Requisitos de seguranca considerados

- Nao permitir acesso direto ao painel sem sessao local.
- Validar credenciais antes de navegar para a tela de tarefas.
- Exibir mensagem de erro para login invalido.
- Usar variavel de ambiente para configurar a URL da API.
- Evitar travamento do app quando o backend nao responde.
- Aplicar timeout nas chamadas HTTP.
- Manter dependencias controladas pelo `package-lock.json`.
- Validar o projeto com lint, TypeScript e Playwright.

## 4. Pipeline de SDD configurada

Foi criado o workflow:

```text
.github/workflows/playwright.yml
```

Esse workflow executa automaticamente:

- Instalacao das dependencias com `npm ci`.
- Analise de codigo com `npm run lint`.
- Validacao TypeScript com `npx tsc --noEmit`.
- Testes E2E com `npm run test:e2e`.
- Publicacao do relatorio HTML do Playwright como artefato.

## 5. Testes automatizados

Os testes estao em:

```text
tests/tarefas.spec.ts
```

Foram criados 10 casos de teste, com evidencias em print:

```text
docs/evidencias/
```

Relatorio dos testes:

```text
docs/relatorio-testes-playwright.md
```

## 6. Como executar localmente

Instalar dependencias:

```bash
npm install
```

Rodar testes E2E:

```bash
npm run test:e2e
```

Abrir relatorio HTML:

```bash
npm run test:e2e:report
```

Rodar validacoes de qualidade:

```bash
npm run lint
npx tsc --noEmit
```

## 7. Conclusao

O processo de SDD foi aplicado ao projeto por meio da definicao dos requisitos, analise de seguranca OWASP, testes automatizados com Playwright, evidencias com prints e pipeline de validacao no GitHub Actions.
