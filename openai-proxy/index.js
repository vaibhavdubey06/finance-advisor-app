import express from 'express';
import axios from 'axios';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// OpenRouter/Claude endpoint
app.post('/api/chat', async (req, res) => {
  try {
    // Build OpenRouter API request body
    const openRouterBody = {
      model: 'anthropic/claude-3-sonnet-20240229',
      messages: req.body.messages,
      ...req.body.extra // allow for any extra fields if needed
    };
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      openRouterBody,
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    res.json(response.data);
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: err.message, details: err.response?.data });
  }
});

// Gemini endpoint
app.post('/api/gemini', async (req, res) => {
  try {
    const { messages, systemPrompt } = req.body;
    
    // Debug: Log what we received
    console.log('Received messages:', messages);
    console.log('Received systemPrompt:', systemPrompt);
    
    // Build the full conversation context
    let fullContext = systemPrompt + '\n\n';
    
    // Add conversation history
    if (messages && messages.length > 0) {
      messages.forEach(msg => {
        if (msg.role === 'user') {
          fullContext += `User: ${msg.content}\n\n`;
        } else if (msg.role === 'assistant') {
          fullContext += `Assistant: ${msg.content}\n\n`;
        }
      });
    }
    
    console.log('Full context being sent to Gemini:', fullContext);
    
    // Convert to Gemini format
    const geminiPayload = {
      contents: [
        {
          parts: [
            { text: fullContext }
          ]
        }
      ]
    };

    const response = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
      geminiPayload,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': process.env.GEMINI_API_KEY,
        },
      }
    );

    const geminiReply = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No response from Gemini.';
    
    // Return in a format similar to OpenAI/Claude for consistency
    res.json({
      choices: [{
        message: {
          content: geminiReply
        }
      }]
    });
  } catch (err) {
    console.error('Gemini API error:', err.response?.data || err.message);
    res.status(err.response?.status || 500).json({ 
      error: err.message, 
      details: err.response?.data 
    });
  }
});

// Groq endpoint with streaming support
app.post('/api/groq', async (req, res) => {
  console.log('Received /api/groq request', req.body);
  try {
    const { messages, stream } = req.body;
    const groqBody = {
      model: 'llama3-70b-8192',
      messages,
      stream: !!stream
    };
    if (stream) {
      // Streaming mode: forward as SSE
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      const response = await axios({
        method: 'post',
        url: 'https://api.groq.com/openai/v1/chat/completions',
        data: groqBody,
        responseType: 'stream',
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
      });
      response.data.on('data', (chunk) => {
        res.write(chunk);
      });
      response.data.on('end', () => {
        res.end();
      });
      response.data.on('error', (err) => {
        res.end();
      });
    } else {
      // Non-streaming mode
      const response = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        groqBody,
        {
          headers: {
            'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );
      res.json(response.data);
    }
  } catch (err) {
    res.status(500).json({
      error: err.message,
      details: err.response?.data ? (typeof err.response.data === 'object' ? JSON.stringify(err.response.data) : err.response.data) : undefined
    });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
  console.log(`- OpenRouter/Claude endpoint: /api/chat`);
  console.log(`- Gemini endpoint: /api/gemini`);
  console.log(`- Groq endpoint: /api/groq`);
}); 