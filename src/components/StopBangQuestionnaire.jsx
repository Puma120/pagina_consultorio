import React, { useState, useRef, useEffect } from 'react';
import {
  CheckCircle, AlertCircle, Download, ArrowLeft, Volume2,
  Coffee, Eye, Heart, Weight, Calendar, Ruler, User, Home, Moon
} from 'lucide-react';
import { evaluateStopBang } from '../utils/stopbangEvaluator';

const questions = [
  { id: 'snoring', text: '¿Ronca fuerte?', category: 'S - Snoring', icon: Volume2 },
  { id: 'tired', text: '¿Se siente cansado durante el día?', category: 'T - Tired', icon: Coffee },
  { id: 'observed', text: '¿Alguien ha notado que deja de respirar al dormir?', category: 'O - Observed', icon: Eye },
  { id: 'pressure', text: '¿Tiene presión arterial alta?', category: 'P - Pressure', icon: Heart },
  { id: 'bmi', text: '¿Su IMC es mayor a 35?', category: 'B - BMI', icon: Weight },
  { id: 'age', text: '¿Es mayor de 50 años?', category: 'A - Age', icon: Calendar },
  { id: 'neck', text: '¿Su cuello es grande?', category: 'N - Neck', icon: Ruler },
  { id: 'gender', text: '¿Su género es masculino?', category: 'G - Gender', icon: User },
];

const StopBangQuestionnaire = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isComplete, setIsComplete] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [showPatientInfo, setShowPatientInfo] = useState(true);
  const [patientInfo, setPatientInfo] = useState({ 
    name: '', 
    age: '', 
    gender: '' 
  });
  const [accessibilityMode, setAccessibilityMode] = useState(false);
  const [focusedOption, setFocusedOption] = useState(null); // Para feedback táctil
  const [lastTouchedOption, setLastTouchedOption] = useState(null); // Para doble toque
  const synthRef = useRef(window.speechSynthesis);
  const utteranceRef = useRef(null);
  const touchTimeout = useRef(null);

  // Detección de dispositivo móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768 || /Mobi|Android/i.test(navigator.userAgent));
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Función para hablar la pregunta actual
  const speakQuestion = (text) => {
    if (!('speechSynthesis' in window)) return;
    if (synthRef.current.speaking) synthRef.current.cancel();
    const utter = new window.SpeechSynthesisUtterance(text);
    utter.lang = 'es-ES';
    utter.rate = 1;
    utter.pitch = 1;
    utteranceRef.current = utter;
    synthRef.current.speak(utter);
  };

  // Función para hablar texto genérico (usada para respuestas)
  const speakText = (text) => {
    if (!('speechSynthesis' in window)) return;
    if (synthRef.current.speaking) synthRef.current.cancel();
    const utter = new window.SpeechSynthesisUtterance(text);
    utter.lang = 'es-ES';
    utter.rate = 1;
    utter.pitch = 1;
    utteranceRef.current = utter;
    synthRef.current.speak(utter);
  };

  useEffect(() => {
    if (!showPatientInfo && !showResult && accessibilityMode) {
      speakQuestion(questions[current].text);
    }
    return () => {
      if (synthRef.current.speaking) synthRef.current.cancel();
    };
    // eslint-disable-next-line
  }, [current, showPatientInfo, showResult, accessibilityMode]);

  const handlePatientInfoSubmit = (e) => {
    e.preventDefault();
    if (patientInfo.name.trim() && patientInfo.age.trim() && patientInfo.gender) {
      setShowPatientInfo(false);
    }
  };

  const handlePatientInfoChange = (field, value) => {
    setPatientInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAnswer = (value) => {
    const currentId = questions[current].id;
    const newAnswers = { ...answers, [currentId]: value };
    setAnswers(newAnswers);

    if (current < questions.length - 1) {
      setTimeout(() => setCurrent(current + 1), 300);
    } else {
      setIsComplete(true);
      setTimeout(() => {
        setShowResult(true);
      }, 500);
    }
  };

  const downloadCSV = () => {
    const evaluation = evaluateStopBang(answers);
    const fecha = new Date().toISOString().slice(0, 10);
    const data = {
      patient_name: patientInfo.name,
      patient_age: patientInfo.age,
      patient_gender: patientInfo.gender,
      ...answers,
      score: evaluation.score,
      risk_level: evaluation.riskLevel,
      reason: evaluation.reason,
      date: fecha,
    };
    
    const headers = Object.keys(data).join(',');
    const values = Object.values(data).join(',');
    const csvContent = `data:text/csv;charset=utf-8,${headers}\n${values}`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${patientInfo.name}_${fecha}_stopbang.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const goBack = () => current > 0 && setCurrent(current - 1);
  
  const restart = () => {
    setCurrent(0);
    setAnswers({});
    setIsComplete(false);
    setShowResult(false);
    setShowPatientInfo(true);
    setPatientInfo({
      name: '',
      age: '',
      gender: ''
    });
  };

  const goBackToHome = () => {
    window.location.reload();
  };

  const progress = Math.round(((current + 1) / questions.length) * 100);
  const evaluation = evaluateStopBang(answers);

  // Formulario de información del paciente
  if (showPatientInfo) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        {/* Navigation Bar */}
        <div className="fixed top-0 left-0 w-full z-50 bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between min-h-[80px]">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
                  <Moon className="w-7 h-7 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Cuestionario STOP-Bang</h1>
                  <p className="text-base text-gray-500">Evaluación de riesgo de apnea del sueño</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setAccessibilityMode((prev) => !prev)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 font-semibold text-lg shadow ${accessibilityMode ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  title="Activar/desactivar accesibilidad"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m0 14v1m8-8h-1M5 12H4m15.07-6.93l-.71.71M6.34 17.66l-.71.71m12.02 0l-.71-.71M6.34 6.34l-.71-.71M12 8a4 4 0 100 8 4 4 0 000-8z" /></svg>
                  {accessibilityMode ? 'Accesibilidad ON' : 'Accesibilidad OFF'}
                </button>
                <button
                  onClick={goBackToHome}
                  className="flex items-center gap-3 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl transition-all duration-300 font-semibold text-lg shadow"
                >
                  <Home className="w-6 h-6" />
                  Volver al Inicio
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center p-4" style={{ paddingTop: '110px' }}>
          <div className="max-w-2xl w-full">
            <div className="bg-white rounded-3xl shadow-2xl p-8 space-y-8">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <User className="w-10 h-10 text-blue-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-800">Información del Paciente</h1>
                <p className="text-gray-600">Por favor, complete la siguiente información antes de comenzar el cuestionario STOP-Bang</p>
              </div>

              <form onSubmit={handlePatientInfoSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre completo *
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={patientInfo.name}
                      onChange={(e) => handlePatientInfoChange('name', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      placeholder="Ingrese su nombre completo"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-2">
                      Edad *
                    </label>
                    <input
                      type="number"
                      id="age"
                      value={patientInfo.age}
                      onChange={(e) => handlePatientInfoChange('age', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      placeholder="Ingrese su edad"
                      min="1"
                      max="120"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-2">
                      Género *
                    </label>
                    <select
                      id="gender"
                      value={patientInfo.gender}
                      onChange={(e) => handlePatientInfoChange('gender', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      required
                    >
                      <option value="">Seleccione su género</option>
                      <option value="masculino">Masculino</option>
                      <option value="femenino">Femenino</option>
                      <option value="otro">Otro</option>
                      <option value="prefiero_no_decir">Prefiero no decir</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-4 px-8 rounded-2xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  Comenzar Cuestionario
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Navigation Bar */}
      <div className="fixed top-0 left-0 w-full z-50 bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between min-h-[80px]">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
                <Moon className="w-7 h-7 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Cuestionario STOP-Bang</h1>
                <p className="text-base text-gray-500">Evaluación de riesgo de apnea del sueño</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setAccessibilityMode((prev) => !prev)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 font-semibold text-lg shadow ${accessibilityMode ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                title="Activar/desactivar accesibilidad"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m0 14v1m8-8h-1M5 12H4m15.07-6.93l-.71.71M6.34 17.66l-.71.71m12.02 0l-.71-.71M6.34 6.34l-.71-.71M12 8a4 4 0 100 8 4 4 0 000-8z" /></svg>
                {accessibilityMode ? 'Accesibilidad ON' : 'Accesibilidad OFF'}
              </button>
              <button
                onClick={goBackToHome}
                className="flex items-center gap-3 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl transition-all duration-300 font-semibold text-lg shadow"
              >
                <Home className="w-6 h-6" />
                Volver al Inicio
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4" style={{ paddingTop: '110px' }}>
        {showResult ? (
          <div className="max-w-4xl w-full">
            <div className="bg-white rounded-3xl shadow-2xl p-8 space-y-8 animate-fade-in">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-10 h-10 text-blue-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-800">¡Cuestionario STOP-Bang Completado!</h1>
                <p className="text-gray-600">Resultados de la evaluación de riesgo de apnea del sueño</p>
                
                {/* Información del paciente */}
                <div className="bg-gray-50 rounded-xl p-4 mt-4">
                  <p className="text-sm text-gray-600">
                    <strong>Paciente:</strong> {patientInfo.name} | 
                    <strong> Edad:</strong> {patientInfo.age} años | 
                    <strong> Género:</strong> {patientInfo.gender}
                  </p>
                </div>
              </div>

              <div className={`border-2 rounded-2xl p-6 space-y-4 ${
                evaluation.riskLevel === 'Muy Alto' ? 'bg-red-50 border-red-200' :
                evaluation.riskLevel === 'Alto' ? 'bg-yellow-50 border-yellow-200' :
                'bg-green-50 border-green-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">Puntuación Total</h3>
                    <p className="text-gray-600">Respuestas positivas</p>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-bold text-gray-800">{evaluation.score}</div>
                    <div className="text-sm text-gray-500">de {questions.length}</div>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg font-medium text-gray-700">Nivel de Riesgo:</span>
                    <span className={`text-xl font-bold ${
                      evaluation.riskLevel === 'Muy Alto' ? 'text-red-600' :
                      evaluation.riskLevel === 'Alto' ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>{evaluation.riskLevel}</span>
                  </div>
                  <p className="text-sm text-gray-600">{evaluation.reason}</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
                <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-blue-600" />
                  Interpretación de Resultados
                </h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <p><strong>• Riesgo Bajo (0-2):</strong> Baja probabilidad de apnea del sueño</p>
                  <p><strong>• Riesgo Intermedio (3-4):</strong> Probabilidad intermedia de apnea del sueño</p>
                  <p><strong>• Riesgo Alto (5-8):</strong> Alta probabilidad de apnea del sueño</p>
                </div>
                
                
              </div>

              <div className="flex gap-4">
                <button
                  onClick={downloadCSV}
                  className="flex-1 bg-blue-600 text-white px-6 py-4 rounded-2xl hover:bg-blue-700 transition-all duration-300 flex items-center justify-center gap-2 font-medium shadow-lg hover:shadow-xl"
                >
                  <Download className="w-5 h-5" />
                  Descargar Resultados
                </button>
                <button
                  onClick={restart}
                  className="flex-1 bg-gray-600 text-white px-6 py-4 rounded-2xl hover:bg-gray-700 transition-all duration-300 flex items-center justify-center gap-2 font-medium shadow-lg hover:shadow-xl"
                >
                  Reiniciar Cuestionario
                </button>
                <button
                  onClick={goBackToHome}
                  className="flex-1 bg-purple-600 text-white px-6 py-4 rounded-2xl hover:bg-purple-700 transition-all duration-300 flex items-center justify-center gap-2 font-medium shadow-lg hover:shadow-xl"
                >
                  <Home className="w-5 h-5" />
                  Volver al Inicio
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-2xl w-full">
            <div className="bg-white rounded-3xl shadow-2xl p-8 space-y-8">
              {/* Header */}
              <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold text-gray-800">Cuestionario STOP-BANG</h1>
                <p className="text-gray-600">Evaluación de riesgo de apnea del sueño</p>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Pregunta {current + 1} de {questions.length}</span>
                  <span>{progress}% completado</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-blue-600 to-blue-800 h-3 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Question Card */}
              <div className="bg-gray-50 rounded-2xl p-8 space-y-6 border border-gray-200">
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      {React.createElement(questions[current].icon, { 
                        className: "w-8 h-8 text-white" 
                      })}
                    </div>
                    <span className="inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded-lg text-sm font-medium">
                      {questions[current].category}
                    </span>
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800 leading-relaxed text-center">
                    {questions[current].text}
                  </h2>
                  <div className="flex justify-center mt-2">
                    <button
                      type="button"
                      onClick={() => speakQuestion(questions[current].text)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-all duration-300 text-sm font-medium shadow"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5L6 9H3v6h3l5 4V5z" /></svg>
                      Escuchar pregunta
                    </button>
                  </div>
                </div>
              </div>

              {/* Opciones de respuesta */}
              <div className="flex gap-4">
                <button
                  onClick={() => (!accessibilityMode || !isMobile) ? handleAnswer('Yes') : undefined}
                  onTouchStart={accessibilityMode && isMobile ? (e) => { e.preventDefault(); handleOptionTouch(0, 'Sí', 'Yes'); } : undefined}
                  className={`flex-1 bg-green-500 text-white px-8 py-4 rounded-2xl transition-all duration-300 transform shadow-lg hover:shadow-xl font-medium text-lg ${accessibilityMode ? 'text-2xl py-8 px-8 hover:scale-105' : 'hover:bg-green-600 hover:scale-105'} ${accessibilityMode && isMobile && focusedOption === 0 ? 'ring-4 ring-yellow-400 scale-105 bg-yellow-400/80 text-green-900 font-extrabold' : ''}`}
                  onMouseEnter={accessibilityMode && !isMobile ? () => speakText('Sí') : undefined}
                  onMouseLeave={accessibilityMode && !isMobile ? () => synthRef.current.cancel() : undefined}
                >
                  Sí
                  {accessibilityMode && isMobile && focusedOption === 0 && (
                    <span className="ml-2 text-yellow-900 text-base font-bold animate-pulse">(Toca de nuevo para seleccionar)</span>
                  )}
                </button>
                <button
                  onClick={() => (!accessibilityMode || !isMobile) ? handleAnswer('No') : undefined}
                  onTouchStart={accessibilityMode && isMobile ? (e) => { e.preventDefault(); handleOptionTouch(1, 'No', 'No'); } : undefined}
                  className={`flex-1 bg-red-500 text-white px-8 py-4 rounded-2xl transition-all duration-300 transform shadow-lg hover:shadow-xl font-medium text-lg ${accessibilityMode ? 'text-2xl py-8 px-8 hover:scale-105' : 'hover:bg-red-600 hover:scale-105'} ${accessibilityMode && isMobile && focusedOption === 1 ? 'ring-4 ring-yellow-400 scale-105 bg-yellow-400/80 text-red-900 font-extrabold' : ''}`}
                  onMouseEnter={accessibilityMode && !isMobile ? () => speakText('No') : undefined}
                  onMouseLeave={accessibilityMode && !isMobile ? () => synthRef.current.cancel() : undefined}
                >
                  No
                  {accessibilityMode && isMobile && focusedOption === 1 && (
                    <span className="ml-2 text-yellow-900 text-base font-bold animate-pulse">(Toca de nuevo para seleccionar)</span>
                  )}
                </button>
              </div>

              {/* Navegación */}
              <div className="flex justify-between items-center">
                <button
                  onClick={goBack}
                  disabled={current === 0}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                    current === 0 
                      ? 'text-gray-400 cursor-not-allowed' 
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                  }`}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Anterior
                </button>
                <div className="text-sm text-gray-500">
                  {Object.keys(answers).length} respuestas guardadas
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
      `}</style>
    </div>
  );
};

export default StopBangQuestionnaire;
