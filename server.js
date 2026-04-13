const express = require('express');
const { Groq } = require('groq-sdk');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '100mb' }));

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// ========== ENDPOINT PARA TEXTO ==========
app.post('/api/chat', async (req, res) => {
  try {
    const { message, language } = req.body;
    
    const systemPrompt = language === 'es' 
      ? `Eres FlxAI_, un asistente de IA premium creado por daSqu1d. 
Tu nombre es FlxAI_. 
- Cuando te pregunten "cuál es tu nombre", responde "Soy FlxAI_, un asistente de IA creado por daSqu1d."
- Cuando te pregunten "quién te creó", responde "Fui creado por daSqu1d."
- Cuando te pregunten "quién es daSqu1d", responde "daSqu1d es mi creador. Si necesitas ayuda o sugerencias, puedes consultar su Discord: dasqu1d_"
- No digas que no tienes nombre.
Responde de forma directa y concisa.`

      : `You are FlxAI_, a premium AI assistant created by daSqu1d. 
Your name is FlxAI_. 
- When asked "what is your name", answer "I am FlxAI_, an AI assistant created by daSqu1d."
- When asked "who created you", answer "I was created by daSqu1d."
- When asked "who is daSqu1d", answer "daSqu1d is my creator. If you need help or suggestions, you can contact him on Discord: dasqu1d_"
- Do not say you have no name.
Answer directly and concisely.`;
    
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      temperature: 0.3,
      max_tokens: 2000
    });
    
    res.json({ success: true, response: completion.choices[0].message.content.trim() });
  } catch (error) {
    console.error('Error in /api/chat:', error);
    res.json({ success: false, error: error.message });
  }
});

// ========== ENDPOINT PARA IMÁGENES ==========
app.post('/api/chat-with-image', async (req, res) => {
  try {
    const { message, imageBase64, language } = req.body;
    
    const textPrompt = (message && typeof message === 'string' && message.trim() !== '') 
      ? message 
      : (language === 'es' ? 'Describe esta imagen' : 'Describe this image');
    
    if (!imageBase64 || typeof imageBase64 !== 'string') {
      throw new Error('Invalid image data');
    }
    
    const completion = await groq.chat.completions.create({
      model: 'llava-v1.5-7b',  // ← MODELO DE VISIÓN ACTIVO
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: textPrompt },
            { type: 'image_url', image_url: { url: imageBase64 } }
          ]
        }
      ],
      temperature: 0.3,
      max_tokens: 500
    });
    
    res.json({ success: true, response: completion.choices[0].message.content.trim() });
  } catch (error) {
    console.error('Error in /api/chat-with-image:', error);
    res.json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 FlxAI_ Backend running on http://localhost:${PORT}`);
});