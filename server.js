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

app.post('/api/chat', async (req, res) => {
  try {
    const { message, language } = req.body;
    
    const systemPrompt = language === 'es' 
      ? 'Responde con UNA frase corta. Máximo 8 palabras. Directo al grano.'
      : 'Answer with ONE short sentence. Max 8 words. Direct to the point.';
    
    const completion = await groq.chat.completions.create({
      model: 'llama3-8b-8192',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      temperature: 0,
      max_tokens: 50
    });
    
    res.json({ success: true, response: completion.choices[0].message.content.trim() });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

app.post('/api/chat-with-image', async (req, res) => {
  try {
    const { message, imageBase64, language } = req.body;
    
    const textPrompt = message || (language === 'es' 
      ? 'Describe en 5 palabras' 
      : 'Describe in 5 words');
    
    const completion = await groq.chat.completions.create({
      model: 'llama3-8b-8192',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: textPrompt },
            { type: 'image_url', image_url: { url: imageBase64 } }
          ]
        }
      ],
      temperature: 0,
      max_tokens: 50
    });
    
    res.json({ success: true, response: completion.choices[0].message.content.trim() });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 FlxAI_ Backend running on http://localhost:${PORT}`);
});