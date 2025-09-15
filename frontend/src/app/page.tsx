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
