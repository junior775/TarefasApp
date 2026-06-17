# Relatorio de Erros e Acertos - OWASP Top 10:2025

## 1. Objetivo

Avaliar o TarefasApp de acordo com o OWASP Top 10:2025, registrar erros e acertos encontrados e corrigir pontos suficientes para que o projeto tenha no minimo 5 itens atendidos dentro do escopo academico.

Referencia oficial usada: [OWASP Top 10:2025](https://owasp.org/Top10/).

## 2. Resultado geral

| Status | Quantidade |
| --- | ---: |
| Atendido | 6 |
| Parcialmente atendido | 4 |
| Nao atendido | 0 |

Conclusao: o projeto atende ao requisito minimo solicitado, pois possui 6 itens classificados como atendidos no escopo academico.

## 3. Tabela de erros e acertos

| Item | Norma OWASP 2025 | Status | Acertos encontrados | Erros/Pendencias |
| --- | --- | --- | --- | --- |
| A01 | Broken Access Control | Parcialmente atendido | O app bloqueia a tela de tarefas sem sessao e possui logout. | O backend `json-server` nao possui autorizacao real por usuario. |
| A02 | Security Misconfiguration | Atendido | API configuravel por `.env`, timeout HTTP, `.gitignore`, workflow de validacao e scripts organizados. | Em producao ainda exigiria HTTPS/CORS restrito. |
| A03 | Software Supply Chain Failures | Atendido | Uso de `package-lock.json`, `npm ci` no GitHub Actions e dependencias versionadas. | Recomenda-se executar auditoria de dependencias periodicamente. |
| A04 | Cryptographic Failures | Parcialmente atendido | Nao ha exposicao da senha na recuperacao; o fluxo prepara link de redefinicao. | Senhas ainda ficam em texto simples no `db.json`, por ser backend academico. |
| A05 | Injection | Atendido | Entradas de usuario e tarefas passam por sanitizacao basica, removendo `<` e `>`, limitando tamanho e normalizando espacos. | Em banco real seria necessario validacao tambem no servidor. |
| A06 | Insecure Design | Atendido | Processo SDD documentado, fluxo de login, logout, fallback offline, testes e tratamento de erro planejados. | Arquitetura final de producao exigiria autenticacao server-side. |
| A07 | Authentication Failures | Parcialmente atendido | Login valida email/senha, compara email normalizado, registra falhas e bloqueia credencial invalida. | Nao ha hash, MFA, rate limit real ou bloqueio de tentativas no servidor. |
| A08 | Software or Data Integrity Failures | Atendido | Pipeline valida lint, TypeScript e Playwright; relatorios e evidencias versionados. | Em producao seria ideal proteger branch principal. |
| A09 | Security Logging and Alerting Failures | Parcialmente atendido | Falhas de login, cadastro duplicado e recuperacao sao registradas localmente. | Nao ha alerta centralizado, painel de auditoria ou monitoramento em servidor. |
| A10 | Mishandling of Exceptional Conditions | Atendido | Chamadas HTTP usam timeout, app possui fallback offline e tratamento de erros com mensagens ao usuario. | Em producao seria recomendado padronizar respostas de erro no backend. |

## 4. Correcoes realizadas para atingir o minimo de 5 itens

### Correcao 1 - Sanitizacao de entradas

Arquivo alterado:

```text
services/data.ts
```

Foi adicionada sanitizacao basica para textos de entrada:

- Remove caracteres `<` e `>`.
- Normaliza espacos duplicados.
- Limita tamanho de nome, titulo, observacao e detalhes de eventos.
- Bloqueia tarefa com titulo vazio apos sanitizacao.

Itens OWASP relacionados:

- A05 Injection
- A10 Mishandling of Exceptional Conditions

### Correcao 2 - Normalizacao de email

Arquivos relacionados:

```text
app/login.tsx
services/data.ts
```

O email agora e tratado em minusculo e sem espacos extras no login e cadastro. Isso reduz falhas falsas de autenticacao e melhora a consistencia dos dados.

Itens OWASP relacionados:

- A07 Authentication Failures
- A10 Mishandling of Exceptional Conditions

### Correcao 3 - Registro local de eventos de seguranca

Arquivo alterado:

```text
services/data.ts
app/login.tsx
```

Foi criado registro local para eventos como:

- Login invalido.
- Erro de login.
- Cadastro duplicado.
- Erro de cadastro.
- Email de recuperacao nao encontrado.
- Erro no fluxo de recuperacao de senha.

Itens OWASP relacionados:

- A09 Security Logging and Alerting Failures
- A01 Broken Access Control
- A07 Authentication Failures

### Correcao 4 - Recuperacao de senha sem expor senha

Arquivo alterado:

```text
app/login.tsx
```

Antes, a recuperacao podia exibir a senha cadastrada. Agora o fluxo abre uma janela, pede o email cadastrado e prepara uma mensagem de email com link de redefinicao, sem mostrar a senha ao usuario.

Itens OWASP relacionados:

- A04 Cryptographic Failures
- A07 Authentication Failures

### Correcao 5 - Pipeline de validacao

Arquivo relacionado:

```text
.github/workflows/playwright.yml
```

O pipeline executa:

- `npm ci`
- `npm run lint`
- `npx tsc --noEmit`
- `npm run test:e2e`

Itens OWASP relacionados:

- A03 Software Supply Chain Failures
- A08 Software or Data Integrity Failures
- A02 Security Misconfiguration

## 5. Analise detalhada por item

### A01:2025 - Broken Access Control

Status: parcialmente atendido.

Acertos:

- O painel de tarefas verifica sessao local antes de liberar acesso.
- O logout remove a sessao do usuario.
- Testes Playwright validam login e logout.

Pendencias:

- O `json-server` nao possui autenticacao/autorizacao real.
- Em producao, o servidor deveria validar usuario, token e propriedade das tarefas.

### A02:2025 - Security Misconfiguration

Status: atendido no escopo academico.

Acertos:

- API pode ser configurada por variavel `EXPO_PUBLIC_API_URL`.
- O projeto ignora arquivos temporarios, caches e relatorios gerados.
- Existe pipeline de validacao no GitHub Actions.
- As chamadas HTTP possuem timeout.

Pendencias:

- Em producao, seria necessario configurar HTTPS, CORS e variaveis protegidas no servidor.

### A03:2025 - Software Supply Chain Failures

Status: atendido no escopo academico.

Acertos:

- Dependencias travadas no `package-lock.json`.
- Pipeline usa `npm ci`, instalando exatamente as versoes registradas.
- Playwright e TypeScript estao em dependencias de desenvolvimento.

Pendencias:

- Recomenda-se incluir auditoria periodica com `npm audit`.

### A04:2025 - Cryptographic Failures

Status: parcialmente atendido.

Acertos:

- A recuperacao de senha nao mostra mais a senha diretamente.
- O fluxo usa link de redefinicao preparado por email.

Pendencias:

- O backend academico ainda armazena senha em texto simples.
- Em producao, a senha deveria usar hash seguro, como bcrypt ou argon2.

### A05:2025 - Injection

Status: atendido no escopo academico.

Acertos:

- O app nao usa SQL.
- Entradas de nome, titulo, observacao e eventos sao sanitizadas.
- Textos muito longos sao limitados.
- Tarefas sem titulo valido sao bloqueadas.

Pendencias:

- Em producao, toda validacao tambem deveria existir no backend.

### A06:2025 - Insecure Design

Status: atendido no escopo academico.

Acertos:

- Processo de SDD documentado.
- Requisitos e testes definidos.
- Fluxos principais testados com evidencias.
- App possui comportamento planejado para online/offline.

Pendencias:

- Versao produtiva exigiria desenho com backend real, tokens, papeis e autorizacao.

### A07:2025 - Authentication Failures

Status: parcialmente atendido.

Acertos:

- Email e senha sao obrigatorios para login.
- Email e comparado normalizado.
- Login invalido nao permite entrada.
- Eventos de falha sao registrados localmente.

Pendencias:

- Nao ha politica forte de senha.
- Nao ha rate limit real.
- Nao ha bloqueio de conta por tentativas repetidas.

### A08:2025 - Software or Data Integrity Failures

Status: atendido no escopo academico.

Acertos:

- Pipeline valida codigo e testes.
- Evidencias e relatorios foram versionados no projeto.
- O projeto possui `package-lock.json`.

Pendencias:

- Em producao, a branch principal deveria exigir pull request e aprovacao.

### A09:2025 - Security Logging and Alerting Failures

Status: parcialmente atendido.

Acertos:

- O app registra eventos de seguranca localmente.
- Falhas de login e recuperacao agora deixam rastros no armazenamento local.

Pendencias:

- Nao existe alerta em tempo real.
- Nao existe monitoramento centralizado em backend.

### A10:2025 - Mishandling of Exceptional Conditions

Status: atendido no escopo academico.

Acertos:

- Chamadas HTTP possuem timeout.
- Falha no backend nao trava o app.
- O app usa fallback offline.
- Operacoes principais possuem `try/catch`.
- Mensagens amigaveis sao exibidas ao usuario.

Pendencias:

- Em producao, o backend deveria padronizar codigos e mensagens de erro.

## 6. Evidencias complementares

Os testes automatizados e prints continuam disponiveis em:

```text
docs/relatorio-testes-playwright.md
docs/evidencias/
tests/tarefas.spec.ts
```

## 7. Conclusao final

O projeto foi revisado conforme o OWASP Top 10:2025. Foram encontrados pontos corretos e pontos parciais. As correcoes aplicadas elevaram o projeto para 6 itens atendidos no escopo academico:

- A02 Security Misconfiguration
- A03 Software Supply Chain Failures
- A05 Injection
- A06 Insecure Design
- A08 Software or Data Integrity Failures
- A10 Mishandling of Exceptional Conditions

Os demais itens ficaram parcialmente atendidos por dependerem de um backend real com autenticacao, autorizacao, logs centralizados e armazenamento seguro de senha.
