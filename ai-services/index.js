const express = require('express');
const app = express();
const PORT = process.env.AI_PORT || 3002;

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ 
    message: '🧠 Servicios de IA de Period Care funcionando!',
    services: ['emotion-detector', 'prompt-builder', 'llm-integration']
  });
});

app.listen(PORT, () => {
  console.log(`🤖 Servicios de IA ejecutándose en puerto ${PORT}`);
});
