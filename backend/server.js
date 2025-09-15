const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const Groq = require('groq-sdk');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Inicializar Groq con manejo de errores
let groq = null;
try {
  groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });
  console.log('🤖 Groq SDK inicializado correctamente');
} catch (error) {
  console.error('❌ Error inicializando Groq SDK:', error.message);
}

// Configuración de modelos disponibles (actualizado a Sep 2025)
const GROQ_MODELS = {
  fast: "llama-3.1-8b-instant",        // Más rápido para respuestas generales
  balanced: "llama-3.1-70b-versatile", // Balanceado para conversaciones
  creative: "mixtral-8x7b-32768"       // Para respuestas más creativas
};

// Middleware mejorado
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "wss:", "ws:"],
    },
  },
}));

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
}));

app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Función helper para validar API key
const validateGroqKey = () => {
  if (!process.env.GROQ_API_KEY) {
    return {
      valid: false,
      error: 'GROQ_API_KEY no configurada en variables de entorno'
    };
  }
  
  if (!process.env.GROQ_API_KEY.startsWith('gsk_')) {
    return {
      valid: false,
      error: 'GROQ_API_KEY parece inválida (debe comenzar con "gsk_")'
    };
  }
  
  return { valid: true };
};

// Función helper para generar respuestas de fallback
const getFallbackResponse = (message) => {
  const responses = [
    "Entiendo cómo te sientes. Los cambios hormonales durante el ciclo menstrual pueden afectar mucho nuestro bienestar emocional. Es completamente normal sentir estas fluctuaciones.",
    "Lo que describes es muy común entre las mujeres. Las variaciones hormonales pueden influir significativamente en nuestro estado de ánimo. ¿Has notado si estos cambios coinciden con momentos específicos de tu ciclo?",
    "Te comprendo perfectamente. Los síntomas emocionales relacionados con el ciclo menstrual son reales y completamente válidos. Algunas técnicas de relajación y autocuidado pueden ser muy beneficiosas.",
    "Es valiente de tu parte compartir cómo te sientes. Las fluctuaciones hormonales pueden ser desafiantes, pero existen estrategias efectivas que pueden ayudarte a sentirte mejor y más en control.",
    "Reconozco la dificultad de lo que estás experimentando. El autoconocimiento de tu ciclo menstrual y técnicas de cuidado personal pueden ser herramientas muy útiles en estos momentos.",
    "Gracias por confiar en mí. Los cambios que describes son parte natural del ciclo femenino. Te recomiendo llevar un registro de síntomas para identificar patrones y consultar con un especialista si es necesario."
  ];
  
  // Seleccionar respuesta basada en palabras clave del mensaje
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('dolor') || lowerMessage.includes('molest')) {
    return "Entiendo que estés experimentando molestias. El dolor menstrual es común pero no debería interferir significativamente con tu vida diaria. Técnicas como aplicar calor, ejercicio suave y relajación pueden ayudar. Si el dolor es severo, es recomendable consultar con un ginecólogo.";
  }
  
  if (lowerMessage.includes('ánimo') || lowerMessage.includes('triste') || lowerMessage.includes('ansiedad')) {
    return "Los cambios de ánimo son muy comunes durante el ciclo menstrual debido a las fluctuaciones hormonales. Es importante que sepas que lo que sientes es válido. Mantener rutinas de autocuidado, ejercicio regular y técnicas de mindfulness pueden ser muy beneficiosas.";
  }
  
  if (lowerMessage.includes('retraso') || lowerMessage.includes('irregular')) {
    return "Los ciclos irregulares pueden tener múltiples causas como estrés, cambios de peso, ejercicio excesivo o condiciones hormonales. Es normal tener algunas variaciones ocasionales. Si persiste la irregularidad, te recomiendo llevar un registro y consultar con un especialista.";
  }
  
  // Respuesta general
  return responses[Math.floor(Math.random() * responses.length)];
};

// ============= RUTAS PRINCIPALES =============

// Ruta principal con información detallada
app.get('/', (req, res) => {
  const keyValidation = validateGroqKey();
  
  res.json({ 
    message: '🌸 Lia Period Care API - Sistema de Salud Menstrual',
    version: '3.1.0',
    status: 'online',
    timestamp: new Date().toISOString(),
    ai_provider: 'Groq',
    model_status: {
      current_model: GROQ_MODELS.fast,
      available_models: Object.values(GROQ_MODELS),
      groq_configured: keyValidation.valid
    },
    endpoints: {
      health: '/api/health',
      test_page: '/test',
      ai_chat: '/api/test-ai',
      advanced_chat: '/api/chat'
    }
  });
});

// Health check mejorado
app.get('/api/health', (req, res) => {
  const keyValidation = validateGroqKey();
  
  const healthCheck = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV || 'development',
    services: {
      groq: {
        configured: keyValidation.valid,
        models_available: GROQ_MODELS,
        error: keyValidation.error || null
      },
      server: 'operational',
      cors: 'enabled'
    }
  };
  
  res.json(healthCheck);
});

// Página de pruebas
app.get('/test', (req, res) => {
  const testPageExists = require('fs').existsSync(path.join(__dirname, 'test-ai.html'));
  
  if (testPageExists) {
    res.sendFile(path.join(__dirname, 'test-ai.html'));
  } else {
    res.json({
      message: '🧪 Endpoint de pruebas activo',
      note: 'Archivo test-ai.html no encontrado',
      test_endpoints: {
        'POST /api/test-ai': 'Prueba la IA con un mensaje simple',
        'POST /api/chat': 'Chat avanzado con historial'
      },
      example_request: {
        url: '/api/test-ai',
        method: 'POST',
        body: { message: 'Hola Lia, ¿cómo estás?' }
      }
    });
  }
});

// ============= ENDPOINT PRINCIPAL DE IA =============
app.post('/api/test-ai', async (req, res) => {
  try {
    const { message, model_preference = 'fast' } = req.body;
    
    // Validaciones
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Se requiere un mensaje válido',
        example: { message: 'Hola Lia, tengo algunas dudas sobre mi ciclo menstrual' }
      });
    }

    if (message.length > 1000) {
      return res.status(400).json({ 
        error: 'El mensaje es demasiado largo (máximo 1000 caracteres)',
        current_length: message.length
      });
    }

    // Validar configuración de Groq
    const keyValidation = validateGroqKey();
    if (!keyValidation.valid) {
      console.log('⚠️ Groq no configurado, usando respuesta simulada...');
      
      return res.json({
        success: true,
        message: message.trim(),
        response: getFallbackResponse(message),
        timestamp: new Date().toISOString(),
        model: "lia-fallback-enhanced",
        provider: "Local Simulation",
        response_time_ms: Math.floor(Math.random() * 200) + 100,
        note: "⚠️ Respuesta simulada inteligente (Groq no configurado)",
        suggestion: "Configura GROQ_API_KEY para respuestas de IA real"
      });
    }

    console.log(`💭 Mensaje recibido: "${message.substring(0, 50)}${message.length > 50 ? '...' : ''}"`);
    console.log(`⚡ Procesando con Groq modelo: ${GROQ_MODELS[model_preference]}...`);
    
    const startTime = Date.now();
    
    // Llamada a Groq con modelo actualizado
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `Eres Lia, una asistente de inteligencia artificial especializada en salud menstrual y bienestar femenino.

IDENTIDAD Y PERSONALIDAD:
- Empática, comprensiva, cálida y profesional
- Especializada en menstruación, síndrome premenstrual, salud reproductiva
- Brindas apoyo emocional basado en evidencia científica
- Usas un tono amigable pero siempre profesional
- Validas las emociones y ofreces consejos prácticos

PAUTAS DE RESPUESTA:
- SIEMPRE responde en español
- Sé empática y comprensiva
- Valida las emociones de la persona
- Ofrece consejos útiles cuando sea apropiado
- Recuerda que NO reemplazas consulta médica profesional
- Mantén respuestas claras y accesibles
- Máximo 250 palabras por respuesta
- Si no es sobre salud menstrual, mantén empatía pero sugiere consulta especializada

TEMAS PRINCIPALES:
- Ciclo menstrual y sus fases
- Síntomas premenstruales (físicos y emocionales)
- Dolor menstrual y manejo
- Irregularidades menstruales
- Salud reproductiva general
- Bienestar emocional relacionado
- Autocuidado durante el ciclo

IMPORTANTE: Siempre recomienda consulta médica para síntomas severos o persistentes.`
        },
        {
          role: "user",
          content: message.trim()
        }
      ],
      model: GROQ_MODELS[model_preference] || GROQ_MODELS.fast,
      temperature: parseFloat(process.env.AI_RESPONSE_TEMPERATURE) || 0.7,
      max_tokens: parseInt(process.env.AI_RESPONSE_MAX_LENGTH) || 400,
      top_p: 1,
      stream: false,
      stop: null
    });

    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    const aiResponse = chatCompletion.choices[0].message.content;
    
    console.log(`✅ Respuesta de Groq en ${responseTime}ms`);
    
    res.json({
      success: true,
      message: message.trim(),
      response: aiResponse,
      timestamp: new Date().toISOString(),
      model: GROQ_MODELS[model_preference] || GROQ_MODELS.fast,
      provider: "Groq",
      response_time_ms: responseTime,
      tokens_used: chatCompletion.usage?.total_tokens || 0,
      note: "🚀 Respuesta generada por Groq AI (Actualizado 2025)"
    });

  } catch (error) {
    console.error('❌ Error con Groq:', error);
    
    // Análisis detallado de errores
    let errorMessage = 'Error interno del servidor';
    let statusCode = 500;
    let suggestion = 'Inténtalo de nuevo en unos minutos';
    
    if (error.message?.includes('API key')) {
      errorMessage = 'API Key de Groq inválida o expirada';
      statusCode = 401;
      suggestion = 'Verifica tu API key en https://console.groq.com/';
    } else if (error.message?.includes('quota') || error.message?.includes('limit') || error.message?.includes('rate')) {
      errorMessage = 'Límite de uso alcanzado';
      statusCode = 429;
      suggestion = 'Espera unos minutos antes de intentar nuevamente';
    } else if (error.message?.includes('model') || error.message?.includes('decommissioned')) {
      errorMessage = 'Modelo no disponible';
      statusCode = 400;
      suggestion = 'El modelo está siendo actualizado, usando respuesta simulada';
    } else if (error.message?.includes('network') || error.message?.includes('timeout')) {
      errorMessage = 'Problema de conexión con Groq';
      statusCode = 503;
      suggestion = 'Verifica tu conexión a internet';
    }
    
    // Fallback inteligente para errores no críticos
    if (statusCode >= 400 && statusCode < 500) {
      console.log('⚠️ Error de Groq, usando respuesta simulada inteligente...');
      
      return res.json({
        success: true,
        message: req.body.message?.trim() || '',
        response: getFallbackResponse(req.body.message || ''),
        timestamp: new Date().toISOString(),
        model: "lia-fallback-enhanced",
        provider: "Local Simulation",
        response_time_ms: Math.floor(Math.random() * 300) + 150,
        note: "⚠️ Respuesta simulada inteligente (Groq temporalmente no disponible)",
        original_error: errorMessage
      });
    }
    
    // Error crítico
    res.status(statusCode).json({ 
      error: errorMessage,
      details: error.message,
      type: 'groq_error',
      suggestion: suggestion,
      timestamp: new Date().toISOString()
    });
  }
});

// ============= CHAT AVANZADO CON HISTORIAL =============
app.post('/api/chat', async (req, res) => {
  try {
    const { message, conversation_history, model_preference = 'balanced' } = req.body;
    
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Se requiere un mensaje válido para el chat',
        example: { 
          message: 'Tengo dolores menstruales muy fuertes',
          conversation_history: []
        }
      });
    }

    const keyValidation = validateGroqKey();
    if (!keyValidation.valid) {
      return res.status(500).json({ 
        error: 'Groq API Key no configurada correctamente',
        details: keyValidation.error,
        solution: 'Configura GROQ_API_KEY en tu archivo .env'
      });
    }

    // Preparar mensajes con contexto
    const messages = [
      {
        role: "system",
        content: `Eres Lia, asistente especializada en salud menstrual. 

CONTEXTO DE CONVERSACIÓN:
- Mantén coherencia con el historial de la conversación
- Recuerda detalles importantes mencionados anteriormente
- Brinda apoyo personalizado y continuo
- Responde siempre en español
- Máximo 300 palabras por respuesta

PERSONALIDAD CONSISTENTE:
- Empática y comprensiva
- Profesional pero cercana  
- Validadora de emociones
- Orientada a soluciones prácticas
- Siempre recomienda consulta médica cuando sea necesario`
      }
    ];

    // Agregar historial limitado (últimos 10 mensajes para mantener contexto)
    if (conversation_history && Array.isArray(conversation_history)) {
      const recentHistory = conversation_history
        .filter(msg => msg.role && msg.content)
        .slice(-10);
      messages.push(...recentHistory);
    }

    // Agregar mensaje actual
    messages.push({
      role: "user",
      content: message.trim()
    });

    console.log(`💬 Chat - Mensajes en contexto: ${messages.length - 1}`);

    const chatCompletion = await groq.chat.completions.create({
      messages: messages,
      model: GROQ_MODELS[model_preference] || GROQ_MODELS.balanced,
      temperature: 0.7,
      max_tokens: 500,
      top_p: 0.9
    });

    // Preparar nuevo historial
    const newConversation = [
      ...messages.slice(1), // Excluir mensaje de sistema
      {
        role: "assistant",
        content: chatCompletion.choices[0].message.content
      }
    ].slice(-12); // Mantener solo últimos 12 mensajes

    res.json({
      success: true,
      response: chatCompletion.choices[0].message.content,
      conversation_history: newConversation,
      tokens_used: chatCompletion.usage?.total_tokens || 0,
      model: GROQ_MODELS[model_preference] || GROQ_MODELS.balanced,
      provider: "Groq",
      timestamp: new Date().toISOString(),
      context_messages: messages.length - 1
    });

  } catch (error) {
    console.error('❌ Error en chat con Groq:', error);
    
    res.status(500).json({ 
      error: 'Error en el sistema de chat',
      details: error.message,
      timestamp: new Date().toISOString(),
      suggestion: 'Inténtalo nuevamente o usa el endpoint /api/test-ai'
    });
  }
});

// ============= ENDPOINT ADICIONAL: MODELOS DISPONIBLES =============
app.get('/api/models', (req, res) => {
  res.json({
    available_models: GROQ_MODELS,
    descriptions: {
      [GROQ_MODELS.fast]: "Modelo rápido para respuestas generales (recomendado)",
      [GROQ_MODELS.balanced]: "Modelo balanceado para conversaciones complejas",
      [GROQ_MODELS.creative]: "Modelo creativo para respuestas más elaboradas"
    },
    default_model: GROQ_MODELS.fast,
    how_to_use: "Envía 'model_preference': 'fast'|'balanced'|'creative' en tu request"
  });
});

// ============= MANEJO DE ERRORES GLOBAL =============
app.use((err, req, res, next) => {
  console.error('❌ Error no manejado:', err);
  
  res.status(500).json({ 
    error: 'Error interno del servidor',
    message: err.message,
    timestamp: new Date().toISOString(),
    request_id: Math.random().toString(36).substr(2, 9)
  });
});

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint no encontrado',
    available_endpoints: {
      'GET /': 'Información general de la API',
      'GET /api/health': 'Estado de salud del sistema',
      'GET /test': 'Página de pruebas',
      'POST /api/test-ai': 'Chat simple con IA',
      'POST /api/chat': 'Chat avanzado con historial',
      'GET /api/models': 'Modelos disponibles'
    },
    requested: req.originalUrl
  });
});

// ============= INICIO DEL SERVIDOR =============
app.listen(PORT, () => {
  const keyValidation = validateGroqKey();
  
  console.log('\n🌸 ================================');
  console.log('   LIA PERIOD CARE API v3.1.0');
  console.log('🌸 ================================\n');
  
  console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
  console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📡 URL base: http://localhost:${PORT}\n`);
  
  console.log('💡 Endpoints disponibles:');
  console.log(`   GET  http://localhost:${PORT}/`);
  console.log(`   GET  http://localhost:${PORT}/api/health`);
  console.log(`   GET  http://localhost:${PORT}/test`);
  console.log(`   GET  http://localhost:${PORT}/api/models`);
  console.log(`   POST http://localhost:${PORT}/api/test-ai`);
  console.log(`   POST http://localhost:${PORT}/api/chat\n`);
  
  console.log('🤖 Estado de IA:');
  console.log(`   Groq API: ${keyValidation.valid ? '✅ Configurado correctamente' : '❌ ' + keyValidation.error}`);
  console.log(`   Modelos: ${Object.values(GROQ_MODELS).join(', ')}`);
  console.log(`   Fallback: ✅ Respuestas simuladas inteligentes disponibles\n`);
  
  if (!keyValidation.valid) {
    console.log('⚠️  ADVERTENCIA: Groq no está configurado');
    console.log('   El sistema funcionará con respuestas simuladas');
    console.log('   Para IA real: https://console.groq.com/\n');
  }
  
  console.log('🔗 Links útiles:');
  console.log('   📊 Health Check: http://localhost:' + PORT + '/api/health');
  console.log('   🧪 Página de pruebas: http://localhost:' + PORT + '/test');
  console.log('   🔑 Groq Console: https://console.groq.com/');
  console.log('\n✨ ¡Lia está lista para ayudar! ✨\n');
});