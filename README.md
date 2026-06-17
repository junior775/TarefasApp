# TarefasApp

Aplicativo de gerenciamento de tarefas desenvolvido com Expo e React Native, com login, cadastro de tarefas, edicao, exclusao, busca, modo foco e funcionamento online/offline.

## Entrega final

Este repositorio contem os itens solicitados para a entrega final da disciplina:

- Processo de SDD documentado.
- 10 casos de teste automatizados com Playwright.
- Evidencias dos testes com prints.
- Relatorio completo dos testes.
- Relatorio de seguranca com base no padrao OWASP Top 10:2025.
- Pipeline no GitHub Actions para validar o projeto.

## Documentacao

- [Processo de SDD](./docs/processo-sdd.md)
- [Relatorio de testes Playwright](./docs/relatorio-testes-playwright.md)
- [Relatorio de seguranca OWASP](./docs/relatorio-seguranca-owasp.md)
- [Evidencias com prints](./docs/evidencias)

## Casos de teste Playwright

Foram implementados 10 casos de teste:

1. Abrir a pagina de login.
2. Tentar login sem preencher campos.
3. Login com usuario valido.
4. Login com senha invalida.
5. Verificar carregamento da lista de tarefas.
6. Adicionar uma tarefa.
7. Editar uma tarefa.
8. Excluir uma tarefa.
9. Verificar se a tarefa adicionada aparece na lista.
10. Fazer logout e retornar para login.

Arquivo dos testes:

```text
tests/tarefas.spec.ts
```

## Como rodar o projeto

Instale as dependencias:

```bash
npm install
```

Inicie o backend:

```bash
npm run server
```

Em outro terminal, inicie o Expo:

```bash
npx expo start --clear
```

Usuario de teste:

```text
Email: emersonrobertojunior07@gmail.com
Senha: 123
```

## Como rodar os testes

Executar os testes E2E:

```bash
npm run test:e2e
```

Abrir o relatorio HTML do Playwright:

```bash
npm run test:e2e:report
```

Rodar validacoes de qualidade:

```bash
npm run lint
npx tsc --noEmit
```

## Pipeline

O workflow do GitHub Actions esta configurado em:

```text
.github/workflows/playwright.yml
```

Ele executa:

- `npm ci`
- `npm run lint`
- `npx tsc --noEmit`
- `npm run test:e2e`
- Upload do relatorio HTML do Playwright

## Seguranca OWASP 2025

A analise OWASP esta documentada em:

```text
docs/relatorio-seguranca-owasp.md
```

O relatorio informa erros, acertos e correcoes realizadas com base nos 10 itens do OWASP Top 10:2025.
