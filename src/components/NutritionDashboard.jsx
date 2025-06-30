import React, { useState } from 'react';
import { Stethoscope, Moon, Brain, ArrowRight, Utensils, Heart, Activity, Zap, Star, Clock, AlertTriangle } from 'lucide-react';
import StopBangQuestionnaire from './StopBangQuestionnaire';
import HADQuestionnaire from './HADQuestionnaire';
import TFEQQuestionnaire from './TFEQQuestionnaire';

const NutritionDashboard = () => {
  const [selected, setSelected] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [showInstructionsPopup, setShowInstructionsPopup] = useState(false);
  const [pendingQuestionnaire, setPendingQuestionnaire] = useState(null);

  const questionnaires = [
    {
      id: 'stopbang',
      title: "STOP-Bang",
      description: "Evaluación especializada del riesgo de apnea del sueño mediante criterios clínicos validados",
      shortDesc: "Apnea del Sueño",
      icon: Moon,
      gradient: "from-blue-500 via-blue-600 to-indigo-600",
      hoverGradient: "from-blue-400 via-blue-500 to-indigo-500",
      shadowColor: "shadow-blue-500/30",
      borderColor: "border-blue-200",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      accentColor: "bg-blue-500",
      image: (
        <div className="relative w-full h-48 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl mb-6 overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              <div className="w-24 h-24 bg-blue-500 rounded-full opacity-20 animate-pulse"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Moon className="w-12 h-12 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="absolute top-4 right-4 flex space-x-1">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="w-2 h-8 bg-blue-300 rounded-full opacity-60 animate-pulse" style={{animationDelay: `${i * 0.2}s`}}></div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'had',
      title: "HAD",
      description: "Escala Hospitalaria de Ansiedad y Depresión para evaluación integral del bienestar emocional",
      shortDesc: "Salud Mental",
      icon: Brain,
      gradient: "from-purple-500 via-violet-600 to-purple-600",
      hoverGradient: "from-purple-400 via-violet-500 to-purple-500",
      shadowColor: "shadow-purple-500/30",
      borderColor: "border-purple-200",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
      accentColor: "bg-purple-500",
      image: (
        <div className="relative w-full h-48 bg-gradient-to-br from-purple-100 to-violet-200 rounded-xl mb-6 overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              <div className="w-24 h-24 bg-purple-500 rounded-full opacity-20"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Brain className="w-12 h-12 text-purple-600" />
              </div>
            </div>
          </div>
          <div className="absolute top-4 left-4">
            <Heart className="w-6 h-6 text-purple-400 animate-pulse" />
          </div>
          <div className="absolute bottom-4 right-4">
            <Activity className="w-8 h-8 text-purple-400 opacity-60" />
          </div>
        </div>
      )
    },
    {
      id: 'tfeq',
      title: "TFEQ-R18",
      description: "Inventario de Alimentación de Tres Factores para análisis detallado de patrones alimentarios",
      shortDesc: "Comportamiento Alimentario",
      icon: Utensils,
      gradient: "from-green-500 via-emerald-600 to-teal-600",
      hoverGradient: "from-green-400 via-emerald-500 to-teal-500",
      shadowColor: "shadow-green-500/30",
      borderColor: "border-green-200",
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
      accentColor: "bg-green-500",
      image: (
        <div className="relative w-full h-48 bg-gradient-to-br from-green-100 to-emerald-200 rounded-xl mb-6 overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              <div className="w-24 h-24 bg-green-500 rounded-full opacity-20"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Utensils className="w-12 h-12 text-green-600" />
              </div>
            </div>
          </div>
          <div className="absolute top-4 right-4 flex space-x-2">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-green-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-3 h-3 bg-green-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
        </div>
      )
    },
  ];

  const handleQuestionnaireClick = (questionnaireId) => {
    if (questionnaireId === 'had' || questionnaireId === 'tfeq') {
      setPendingQuestionnaire(questionnaireId);
      setShowInstructionsPopup(true);
    } else {
      setSelected(questionnaireId);
    }
  };

  const startQuestionnaire = () => {
    setSelected(pendingQuestionnaire);
    setShowInstructionsPopup(false);
    setPendingQuestionnaire(null);
  };

  const cancelQuestionnaire = () => {
    setShowInstructionsPopup(false);
    setPendingQuestionnaire(null);
  };

  if (selected === 'stopbang') {
    return <StopBangQuestionnaire />;
  }

  if (selected === 'had') {
    return <HADQuestionnaire />;
  }

  if (selected === 'tfeq') {
    return <TFEQQuestionnaire />;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Subtle animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gray-100 rounded-full opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gray-100 rounded-full opacity-30 animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gray-50 rounded-full opacity-40 animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="relative z-10 px-6 py-16 max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <div className="text-center mb-24">
          <div className="relative inline-block mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 rounded-3xl blur-xl opacity-50 animate-pulse"></div>
            <div className="relative bg-gradient-to-br from-blue-100 via-purple-200 to-pink-100 p-6 rounded-3xl shadow-2xl">
              <Stethoscope className="w-12 h-12 text-blue-700" />
            </div>
          </div>
          
          <h1 className="text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
              Panel de Evaluación
            </span>
            <br />
            
          </h1>
          
          
          
          
          
          
        </div>

        {/* Enhanced Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {questionnaires.map((q, index) => {
            const IconComponent = q.icon;
            const isHovered = hoveredCard === q.id;
            
            return (
              <div
                key={q.id}
                className={`group relative bg-white rounded-3xl shadow-2xl ${q.shadowColor} hover:shadow-3xl transition-all duration-700 transform hover:-translate-y-4 border-2 ${q.borderColor} overflow-hidden`}
                onMouseEnter={() => setHoveredCard(q.id)}
                onMouseLeave={() => setHoveredCard(null)}
                style={{
                  animationDelay: `${index * 0.2}s`,
                  animation: 'fadeInUp 0.8s ease-out forwards'
                }}
              >
                {/* Animated background gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${q.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
                
                <div className="relative z-10 p-8">
                  {/* Image Section */}
                  <div className="transform group-hover:scale-105 transition-transform duration-500">
                    {q.image}
                  </div>
                  
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 ${q.bgColor} rounded-2xl shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
                        <IconComponent className={`w-6 h-6 ${q.iconColor}`} />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-800 group-hover:text-gray-900 transition-colors">
                          {q.title}
                        </h3>
                        <p className="text-sm text-gray-500 font-medium">{q.shortDesc}</p>
                      </div>
                    </div>
                    <div className={`w-4 h-4 ${q.accentColor} rounded-full opacity-60 group-hover:opacity-100 transition-opacity`}></div>
                  </div>
                  
                  {/* Description */}
                  <p className="text-gray-600 leading-relaxed mb-8 text-base">
                    {q.description}
                  </p>
                  
                  {/* CTA Button */}
                  <button
                    onClick={() => handleQuestionnaireClick(q.id)}
                    className={`w-full bg-gradient-to-r ${q.gradient} hover:bg-gradient-to-r hover:${q.hoverGradient} text-white font-bold py-4 px-8 rounded-2xl transition-all duration-500 transform hover:scale-105 shadow-xl ${q.shadowColor} hover:shadow-2xl flex items-center justify-center gap-3 group relative overflow-hidden hover:brightness-110 hover:saturate-110`}
                    onMouseEnter={() => setHoveredCard(q.id)}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    {/* Efecto de brillo difuminado en hover */}
                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-sm"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-30 transform -translate-x-full group-hover:translate-x-full transition-all duration-1000"></div>
                    <span className="relative z-10 transition-all duration-300 group-hover:drop-shadow-lg">Iniciar Evaluación</span>
                    <ArrowRight className="relative z-10 w-5 h-5 transition-transform group-hover:translate-x-2 group-hover:drop-shadow-lg" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Enhanced Footer */}
      
      </div>

      {/* Popup de instrucciones */}
      {showInstructionsPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4 animate-fade-in">
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              
              <div className="space-y-3">
                <h2 className="text-2xl font-bold text-gray-800">Instrucciones Importantes</h2>
                <p className="text-gray-600 leading-relaxed">
                  Al responder las preguntas del cuestionario 
                  <strong className="text-red-600">
                    {pendingQuestionnaire === 'had' ? ' HAD' : ' TFEQ'}
                  </strong>, por favor piense en 
                  <strong className="text-red-600"> cómo se ha sentido durante las últimas dos semanas</strong>.
                </p>
                <p className="text-sm text-gray-500">
                  Esto nos ayudará a obtener una evaluación más precisa de su estado 
                  {pendingQuestionnaire === 'had' ? ' emocional' : ' alimentario'} actual.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={cancelQuestionnaire}
                  className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all duration-300 font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={startQuestionnaire}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl transition-all duration-300 font-medium"
                >
                  Continuar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .shadow-3xl {
          box-shadow: 0 35px 60px -12px rgba(0, 0, 0, 0.25);
        }
      `}</style>
    </div>
  );
};

export default NutritionDashboard;