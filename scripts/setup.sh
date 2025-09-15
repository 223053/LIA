#!/bin/bash

# 🌸 Period Care App - Script de Setup Automático
echo "🌸 ¡Bienvenida a LIA Period Care App! 🌸"
echo "Configurando tu aplicación desde cero..."
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

print_step() {
    echo -e "${PURPLE}📋 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Verificar Node.js
print_step "Verificando Node.js..."
if ! command -v node &> /dev/null; then
    print_error "Node.js no está instalado. Por favor instala Node.js 18+ desde https://nodejs.org"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'.' -f1 | cut -d'v' -f2)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js versión 18+ requerida. Tu versión: $(node -v)"
    exit 1
fi

print_success "Node.js $(node -v) detectado"

# Verificar npm
print_step "Verificando npm..."
if ! command -v npm &> /dev/null; then
    print_error "npm no está instalado"
    exit 1
fi
print_success "npm $(npm -v) detectado"

# Crear estructura de directorios
print_step "Creando estructura de directorios..."
mkdir -p frontend/src/{app,components,lib,styles}
mkdir -p frontend/src/components/{ui,ChatBot,CycleTracker,Dashboard}
mkdir -p frontend/src/app/{dashboard,chat,api}
mkdir -p frontend/public/{icons,images}

mkdir -p backend/src/{controllers,models,services,middleware,routes,utils}
mkdir -p backend/tests/{unit,integration}

mkdir -p database/{migrations,seeders,schemas}

mkdir -p ai-services/{emotion-detector,prompt-builder,llm-integration}
mkdir -p ai-services/emotion-detector/models
mkdir -p ai-services/prompt-builder/templates

mkdir -p docs/{api,setup,deployment}
mkdir -p scripts

print_success "Estructura de directorios creada"

# Copiar archivos de configuración
print_step "Configurando archivos de entorno..."
if [ ! -f .env ]; then
    cp .env.example .env
    print_warning "Archivo .env creado. ¡IMPORTANTE: Configura tus claves de API!"
else
    print_warning ".env ya existe, no se sobrescribe"
fi

# Instalar dependencias del proyecto principal
print_step "Instalando dependencias principales..."
npm install
print_success "Dependencias principales instaladas"

# Setup Frontend
print_step "Configurando Frontend (Next.js + React)..."
cd frontend

# Crear package.json si no existe
if [ ! -f package.json ]; then
    print_warning "Copiando package.json del frontend..."
    # Aquí iría el comando para copiar el package.json del frontend
fi

npm install
print_success "Frontend configurado"

# Crear archivos básicos del frontend
cat > src/app/layout.tsx << 'EOF'
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Period Care - Tu Compañera de Bienestar Menstrual',
  description: 'Plataforma empática de cuidado menstrual con IA personalizada',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
EOF

cat > src/app/page.tsx << 'EOF'
'use client'
import { useState } from 'react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-400 via-yellow-300 to-green-400">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-white text-center mb-8">
          🌸 Period Care
        </h1>
        <p className="text-white text-center text-xl mb-8">
          Tu compañera empática de bienestar menstrual
        </p>
        <div className="bg-white/90 backdrop-blur rounded-3xl p-8 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-pink-600 mb-4">
            ¡Aplicación en desarrollo! 🚀
          </h2>
          <p className="text-gray-700">
            Estamos construyendo una experiencia increíble para ti. 
            Pronto tendrás acceso a tu asistente de IA personalizado.
          </p>
        </div>
      </div>
    </div>
  )
}
EOF

cat > src/app/globals.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}
EOF

cat > tailwind.config.js << 'EOF'
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#ff6b9d',
        secondary: '#6bcf7f',
        accent: '#ffd93d'
      }
    },
  },
  plugins: [],
}
EOF

cd ..

# Setup Backend
print_step "Configurando Backend (Node.js + Express)..."
cd backend

npm install

# Crear servidor básico
cat > server.js << 'EOF'
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000'
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rutas básicas
app.get('/', (req, res) => {
  res.json({ 
    message: '🌸 Period Care API funcionando!',
    version: '1.0.0',
    status: 'online'
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Algo salió mal!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend ejecutándose en puerto ${PORT}`);
});
EOF

cd ..

# Setup AI Services
print_step "Configurando Servicios de IA..."
cd ai-services

cat > package.json << 'EOF'
{
  "name": "period-care-ai-services",
  "version": "1.0.0",
  "description": "Servicios de IA para Period Care",
  "main": "index.js",
  "scripts": {
    "dev": "nodemon index.js",
    "start": "node index.js",
    "test": "jest"
  },
  "dependencies": {
    "express": "^4.18.0",
    "natural": "^6.5.0",
    "sentiment": "^5.0.2",
    "openai": "^4.20.0",
    "@anthropic-ai/sdk": "^0.9.0"
  }
}
EOF

npm install

cat > index.js << 'EOF'
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
EOF

cd ..

# Crear README
print_step "Creando documentación..."
cat > README.md << 'EOF'
# 🌸 Period Care App

Plataforma empática de cuidado menstrual con IA personalizada que realmente te entiende.

## 🚀 Quick Start

```bash
# 1. Clonar repositorio
git clone <tu-repo-url>
cd period-care-app

# 2. Setup automático
npm run setup

# 3. Configurar variables de entorno
cp .env.example .env
# Edita .env con tus claves de API

# 4. Iniciar desarrollo
npm run dev
```

## 🌟 Características

- 💕 **Chatbot Empático**: Respuestas personalizadas basadas en tu historial
- 🧠 **IA Inteligente**: Detecta emociones y genera recomendaciones específicas
- 📊 **Seguimiento Personalizado**: Analiza patrones únicos de tu ciclo
- 🎨 **Diseño Hermoso**: Interfaz moderna y responsiva
- 🔒 **Privacidad Total**: Tus datos están seguros

## 🛠️ Stack Tecnológico

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, MongoDB
- **IA**: OpenAI GPT-4, Anthropic Claude, NLP personalizado
- **DevOps**: Docker, GitHub Actions

¡Desarrollado con 💗 para el bienestar femenino!
EOF

# Crear .gitignore
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment
.env
.env.local
.env.production

# Build outputs
.next/
dist/
build/

# Database
*.db
*.sqlite

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Logs
logs
*.log

# Runtime
pids
*.pid
*.seed
*.pid.lock

# Coverage
coverage/
.nyc_output

# Cache
.cache/
.parcel-cache/
EOF

print_success "Configuración completada!"

echo ""
echo -e "${GREEN}🎉 ¡Period Care App configurada exitosamente! 🎉${NC}"
echo ""
echo -e "${BLUE}📋 Próximos pasos:${NC}"
echo "1. Configura tus claves de API en .env"
echo "2. npm run dev (para iniciar todos los servicios)"
echo "3. Abre http://localhost:3000 en tu navegador"
echo ""
echo -e "${YELLOW}🔑 No olvides configurar:${NC}"
echo "- OPENAI_API_KEY en .env"
echo "- ANTHROPIC_API_KEY en .env"
echo "- MONGODB_URI en .env"
echo ""
echo -e "${PURPLE}🚀 ¡Lista para desarrollar tu app increíble!${NC}"