/**
 * server.js — Backend do Chatbot
 * 
 * Responsável por:
 *  - Receber mensagens do frontend via POST /chat
 *  - Encaminhar para a API da Groq (compatível com OpenAI)
 *  - Retornar a resposta ao frontend
 *  - Manter a API KEY segura (nunca exposta ao browser)
 */

require('dotenv').config(); // Carrega variáveis do arquivo .env

const express    = require('express');
const cors       = require('cors');
const { OpenAI } = require('openai');

const app  = express();
const PORT = process.env.PORT || 3001;

/* ─── Cliente Groq (compatível com OpenAI SDK) ────────────── */
const groq = new OpenAI({
  apiKey:  process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
});

/* ─── Middleware ──────────────────────────────────────────── */

// Permite requisições do frontend (ajuste a origem em produção)
app.use(cors({
  origin: '*', // Em produção, substitua '*' pelo domínio do seu frontend
  methods: ['POST', 'GET'],
}));

// Interpreta JSON no corpo das requisições
app.use(express.json());

/* ─── Rota de health-check ────────────────────────────────── */
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Chatbot backend online 🤖' });
});

/* ─── Rota principal: POST /chat ──────────────────────────── */
app.post('/chat', async (req, res) => {
  const { message } = req.body;

  // Validação básica
  if (!message || typeof message !== 'string' || message.trim() === '') {
    return res.status(400).json({ error: 'Campo "message" é obrigatório.' });
  }

  if (message.length > 4000) {
    return res.status(400).json({ error: 'Mensagem muito longa (máx. 4000 caracteres).' });
  }

  try {
    /* Chama a API da Groq ─────────────────────────────────── */
    const completion = await groq.chat.completions.create({
      model: 'llama3-70b-8192',          // Modelo principal
      // model: 'mixtral-8x7b-32768',    // Alternativa se llama3 estiver indisponível
      messages: [
        {
          role: 'system',
          // Personalize o comportamento do bot aqui:
          content: `Você é um assistente virtual prestativo, claro e amigável.
Responda sempre em português brasileiro.
Seja objetivo, mas completo nas respostas.
Evite markdown excessivo — prefira texto simples e parágrafos curtos.`,
        },
        {
          role: 'user',
          content: message.trim(),
        },
      ],
      max_tokens:  1024,
      temperature: 0.7,
    });

    // Extrai o texto da resposta
    const reply = completion.choices?.[0]?.message?.content?.trim();

    if (!reply) {
      throw new Error('Resposta vazia da API.');
    }

    return res.json({ reply });

  } catch (err) {
    console.error('[Groq API] Erro:', err?.message || err);

    /* Tratamento de erros específicos ──────────────────────── */
    if (err?.status === 401) {
      return res.status(500).json({ error: 'API Key inválida ou sem permissão.' });
    }

    if (err?.status === 429) {
      return res.status(429).json({ error: 'Muitas requisições. Aguarde um momento e tente novamente.' });
    }

    if (err?.status === 503 || err?.code === 'ECONNREFUSED') {
      return res.status(503).json({ error: 'Serviço temporariamente indisponível. Tente mais tarde.' });
    }

    // Erro genérico — não expõe detalhes internos ao cliente
    return res.status(500).json({
      error: 'Ocorreu um erro ao processar sua mensagem. Tente novamente.',
    });
  }
});

/* ─── Inicia o servidor ───────────────────────────────────── */
app.listen(PORT, () => {
  console.log(`\n🤖 Chatbot backend rodando em http://localhost:${PORT}`);
  console.log(`   GROQ_API_KEY: ${process.env.GROQ_API_KEY ? '✅ carregada' : '❌ NÃO ENCONTRADA'}`);
  console.log(`   Ambiente: ${process.env.NODE_ENV || 'development'}\n`);
});
