import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle, AlertCircle, Download, ArrowLeft, Brain, Heart, Moon, Smile, Frown, Zap, Clock, User, Home } from 'lucide-react';

const questions = [
  {
    id: 'had_anxiety_01_tension_nervios',
    text: 'Me siento tenso(a) o nervioso(a)',
    type: 'anxiety',
    category: 'Ansiedad',
    icon: Brain,
    number: 1
  },
  {
    id: 'had_depression_02_disfrute_cosas',
    text: 'Sigo disfrutando con las mismas cosas de siempre',
    type: 'depression',
    category: 'Estado de Ánimo',
    icon: Smile,
    reverse: true,
    number: 2
  },
  {
    id: 'had_anxiety_03_temor_algo_suceder',
    text: 'Siento una especie de temor como si algo fuera a suceder',
    type: 'anxiety',
    category: 'Ansiedad',
    icon: Heart,
    number: 3
  },
  {
    id: 'had_depression_04_reir_lado_gracioso',
    text: 'Soy capaz de reírme y ver el lado gracioso de las cosas',
    type: 'depression',
    category: 'Estado de Ánimo',
    icon: Smile,
    reverse: true,
    number: 4
  },
  {
    id: 'had_anxiety_05_cabeza_preocupaciones',
    text: 'Tengo la cabeza llena de preocupaciones',
    type: 'anxiety',
    category: 'Ansiedad',
    icon: Brain,
    number: 5
  },
  {
    id: 'had_depression_06_sentirse_alegre',
    text: 'Me siento alegre',
    type: 'depression',
    category: 'Estado de Ánimo',
    icon: Smile,
    reverse: true,
    number: 6
  },
  {
    id: 'had_anxiety_07_sentado_tranquilo_relajado',
    text: 'Soy capaz de permanecer sentado(a) tranquila y relajadamente',
    type: 'anxiety',
    category: 'Ansiedad',
    icon: Moon,
    reverse: true,
    number: 7
  },
  {
    id: 'had_depression_08_lento_torpe',
    text: 'Me siento lento(a) y torpe',
    type: 'depression',
    category: 'Estado de Ánimo',
    icon: Clock,
    number: 8
  },
  {
    id: 'had_anxiety_09_nervios_vacio_estomago',
    text: 'Experimento una desagradable sensación de nervios y vacío en el estómago',
    type: 'anxiety',
    category: 'Ansiedad',
    icon: Heart,
    number: 9
  },
  {
    id: 'had_depression_10_interes_aspecto_personal',
    text: 'He perdido el interés por mi aspecto personal',
    type: 'depression',
    category: 'Estado de Ánimo',
    icon: Frown,
    number: 10
  },
  {
    id: 'had_anxiety_11_inquieto_no_parar_mover',
    text: 'Me siento inquieto(a) como si no pudiera dejar de moverme',
    type: 'anxiety',
    category: 'Ansiedad',
    icon: Zap,
    number: 11
  },
  {
    id: 'had_depression_12_esperar_cosas_ilusion',
    text: 'Espero las cosas con ilusión',
    type: 'depression',
    category: 'Estado de Ánimo',
    icon: Smile,
    reverse: true,
    number: 12
  },
  {
    id: 'had_anxiety_13_angustia_temor_repentino',
    text: 'Experimento de repente una sensación de gran angustia o temor',
    type: 'anxiety',
    category: 'Ansiedad',
    icon: Heart,
    number: 13
  },
  {
    id: 'had_depression_14_disfrutar_libro_radio_tv',
    text: 'Soy capaz de disfrutar con un buen libro, programa de radio o televisión',
    type: 'depression',
    category: 'Estado de Ánimo',
    icon: Smile,
    reverse: true,
    number: 14
  }
];

const getAnswerOptionsForQuestion = (questionNumber, isReverse = false) => {
  const optionsByQuestion = {
    1: [ // Tenso/nervioso
      { value: 3, label: 'Todo el día' },
      { value: 2, label: 'Casi todo el día' },
      { value: 1, label: 'De vez en cuando' },
      { value: 0, label: 'Nunca' }
    ],
    2: [ // Disfruto cosas (reverse)
      { value: 0, label: 'Siempre' },
      { value: 1, label: 'Casi siempre' },
      { value: 2, label: 'Rara vez' },
      { value: 3, label: 'En lo absoluto' }
    ],
    3: [ // Temor algo suceder
      { value: 3, label: 'Sí y muy intenso' },
      { value: 2, label: 'Sí, pero no tan intenso' },
      { value: 1, label: 'Sí, pero no me preocupa' },
      { value: 0, label: 'No' }
    ],
    4: [ // Reírme lado gracioso (reverse)
      { value: 0, label: 'Siempre' },
      { value: 1, label: 'Casi siempre' },
      { value: 2, label: 'Rara vez' },
      { value: 3, label: 'En lo absoluto' }
    ],
    5: [ // Cabeza preocupaciones
      { value: 3, label: 'Todo el día' },
      { value: 2, label: 'Casi todo el día' },
      { value: 1, label: 'De vez en cuando' },
      { value: 0, label: 'Nunca' }
    ],
    6: [ // Me siento alegre (reverse)
      { value: 0, label: 'Siempre' },
      { value: 1, label: 'Casi siempre' },
      { value: 2, label: 'Rara vez' },
      { value: 3, label: 'En lo absoluto' }
    ],
    7: [ // Sentado tranquilo (reverse)
      { value: 0, label: 'Siempre' },
      { value: 1, label: 'Casi siempre' },
      { value: 2, label: 'Rara vez' },
      { value: 3, label: 'En lo absoluto' }
    ],
    8: [ // Lento y torpe
      { value: 3, label: 'Todo el día' },
      { value: 2, label: 'Casi todo el día' },
      { value: 1, label: 'De vez en cuando' },
      { value: 0, label: 'Nunca' }
    ],
    9: [ // Nervios vacío estómago
      { value: 3, label: 'Siempre' },
      { value: 2, label: 'Casi siempre' },
      { value: 1, label: 'Rara vez' },
      { value: 0, label: 'En lo absoluto' }
    ],
    10: [ // Interés aspecto personal
      { value: 3, label: 'Siempre' },
      { value: 2, label: 'Casi siempre' },
      { value: 1, label: 'Rara vez' },
      { value: 0, label: 'En lo absoluto' }
    ],
    11: [ // Inquieto no parar mover
      { value: 3, label: 'Siempre' },
      { value: 2, label: 'Casi siempre' },
      { value: 1, label: 'Rara vez' },
      { value: 0, label: 'En lo absoluto' }
    ],
    12: [ // Esperar cosas ilusión (reverse)
      { value: 0, label: 'Siempre' },
      { value: 1, label: 'Casi siempre' },
      { value: 2, label: 'Rara vez' },
      { value: 3, label: 'En lo absoluto' }
    ],
    13: [ // Angustia temor repentino
      { value: 3, label: 'Siempre' },
      { value: 2, label: 'Casi siempre' },
      { value: 1, label: 'Rara vez' },
      { value: 0, label: 'En lo absoluto' }
    ],
    14: [ // Disfrutar libro radio TV (reverse)
      { value: 0, label: 'Siempre' },
      { value: 1, label: 'Casi siempre' },
      { value: 2, label: 'Rara vez' },
      { value: 3, label: 'En lo absoluto' }
    ]
  };

  return optionsByQuestion[questionNumber] || [];
};

// Mantener las opciones genéricas como respaldo
const answerOptions = [
  { value: 0, label: 'Nunca' },
  { value: 1, label: 'Rara vez' },
  { value: 2, label: 'A menudo' },
  { value: 3, label: 'Siempre' }
];

const reverseAnswerOptions = [
  { value: 3, label: 'Nunca' },
  { value: 2, label: 'Rara vez' },
  { value: 1, label: 'A menudo' },
  { value: 0, label: 'Siempre' }
];

const HADQuestionnaire = () => {
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
  const touchTimeout = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  const synthRef = useRef(window.speechSynthesis);
  const utteranceRef = useRef(null);

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

  // --- ACCESIBILIDAD MÓVIL: Primer toque lee, segundo selecciona ---
  const handleOptionTouch = (index, label, value) => {
    if (focusedOption === index && lastTouchedOption === index) {
      // Segundo toque en la misma opción: seleccionar
      setFocusedOption(null);
      setLastTouchedOption(null);
      if (touchTimeout.current) {
        clearTimeout(touchTimeout.current);
        touchTimeout.current = null;
      }
      handleAnswer(value);
    } else {
      // Primer toque: enfocar y leer
      setFocusedOption(index);
      setLastTouchedOption(index);
      speakText(label);
      if (touchTimeout.current) clearTimeout(touchTimeout.current);
      touchTimeout.current = setTimeout(() => {
        setFocusedOption(null);
        setLastTouchedOption(null);
      }, 1500); // 1.5 segundos para segundo toque
    }
  };

  // Detectar si es móvil (simple check)
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768 || /Mobi|Android/i.test(navigator.userAgent));
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Hablar la pregunta cada vez que cambie
  useEffect(() => {
    if (!showPatientInfo && !showResult && accessibilityMode) {
      speakQuestion(questions[current].text);
    }
    setFocusedOption(null); // Reiniciar foco al cambiar pregunta
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

  const calculateScores = () => {
    let anxietyScore = 0;
    let depressionScore = 0;

    questions.forEach(question => {
      const answer = answers[question.id];
      if (answer !== undefined) {
        if (question.type === 'anxiety') {
          anxietyScore += answer;
        } else {
          depressionScore += answer;
        }
      }
    });

    return { anxietyScore, depressionScore };
  };  const getScoreLevel = (score, type) => {
    if (score <= 8) {
      return { level: 'Leve', color: 'green', description: `${type === 'ansiedad' ? 'Ansiedad' : 'Depresión'} leve` };
    } else if (score >= 9 && score <= 11) {
      return { level: 'Moderado', color: 'orange', description: `${type === 'ansiedad' ? 'Ansiedad' : 'Depresión'} moderada` };
    } else {
      return { level: 'Alto', color: 'red', description: `${type === 'ansiedad' ? 'Ansiedad' : 'Depresión'} alta` };
    }
  };

  const downloadCSV = () => {
    const fecha = new Date().toISOString().slice(0, 10);
    const { anxietyScore, depressionScore } = calculateScores();
    const anxietyData = getScoreLevel(anxietyScore, 'ansiedad');
    const depressionData = getScoreLevel(depressionScore, 'depresión');
    
    const data = {
      patient_name: patientInfo.name,
      patient_age: patientInfo.age,
      patient_gender: patientInfo.gender,
      ...answers,
      anxiety_score: anxietyScore,
      anxiety_level: anxietyData.level,
      depression_score: depressionScore,
      depression_level: depressionData.level,
      date: fecha,
    };
    
    const headers = Object.keys(data).join(',');
    const values = Object.values(data).join(',');
    const csvContent = `data:text/csv;charset=utf-8,${headers}\n${values}`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${patientInfo.name}_${fecha}_had.csv`);
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
  const { anxietyScore, depressionScore } = calculateScores();
  const anxietyData = getScoreLevel(anxietyScore, 'ansiedad');
  const depressionData = getScoreLevel(depressionScore, 'depresión');

  const currentOptions = getAnswerOptionsForQuestion(questions[current]?.number, questions[current]?.reverse);

  // Formulario de información del paciente
  if (showPatientInfo) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        {/* Navigation Bar */}
        <div className="fixed top-0 left-0 w-full z-50 bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between min-h-[80px]">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center">
                  <Brain className="w-7 h-7 text-purple-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Cuestionario HAD</h1>
                  <p className="text-base text-gray-500">Evaluación de ansiedad y depresión</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setAccessibilityMode((prev) => !prev)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 font-semibold text-lg shadow ${accessibilityMode ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
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
                <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                  <User className="w-10 h-10 text-purple-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-800">Información del Paciente</h1>
                <p className="text-gray-600">Por favor, complete la siguiente información antes de comenzar el cuestionario HAD</p>
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
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
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white font-bold py-4 px-8 rounded-2xl hover:from-purple-700 hover:to-purple-800 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
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

  if (showResult) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        {/* Navigation Bar */}
        <div className="w-full bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Brain className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-800">Cuestionario HAD</h1>
                  <p className="text-sm text-gray-500">Evaluación de ansiedad y depresión</p>
                </div>
              </div>
              <button
                onClick={goBackToHome}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all duration-300 font-medium"
              >
                <Home className="w-4 h-4" />
                Volver al Inicio
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-4xl w-full">
            <div className="bg-white rounded-3xl shadow-2xl p-8 space-y-8 animate-fade-in">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-10 h-10 text-purple-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-800">¡Cuestionario HAD Completado!</h1>
                <p className="text-gray-600">Resultados de la Escala Hospitalaria de Ansiedad y Depresión</p>
                
                {/* Información del paciente */}
                <div className="bg-gray-50 rounded-xl p-4 mt-4">
                  <p className="text-sm text-gray-600">
                    <strong>Paciente:</strong> {patientInfo.name} | 
                    <strong> Edad:</strong> {patientInfo.age} años | 
                    <strong> Género:</strong> {patientInfo.gender}
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Ansiedad */}
                <div className={`border-2 rounded-2xl p-6 space-y-4 ${
                  anxietyData.color === 'red' ? 'bg-red-50 border-red-200' :
                  anxietyData.color === 'orange' ? 'bg-orange-50 border-orange-200' :
                  anxietyData.color === 'yellow' ? 'bg-yellow-50 border-yellow-200' :
                  'bg-green-50 border-green-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800">Ansiedad</h3>
                      <p className="text-gray-600">Escala HAD-A</p>
                    </div>
                    <div className="text-right">
                      <div className="text-4xl font-bold text-gray-800">{anxietyScore}</div>
                      <div className="text-sm text-gray-500">de 21</div>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-lg font-medium text-gray-700">Nivel:</span>
                      <span className={`text-xl font-bold ${
                        anxietyData.color === 'red' ? 'text-red-600' :
                        anxietyData.color === 'orange' ? 'text-orange-600' :
                        anxietyData.color === 'yellow' ? 'text-yellow-600' :
                        'text-green-600'
                      }`}>{anxietyData.level}</span>
                    </div>
                    <p className="text-sm text-gray-600">{anxietyData.description}</p>
                  </div>
                </div>

                {/* Depresión */}
                <div className={`border-2 rounded-2xl p-6 space-y-4 ${
                  depressionData.color === 'red' ? 'bg-red-50 border-red-200' :
                  depressionData.color === 'orange' ? 'bg-orange-50 border-orange-200' :
                  depressionData.color === 'yellow' ? 'bg-yellow-50 border-yellow-200' :
                  'bg-green-50 border-green-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800">Depresión</h3>
                      <p className="text-gray-600">Escala HAD-D</p>
                    </div>
                    <div className="text-right">
                      <div className="text-4xl font-bold text-gray-800">{depressionScore}</div>
                      <div className="text-sm text-gray-500">de 21</div>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-lg font-medium text-gray-700">Nivel:</span>
                      <span className={`text-xl font-bold ${
                        depressionData.color === 'red' ? 'text-red-600' :
                        depressionData.color === 'orange' ? 'text-orange-600' :
                        depressionData.color === 'yellow' ? 'text-yellow-600' :
                        'text-green-600'
                      }`}>{depressionData.level}</span>
                    </div>
                    <p className="text-sm text-gray-600">{depressionData.description}</p>
                  </div>
                </div>
              </div>              <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
                <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-purple-600" />
                  Interpretación de Resultados HAD
                </h4>                <div className="space-y-3 text-sm text-gray-600">
                  <div>
                    <p className="font-semibold text-gray-700 mb-1">Ansiedad (reactivos impares 1,3,5,7,9,11,13):</p>
                    <p><strong>• Leve:</strong> 8 puntos o menos</p>
                    <p><strong>• Moderado:</strong> 9-11 puntos</p>
                    <p><strong>• Alto:</strong> {'>'}11 puntos</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-700 mb-1">Depresión (reactivos pares 2,4,6,8,10,12,14):</p>
                    <p><strong>• Leve:</strong> 8 puntos o menos</p>
                    <p><strong>• Moderado:</strong> 9-11 puntos</p>
                    <p><strong>• Alto:</strong> {'>'}11 puntos</p>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-purple-50 rounded-xl">
                  <p className="text-sm text-purple-800 font-medium">
                    <strong>Nota:</strong> La Escala Hospitalaria de Ansiedad y Depresión (HAD) es una herramienta de evaluación. 
                    Consulte con un profesional de la salud para un diagnóstico preciso y recomendaciones personalizadas.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={downloadCSV}
                  className="flex-1 bg-purple-600 text-white px-6 py-4 rounded-2xl hover:bg-purple-700 transition-all duration-300 flex items-center justify-center gap-2 font-medium shadow-lg hover:shadow-xl"
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
                  className="flex-1 bg-blue-600 text-white px-6 py-4 rounded-2xl hover:bg-blue-700 transition-all duration-300 flex items-center justify-center gap-2 font-medium shadow-lg hover:shadow-xl"
                >
                  <Home className="w-5 h-5" />
                  Volver al Inicio
                </button>
              </div>
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
              <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center">
                <Brain className="w-7 h-7 text-purple-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Cuestionario HAD</h1>
                <p className="text-base text-gray-500">Evaluación de ansiedad y depresión</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setAccessibilityMode((prev) => !prev)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 font-semibold text-lg shadow ${accessibilityMode ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
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
            {/* Header */}
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold text-gray-800">Cuestionario HAD</h1>
              <p className="text-gray-600">Escala Hospitalaria de Ansiedad y Depresión</p>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Pregunta {current + 1} de {questions.length}</span>
                <span>{progress}% completado</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-purple-600 to-purple-800 h-3 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>

            {/* Question Card */}
            <div className="bg-gray-50 rounded-2xl p-8 space-y-6 border border-gray-200">
              <div className="space-y-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    {React.createElement(questions[current].icon, { 
                      className: "w-8 h-8 text-white" 
                    })}
                  </div>
                  <span className="inline-block bg-purple-100 text-purple-800 px-4 py-2 rounded-lg text-sm font-medium">
                    {questions[current].category}
                  </span>
                </div>
                <h2 className="text-xl font-semibold text-gray-800 leading-relaxed text-center">
                  {questions[current].text}
                </h2>
                {/* Voiceover repeat button */}
                <div className="flex justify-center mt-2">
                  <button
                    type="button"
                    onClick={() => speakQuestion(questions[current].text)}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-xl hover:bg-purple-200 transition-all duration-300 text-sm font-medium shadow"
                  >
                    {/* Solo bocina sin ondas */}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5L6 9H3v6h3l5 4V5z" /></svg>
                    Escuchar pregunta
                  </button>
                </div>
              </div>
            </div>

            {/* Answer Buttons */}
            <div className="grid grid-cols-2 gap-4">
              {currentOptions.map((option, index) => (
                <button
                  key={index}
                  onClick={() => (!accessibilityMode || !isMobile) ? handleAnswer(option.value) : undefined}
                  onTouchStart={accessibilityMode && isMobile ? (e) => { e.preventDefault(); handleOptionTouch(index, option.label, option.value); } : undefined}
                  className={`bg-purple-500 text-white px-6 py-4 rounded-2xl transition-all duration-300 transform shadow-lg hover:shadow-xl font-medium text-lg ${accessibilityMode ? 'text-2xl py-8 px-8 hover:scale-105' : 'hover:bg-purple-600 hover:scale-105'} ${accessibilityMode && isMobile && focusedOption === index ? 'ring-4 ring-yellow-400 scale-105 bg-yellow-400/80 text-purple-900 font-extrabold' : ''}`}
                  onMouseEnter={accessibilityMode && !isMobile ? () => speakText(option.label) : undefined}
                  onMouseLeave={accessibilityMode && !isMobile ? () => synthRef.current.cancel() : undefined}
                >
                  {option.label}
                  {accessibilityMode && isMobile && focusedOption === index && (
                    <span className="ml-2 text-yellow-900 text-base font-bold animate-pulse">(Toca de nuevo para seleccionar)</span>
                  )}
                </button>
              ))}
            </div>

            {/* Navigation */}
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

export default HADQuestionnaire;
