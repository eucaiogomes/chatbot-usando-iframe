# 🤖 Chatbot Web — IFrame Ready

Interface de chatbot completa com frontend HTML + backend Node.js integrado à API da **Groq** (LLaMA 3 70B).

---

## 📁 Estrutura do Projeto

```
chatbot-project/
├── frontend/
│   └── chatbot.html        ← Interface do chat (pode ser servida via CDN ou servidor estático)
├── backend/
│   ├── server.js           ← API Express + integração Groq
│   ├── package.json
│   ├── .env.example        ← Modelo de configuração
│   └── .gitignore
└── README.md
```

---

## ⚡ Como rodar localmente

### 1. Pré-requisitos
- [Node.js 18+](https://nodejs.org/)
- Conta na [Groq](https://console.groq.com) para obter a API Key

### 2. Instalar dependências

```bash
cd backend
npm install
```

### 3. Configurar variáveis de ambiente

```bash
# Crie o arquivo .env a partir do exemplo
cp .env.example .env
```

Edite o `.env` e preencha sua API Key:

```env
GROQ_API_KEY=sua_chave_aqui
PORT=3001
```

### 4. Iniciar o backend

```bash
# Produção
npm start

# Desenvolvimento (com auto-reload)
npm run dev
```

O servidor estará disponível em: `http://localhost:3001`

### 5. Abrir o frontend

Abra o arquivo `frontend/chatbot.html` diretamente no navegador.  
Ou sirva-o com qualquer servidor estático.

---

## 🚀 Deploy em Produção

### Opção 1: Render (recomendado — gratuito)

1. Crie conta em [render.com](https://render.com)
2. Clique em **New → Web Service**
3. Conecte seu repositório GitHub com a pasta `/backend`
4. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Em **Environment Variables**, adicione:
   - `GROQ_API_KEY` = sua chave
   - `NODE_ENV` = `production`
6. Após o deploy, copie a URL gerada (ex: `https://meu-bot.onrender.com`)

### Opção 2: Railway

1. Crie conta em [railway.app](https://railway.app)
2. Clique em **New Project → Deploy from GitHub**
3. Selecione a pasta `backend` como root
4. Adicione as variáveis de ambiente no painel
5. Deploy automático!

### Opção 3: VPS (DigitalOcean, AWS, etc.)

```bash
# Instale pm2 para manter o processo ativo
npm install -g pm2

# Inicie o servidor
pm2 start server.js --name chatbot-backend

# Auto-iniciar após reboot
pm2 startup
pm2 save
```

---

## 🌐 Configurar o Frontend para Produção

Após fazer o deploy do backend, edite o arquivo `chatbot.html` e altere a URL:

```javascript
// Linha ~120 do chatbot.html
const BACKEND_URL = 'https://meu-bot.onrender.com'; // ← URL do seu backend em produção
```

Então hospede o `chatbot.html` em qualquer servidor estático:
- [Netlify Drop](https://app.netlify.com/drop) — arraste o arquivo
- [Vercel](https://vercel.com) — deploy via CLI ou GitHub
- [GitHub Pages](https://pages.github.com)
- Servidor próprio com Nginx/Apache

---

## 🖼️ Integrando via IFrame

Com o frontend hospedado, use a URL no seu sistema externo:

```html
<iframe
  src="https://SEU-DOMINIO/chatbot.html"
  width="420"
  height="600"
  frameborder="0"
  style="border-radius: 16px; box-shadow: 0 8px 40px rgba(0,0,0,0.3);"
  allow="clipboard-write"
></iframe>
```

---

## ⚙️ Personalização

### Mudar o modelo da Groq

Em `backend/server.js`, linha ~47:
```javascript
model: 'llama3-70b-8192',    // Padrão
// model: 'mixtral-8x7b-32768', // Alternativa mais leve
// model: 'gemma2-9b-it',       // Outra opção
```

### Mudar a personalidade do bot

Em `backend/server.js`, no campo `content` do `system`:
```javascript
content: `Você é um assistente de suporte da Empresa XYZ.
Responda apenas sobre nossos produtos.
Seja sempre educado e profissional.`,
```

### Mudar o título do chat

Em `frontend/chatbot.html`:
```html
<h1>Assistente Virtual</h1>  ← Altere aqui
```

---

## 🔒 Segurança

- ✅ A `GROQ_API_KEY` **nunca** é enviada ao frontend
- ✅ Todas as chamadas à API passam pelo backend
- ✅ Validação de input no servidor
- ✅ Limite de tamanho de mensagem (4000 chars)
- ⚠️ Em produção, configure o `cors` com a origem exata do seu frontend:

```javascript
// server.js — substitua '*' pelo seu domínio
app.use(cors({ origin: 'https://meu-frontend.netlify.app' }));
```

---

## 📞 Endpoints da API

| Método | Rota    | Descrição            |
|--------|---------|----------------------|
| GET    | `/`     | Health check         |
| POST   | `/chat` | Enviar mensagem      |

**POST /chat — body:**
```json
{ "message": "Olá, como posso te usar?" }
```

**Resposta:**
```json
{ "reply": "Olá! Sou um assistente virtual..." }
```

---

## 🐛 Problemas Comuns

| Problema | Solução |
|----------|---------|
| `GROQ_API_KEY não encontrada` | Verifique se o arquivo `.env` existe e está correto |
| `CORS error no browser` | Configure a origem correta no `server.js` |
| `fetch failed` no chatbot | Verifique se o `BACKEND_URL` no HTML aponta para o endereço certo |
| Modelo indisponível | Troque `llama3-70b-8192` por `mixtral-8x7b-32768` no `server.js` |

---

*Desenvolvido com Node.js + Express + Groq API (LLaMA 3)*
