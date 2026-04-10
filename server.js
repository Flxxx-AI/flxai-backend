const express = require('express');
const { Groq } = require('groq-sdk');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Tu API key está SEGURA en el servidor
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY  // ← Solo tú sabes esto
});

// Endpoint para chat normal
app.post('/api/chat', async (req, res) => {
  try {
    const { message, language } = req.body;
    
    const systemPrompt = language === 'es' 
      ? 'Eres FlxAI_, un asistente de IA premium... Responde en ESPAÑOL.'
      : 'You are FlxAI_, a premium AI assistant... Answer in ENGLISH.';
    
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      temperature: 0,
      max_tokens: 60
    });
    
    res.json({ success: true, response: completion.choices[0].message.content.trim() });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

// Endpoint para imágenes
app.post('/api/chat-with-image', async (req, res) => {
  try {
    const { message, imageBase64, language } = req.body;
    
    const completion = await groq.chat.completions.create({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: message || (language === 'es' ? 'Describe esta imagen' : 'Describe this image') },
            { type: 'image_url', image_url: { url: imageBase64 } }
          ]
        }
      ],
      temperature: 0.3,
      max_tokens: 150
    });
    
    res.json({ success: true, response: completion.choices[0].message.content.trim() });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 FlxAI_ Backend running on http://localhost:${PORT}`);
});