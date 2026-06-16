# Relatorio de Seguranca OWASP - TarefasApp

## 1. Objetivo

Avaliar o projeto TarefasApp com base nos principais riscos do padrao OWASP Top 10 e registrar quais pontos foram resolvidos, parcialmente resolvidos ou permanecem como melhoria futura.

Referencia usada: [OWASP Top Ten Web Application Security Risks](https://owasp.org/www-project-top-ten/). A pagina oficial da OWASP informa que a versao atual publicada e a OWASP Top 10 2025, mas este relatorio tambem considera a estrutura A01-A10 usada amplamente em aula e em materiais academicos.

## 2. Resumo geral

| Item OWASP | Risco avaliado | Situacao |
| --- | --- | --- |
| A01 | Broken Access Control | Parcialmente resolvido |
| A02 | Cryptographic Failures | Parcialmente resolvido |
| A03 | Injection | Resolvido para o escopo atual |
| A04 | Insecure Design | Parcialmente resolvido |
| A05 | Security Misconfiguration | Parcialmente resolvido |
| A06 | Vulnerable and Outdated Components | Parcialmente resolvido |
| A07 | Identification and Authentication Failures | Parcialmente resolvido |
| A08 | Software and Data Integrity Failures | Resolvido para o escopo atual |
| A09 | Security Logging and Monitoring Failures | Nao resolvido |
| A10 | Server-Side Request Forgery | Nao aplicavel ao escopo atual |

## 3. Analise detalhada

### A01 - Broken Access Control

Risco: usuario acessar areas do sistema sem autenticacao.

O que foi feito:

- A tela principal verifica se existe usuario em sessao local.
- Quando nao existe sessao, o app redireciona para `/login`.
- Foi criado fluxo de logout para limpar a sessao.

Situacao: parcialmente resolvido.

Pendencia: o backend usado com `json-server` nao possui controle real de autorizacao por usuario. Em uma versao de producao, cada tarefa deveria pertencer a um usuario autenticado e o servidor deveria impedir acesso indevido.

### A02 - Cryptographic Failures

Risco: exposicao de dados sensiveis, como senhas.

O que foi feito:

- O app evita travar quando o backend nao responde.
- A URL da API pode ser configurada por variavel de ambiente.

Situacao: parcialmente resolvido.

Pendencia: as senhas ainda estao armazenadas em texto simples no `db.json`, pois o backend e apenas simulado para fins academicos. Em producao, senhas devem usar hash seguro, como bcrypt ou argon2, e comunicacao HTTPS.

### A03 - Injection

Risco: entrada maliciosa alterar comandos, consultas ou comportamento do sistema.

O que foi feito:

- O projeto nao monta comandos SQL.
- O app trabalha com dados JSON e `json-server`.
- Os campos de entrada sao tratados como texto.

Situacao: resolvido para o escopo atual.

Pendencia: se o projeto evoluir para banco real, sera necessario usar consultas parametrizadas e validacao no servidor.

### A04 - Insecure Design

Risco: falhas de seguranca causadas por desenho inseguro da solucao.

O que foi feito:

- Fluxo de login antes do painel.
- Tratamento de erro quando o backend nao esta disponivel.
- Testes automatizados cobrindo login valido, login invalido, tarefas e logout.
- Processo SDD documentado.

Situacao: parcialmente resolvido.

Pendencia: ainda falta uma arquitetura real de autenticacao no backend, com tokens, expiracao de sessao e autorizacao por usuario.

### A05 - Security Misconfiguration

Risco: configuracoes inseguras, endpoints expostos ou ambiente mal configurado.

O que foi feito:

- API configuravel por `EXPO_PUBLIC_API_URL`.
- Timeout nas chamadas HTTP para evitar carregamento infinito.
- `.gitignore` configurado para ignorar arquivos locais, cache e relatorios temporarios.
- Workflow de validacao criado no GitHub Actions.

Situacao: parcialmente resolvido.

Pendencia: em producao, seria necessario configurar HTTPS, CORS restrito, variaveis de ambiente protegidas e servidor real.

### A06 - Vulnerable and Outdated Components

Risco: uso de bibliotecas vulneraveis ou desatualizadas.

O que foi feito:

- Dependencias controladas por `package-lock.json`.
- Pipeline usa `npm ci`, garantindo instalacao reprodutivel.
- Lint e TypeScript foram incluidos na validacao.

Situacao: parcialmente resolvido.

Pendencia: recomenda-se rodar periodicamente `npm audit` e atualizar dependencias quando surgirem correcoes de seguranca.

### A07 - Identification and Authentication Failures

Risco: falhas no processo de login, autenticacao fraca ou recuperacao de senha insegura.

O que foi feito:

- Login exige email e senha.
- Login invalido nao permite acesso ao painel.
- Logout limpa a sessao local.
- Foram criados testes automatizados para login vazio, login valido e senha invalida.

Situacao: parcialmente resolvido.

Pendencia: o app academico usa senha simples para teste. Em producao, deve haver senha forte, hash no servidor, limite de tentativas, recuperacao de senha por token e expiracao de sessao.

### A08 - Software and Data Integrity Failures

Risco: alteracao indevida do codigo, dependencias ou processo de entrega.

O que foi feito:

- `package-lock.json` fixa as versoes instaladas.
- GitHub Actions executa validacoes antes da entrega.
- Testes E2E validam o comportamento principal do app.

Situacao: resolvido para o escopo atual.

Pendencia: em producao, seria recomendado proteger branch principal e exigir aprovacao de pull request.

### A09 - Security Logging and Monitoring Failures

Risco: falta de logs e monitoramento para identificar erros ou ataques.

O que foi feito:

- O app registra alguns erros com `console.log` durante o desenvolvimento.

Situacao: nao resolvido.

Pendencia: implementar logs estruturados no backend, monitoramento de erros, auditoria de login e registro de alteracoes importantes.

### A10 - Server-Side Request Forgery

Risco: servidor fazer requisicoes indevidas para destinos controlados por atacante.

O que foi feito:

- O app nao possui funcionalidade em que o usuario informa uma URL para o servidor acessar.
- O backend simulado nao executa requisicoes externas.

Situacao: nao aplicavel ao escopo atual.

Pendencia: se futuramente houver upload, webhooks ou integracao com URLs externas, sera necessario validar destinos permitidos.

## 4. Conclusao

O projeto atende ao objetivo academico de aplicar SDD e avaliar seguranca pelo padrao OWASP. Os principais riscos foram identificados e documentados, com controles implementados no escopo atual do aplicativo.

Pontos resolvidos ou cobertos no projeto:

- Login antes do painel.
- Logout funcional.
- Tratamento de erro de backend.
- Timeout nas chamadas de rede.
- Testes automatizados com evidencias.
- Pipeline no GitHub Actions.
- Relatorio OWASP documentado.

Pontos que ficam como melhoria futura para producao:

- Backend real com autenticacao segura.
- Senhas com hash.
- HTTPS obrigatorio.
- Autorizacao por usuario.
- Logs e monitoramento.
- Politica de senha forte e recuperacao por token.
