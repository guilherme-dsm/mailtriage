# MailTriage

Sistema de triagem inteligente de e-mail: você cria **Triggers** (regras) sobre o que é relevante — por remetente exato, palavra-chave, ou contexto semântico — e uma automação monitora sua caixa de entrada, aplicando essas regras (usando IA apenas quando o critério exige entender o conteúdo do e-mail) e organizando os e-mails triados num painel próprio.

## O problema que resolve

Caixas de e-mail acumulam muita coisa irrelevante. Em vez de filtros fixos, o MailTriage permite Triggers mais expressivos, cada um com múltiplos valores associados:

- **Remetente exato**: um ou mais e-mails específicos (ex: `autosau@puc-rio.br`)
- **Palavra-chave**: uma ou mais palavras/frases literais (ex: `boleto`, `fatura`)
- **Semântica**: um ou mais contextos em linguagem natural (ex: "vaga de estágio"), avaliados por um LLM — reconhece e-mails relacionados mesmo sem bater a palavra exata

## Stack

| Camada | Tecnologia |
|---|---|
| Backend | Node.js + TypeScript + Express |
| Banco de dados | PostgreSQL (Neon) |
| Automação | n8n |
| IA | LLM (Anthropic Claude Haiku) para classificação semântica |
| Frontend | React + Vite + TypeScript |
| Deploy | Render (backend) + Vercel (frontend) |

## Arquitetura (visão geral)

```
Gmail (novo e-mail)
    → n8n (trigger via Gmail API)
    → busca Triggers ativos no backend
    → Trigger determinístico (remetente/palavra-chave): checagem direta
    → Trigger semântico: consulta ao LLM
    → e-mails que bateram são salvos via API
    → frontend exibe os e-mails triados, agrupados por Trigger
```

## Modelo de dados

```
triggers (1) ──< trigger_valores (N)
     │
     └──< emails_triados (N, referenciando também o valor específico que bateu)
```

- **`triggers`**: nome, tipo (`semantica` | `email` | `palavra_chave`), status ativo/inativo
- **`trigger_valores`**: os valores individuais de cada Trigger (um Trigger pode ter vários)
- **`emails_triados`**: e-mails capturados, ligados ao Trigger e ao valor específico que os capturou

## Estrutura do projeto

```
mailtriage/
├── backend/     # API REST (Node + TypeScript + Express)
│   └── src/
│       ├── db.ts           # conexão com o Postgres (Pool)
│       ├── server.ts       # setup do Express
│       └── routes/
│           └── triggers.ts # CRUD de Triggers
└── frontend/    # Painel de triagem (React + Vite + TypeScript) — ainda não iniciado
```

## API — endpoints disponíveis

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/triggers` | Cria um Trigger com seus valores (transação) |
| `GET` | `/triggers` | Lista todos os Triggers, com valores agrupados |
| `PATCH` | `/triggers/:id` | Atualiza nome, tipo e/ou status ativo (parcial) |
| `DELETE` | `/triggers/:id` | Remove um Trigger e seus valores (cascade) |

## Status do projeto

- [x] Fase 0 — Fundamentos (Gmail API/OAuth, n8n, regras determinísticas vs. semânticas)
- [x] Fase 1 — Backend base (schema do banco, API CRUD completa de Triggers)
- [ ] Fase 2 — Frontend React (telas de criação e listagem de Triggers)
- [ ] Fase 3 — Integração n8n + Gmail (triagem determinística)
- [ ] Fase 4 — Classificação semântica com IA
- [ ] Fase 5 — Tela de triagem (e-mails capturados, expansíveis)
- [ ] Fase 6 — Refinamentos (HTML seguro do e-mail) e deploy

## Rodando localmente

### Backend

```bash
cd backend
npm install
npm run dev
```

Servidor sobe em `http://localhost:3000`.

Variáveis de ambiente necessárias (`backend/.env`):

```
DATABASE_URL=postgresql://usuario:senha@seu-projeto.neon.tech/mailtriage?sslmode=require
PORT=3000
```

### Testando a API

```bash
# Criar um Trigger
curl -X POST http://localhost:3000/triggers \
  -H "Content-Type: application/json" \
  -d '{"nome": "Vagas de estágio", "tipo": "semantica", "valores": ["vaga de estágio", "oportunidade para estudante"]}'

# Listar Triggers
curl http://localhost:3000/triggers

# Ativar um Trigger
curl -X PATCH http://localhost:3000/triggers/1 -H "Content-Type: application/json" -d '{"ativo": true}'

# Deletar um Trigger
curl -X DELETE http://localhost:3000/triggers/1
```

## Autor

Guilherme — projeto pessoal de estudo, desenvolvido com foco em aprender Node.js, TypeScript, React e automações com n8n.
