import React, { useState, useRef, useEffect } from 'react';
import {
  CheckCircle, AlertCircle, Download, ArrowLeft, Utensils, Scale, Heart, Brain, User, Home
} from 'lucide-react';

const questions = [
  {
    id: 'q1',
    text: 'Cuando huelo un bistec chisporroteando o un trozo de carne jugosa, me resulta muy difícil evitar comer, incluso si acabo de terminar una comida.',
    category: 'Alimentación Descontrolada',
    icon: Utensils,
    scale: 'uncontrolled',
    type: 'standard'
  },
  {
    id: 'q2',
    text: 'Deliberadamente tomo porciones pequeñas como un medio de controlar mi peso.',
    category: 'Restricción Cognitiva',
    icon: Scale,
    scale: 'cognitive',
    type: 'standard'
  },
  {
    id: 'q3',
    text: 'Cuando me siento ansioso(a), me encuentro comiendo.',
    category: 'Alimentación Emocional',
    icon: Heart,
    scale: 'emotional',
    type: 'standard'
  },
  {
    id: 'q4',
    text: 'A veces cuando empiezo a comer, simplemente no puedo parar.',
    category: 'Alimentación Descontrolada',
    icon: Utensils,
    scale: 'uncontrolled',
    type: 'standard'
  },
  {
    id: 'q5',
    text: 'Estar con alguien que está comiendo a menudo me da tanta hambre que también tengo que comer.',
    category: 'Alimentación Descontrolada',
    icon: Utensils,
    scale: 'uncontrolled',
    type: 'standard'
  },
  {
    id: 'q6',
    text: 'Cuando me siento triste, a menudo como en exceso.',
    category: 'Alimentación Emocional',
    icon: Heart,
    scale: 'emotional',
    type: 'standard'
  },
  {
    id: 'q7',
    text: 'Cuando veo una verdadera delicia, a menudo me da tanta hambre que tengo que comer inmediatamente.',
    category: 'Alimentación Descontrolada',
    icon: Utensils,
    scale: 'uncontrolled',
    type: 'standard'
  },
  {
    id: 'q8',
    text: 'Me da tanta hambre que mi estómago a menudo parece un pozo sin fondo.',
    category: 'Alimentación Descontrolada',
    icon: Utensils,
    scale: 'uncontrolled',
    type: 'standard'
  },
  {
    id: 'q9',
    text: 'Siempre tengo suficiente hambre como para que me resulte difícil dejar de comer antes de terminar la comida en mi plato.',
    category: 'Alimentación Descontrolada',
    icon: Utensils,
    scale: 'uncontrolled',
    type: 'standard'
  },
  {
    id: 'q10',
    text: 'Cuando me siento solo(a), me consuelo comiendo.',
    category: 'Alimentación Emocional',
    icon: Heart,
    scale: 'emotional',
    type: 'standard'
  },
  {
    id: 'q11',
    text: 'Conscientemente me contengo durante las comidas para no aumentar de peso.',
    category: 'Restricción Cognitiva',
    icon: Scale,
    scale: 'cognitive',
    type: 'standard'
  },
  {
    id: 'q12',
    text: 'No como algunos alimentos porque me engordan.',
    category: 'Restricción Cognitiva',
    icon: Scale,
    scale: 'cognitive',
    type: 'standard'
  },
  {
    id: 'q13',
    text: 'Siempre tengo suficiente hambre como para comer en cualquier momento.',
    category: 'Alimentación Descontrolada',
    icon: Utensils,
    scale: 'uncontrolled',
    type: 'standard'
  },
  {
    id: 'q14',
    text: '¿Con qué frecuencia sientes hambre?',
    category: 'Alimentación Descontrolada',
    icon: Utensils,
    scale: 'uncontrolled',
    type: 'frequency'
  },
  {
    id: 'q15',
    text: '¿Con qué frecuencia evitas "abastecerte" de alimentos tentadores?',
    category: 'Restricción Cognitiva',
    icon: Scale,
    scale: 'cognitive',
    type: 'frequency'
  },
  {
    id: 'q16',
    text: '¿Qué tan probable es que conscientemente comas menos de lo que quieres?',
    category: 'Restricción Cognitiva',
    icon: Scale,
    scale: 'cognitive',
    type: 'likelihood'
  },
  {
    id: 'q17',
    text: '¿Tienes atracones de comida aunque no tengas hambre?',
    category: 'Alimentación Descontrolada',
    icon: Utensils,
    scale: 'uncontrolled',
    type: 'frequency_binges'
  },
  {
    id: 'q18',
    text: 'En una escala del 1 al 8, donde 1 significa sin restricción en la alimentación (comer lo que quieras, cuando quieras) y 8 significa restricción total (limitar constantemente la ingesta de alimentos y nunca "ceder"), ¿qué número te darías?',
    category: 'Restricción Cognitiva',
    icon: Brain,
    scale: 'cognitive',
    type: 'restraint_scale'
  }
];

const getAnswerOptions = (questionType, questionId) => {
  switch (questionType) {
    case 'standard':
      return [
        { value: 4, label: 'Definitivamente cierto' },
        { value: 3, label: 'Principalmente cierto' },
        { value: 2, label: 'Principalmente falso' },
        { value: 1, label: 'Definitivamente falso' }
      ];
    case 'frequency':
      if (questionId === 'q14') {
        return [
          { value: 1, label: 'Solo a la hora de las comidas' },
          { value: 2, label: 'A veces entre comidas' },
          { value: 3, label: 'Frecuentemente entre comidas' },
          { value: 4, label: 'Casi siempre' }
        ];
      } else {
        return [
          { value: 1, label: 'Casi nunca' },
          { value: 2, label: 'Rara vez' },
          { value: 3, label: 'Habitualmente' },
          { value: 4, label: 'Casi siempre' }
        ];
      }
    case 'likelihood':
      return [
        { value: 1, label: 'Improbable' },
        { value: 2, label: 'Ligeramente probable' },
        { value: 3, label: 'Moderadamente probable' },
        { value: 4, label: 'Muy probable' }
      ];
    case 'frequency_binges':
      return [
        { value: 1, label: 'Nunca' },
        { value: 2, label: 'Rara vez' },
        { value: 3, label: 'A veces' },
        { value: 4, label: 'Al menos una vez por semana' }
      ];
    case 'restraint_scale':
      return [
        { value: 1, label: '1-2: Sin restricción en la alimentación' },
        { value: 2, label: '3-4: Poca restricción' },
        { value: 3, label: '5-6: Restricción moderada' },
        { value: 4, label: '7-8: Restricción total' }
      ];
    default:
      return [
        { value: 4, label: 'Definitivamente cierto' },
        { value: 3, label: 'Principalmente cierto' },
        { value: 2, label: 'Principalmente falso' },
        { value: 1, label: 'Definitivamente falso' }
      ];
  }
};

const TFEQQuestionnaire = () => {
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

  // Detección de dispositivo móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768 || /Mobi|Android/i.test(navigator.userAgent));
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
    let cognitiveScore = 0;
    let uncontrolledScore = 0;
    let emotionalScore = 0;

    // Cognitive restraint scale: items 2, 11, 12, 15, 16, and 18
    const cognitiveItems = ['q2', 'q11', 'q12', 'q15', 'q16', 'q18'];
    // Uncontrolled eating scale: items 1, 4, 5, 7, 8, 9, 13, 14, and 17
    const uncontrolledItems = ['q1', 'q4', 'q5', 'q7', 'q8', 'q9', 'q13', 'q14', 'q17'];
    // Emotional eating scale: items 3, 6, and 10
    const emotionalItems = ['q3', 'q6', 'q10'];

    // Calculate cognitive restraint score
    cognitiveItems.forEach(itemId => {
      const answer = answers[itemId];
      if (answer !== undefined) {
        cognitiveScore += answer;
      }
    });

    // Calculate uncontrolled eating score
    uncontrolledItems.forEach(itemId => {
      const answer = answers[itemId];
      if (answer !== undefined) {
        uncontrolledScore += answer;
      }
    });

    // Calculate emotional eating score
    emotionalItems.forEach(itemId => {
      const answer = answers[itemId];
      if (answer !== undefined) {
        emotionalScore += answer;
      }
    });

    return { cognitiveScore, uncontrolledScore, emotionalScore };
  };
  const getScoreLevel = (score, maxScore, scaleName) => {
    // Convertir a percentil basado en el rango total posible
    const minScore = scaleName === 'Restricción cognitiva' ? 6 : 
                     scaleName === 'Alimentación descontrolada' ? 9 : 3;
    const percentage = ((score - minScore) / (maxScore - minScore)) * 100;
    
    if (percentage >= 75) {
      return { level: 'Alto', color: 'red', description: `${scaleName} alta` };
    } else if (percentage >= 50) {
      return { level: 'Moderado-Alto', color: 'orange', description: `${scaleName} moderada-alta` };
    } else if (percentage >= 25) {
      return { level: 'Moderado', color: 'yellow', description: `${scaleName} moderada` };
    } else {
      return { level: 'Bajo', color: 'green', description: `${scaleName} baja` };
    }
  };

  const downloadCSV = () => {
    const fecha = new Date().toISOString().slice(0, 10);
    const { cognitiveScore, uncontrolledScore, emotionalScore } = calculateScores();
    
    const data = {
      patient_name: patientInfo.name,
      patient_age: patientInfo.age,
      patient_gender: patientInfo.gender,
      ...answers,
      cognitive_restraint: cognitiveScore,
      uncontrolled_eating: uncontrolledScore,
      emotional_eating: emotionalScore,
      date: fecha,
    };
    
    const headers = Object.keys(data).join(',');
    const values = Object.values(data).join(',');
    const csvContent = `data:text/csv;charset=utf-8,${headers}\n${values}`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${patientInfo.name}_${fecha}_tfeq.csv`);
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
  const { cognitiveScore, uncontrolledScore, emotionalScore } = calculateScores();
  
  // Máximos por escala según el número de preguntas en cada escala
  const cognitiveMax = 6 * 4; // 6 preguntas × 4 puntos máximo = 24
  const uncontrolledMax = 9 * 4; // 9 preguntas × 4 puntos máximo = 36
  const emotionalMax = 3 * 4; // 3 preguntas × 4 puntos máximo = 12

  const cognitiveData = getScoreLevel(cognitiveScore, cognitiveMax, 'Restricción cognitiva');
  const uncontrolledData = getScoreLevel(uncontrolledScore, uncontrolledMax, 'Alimentación descontrolada');
  const emotionalData = getScoreLevel(emotionalScore, emotionalMax, 'Alimentación emocional');
  // Obtener opciones de respuesta para la pregunta actual
  const currentOptions = getAnswerOptions(questions[current]?.type || 'standard', questions[current]?.id);

  // Formulario de información del paciente
  if (showPatientInfo) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        {/* Navigation Bar */}
        <div className="fixed top-0 left-0 w-full z-50 bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between min-h-[80px]">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
                  <Utensils className="w-7 h-7 text-green-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Cuestionario TFEQ-R18</h1>
                  <p className="text-base text-gray-500">Inventario de Alimentación de Tres Factores</p>
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
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <User className="w-10 h-10 text-green-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-800">Información del Paciente</h1>
                <p className="text-gray-600">Por favor, complete la siguiente información antes de comenzar el Inventario de Alimentación de Tres Factores</p>
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
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
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white font-bold py-4 px-8 rounded-2xl hover:from-green-700 hover:to-green-800 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
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
        <div className="fixed top-0 left-0 w-full z-50 bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between min-h-[80px]">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
                  <Utensils className="w-7 h-7 text-green-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Cuestionario TFEQ-R18</h1>
                  <p className="text-base text-gray-500">Inventario de Alimentación de Tres Factores</p>
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
          <div className="max-w-4xl w-full">
            <div className="bg-white rounded-3xl shadow-2xl p-8 space-y-8 animate-fade-in">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-800">¡Inventario de Alimentación Completado!</h1>
                <p className="text-gray-600">Resultados de la evaluación de patrones alimentarios</p>
                
                {/* Información del paciente */}
                <div className="bg-gray-50 rounded-xl p-4 mt-4">
                  <p className="text-sm text-gray-600">
                    <strong>Paciente:</strong> {patientInfo.name} | 
                    <strong> Edad:</strong> {patientInfo.age} años | 
                    <strong> Género:</strong> {patientInfo.gender}
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {/* Restricción Cognitiva */}
                <div className={`border-2 rounded-2xl p-6 space-y-4 ${
                  cognitiveData.color === 'red' ? 'bg-red-50 border-red-200' :
                  cognitiveData.color === 'orange' ? 'bg-orange-50 border-orange-200' :
                  cognitiveData.color === 'yellow' ? 'bg-yellow-50 border-yellow-200' :
                  'bg-green-50 border-green-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">Restricción Cognitiva</h3>
                      <p className="text-gray-600 text-sm">Control consciente</p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-gray-800">{cognitiveScore}</div>
                      <div className="text-sm text-gray-500">de {cognitiveMax}</div>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Nivel:</span>
                      <span className={`text-lg font-bold ${
                        cognitiveData.color === 'red' ? 'text-red-600' :
                        cognitiveData.color === 'orange' ? 'text-orange-600' :
                        cognitiveData.color === 'yellow' ? 'text-yellow-600' :
                        'text-green-600'
                      }`}>{cognitiveData.level}</span>
                    </div>
                    <p className="text-sm text-gray-600">{cognitiveData.description}</p>
                  </div>
                </div>

                {/* Alimentación Descontrolada */}
                <div className={`border-2 rounded-2xl p-6 space-y-4 ${
                  uncontrolledData.color === 'red' ? 'bg-red-50 border-red-200' :
                  uncontrolledData.color === 'orange' ? 'bg-orange-50 border-orange-200' :
                  uncontrolledData.color === 'yellow' ? 'bg-yellow-50 border-yellow-200' :
                  'bg-green-50 border-green-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">Alimentación Descontrolada</h3>
                      <p className="text-gray-600 text-sm">Pérdida de control</p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-gray-800">{uncontrolledScore}</div>
                      <div className="text-sm text-gray-500">de {uncontrolledMax}</div>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Nivel:</span>
                      <span className={`text-lg font-bold ${
                        uncontrolledData.color === 'red' ? 'text-red-600' :
                        uncontrolledData.color === 'orange' ? 'text-orange-600' :
                        uncontrolledData.color === 'yellow' ? 'text-yellow-600' :
                        'text-green-600'
                      }`}>{uncontrolledData.level}</span>
                    </div>
                    <p className="text-sm text-gray-600">{uncontrolledData.description}</p>
                  </div>
                </div>

                {/* Alimentación Emocional */}
                <div className={`border-2 rounded-2xl p-6 space-y-4 ${
                  emotionalData.color === 'red' ? 'bg-red-50 border-red-200' :
                  emotionalData.color === 'orange' ? 'bg-orange-50 border-orange-200' :
                  emotionalData.color === 'yellow' ? 'bg-yellow-50 border-yellow-200' :
                  'bg-green-50 border-green-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">Alimentación Emocional</h3>
                      <p className="text-gray-600 text-sm">Respuesta emocional</p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-gray-800">{emotionalScore}</div>
                      <div className="text-sm text-gray-500">de {emotionalMax}</div>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Nivel:</span>
                      <span className={`text-lg font-bold ${
                        emotionalData.color === 'red' ? 'text-red-600' :
                        emotionalData.color === 'orange' ? 'text-orange-600' :
                        emotionalData.color === 'yellow' ? 'text-yellow-600' :
                        'text-green-600'
                      }`}>{emotionalData.level}</span>
                    </div>
                    <p className="text-sm text-gray-600">{emotionalData.description}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
                <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-green-600" />
                  Interpretación de Resultados TFEQ-R18
                </h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <p><strong>• Restricción Cognitiva:</strong> Medida del control consciente sobre la ingesta de alimentos para controlar el peso corporal.</p>
                  <p><strong>• Alimentación Descontrolada:</strong> Tendencia a perder el control sobre la alimentación y comer en exceso.</p>
                  <p><strong>• Alimentación Emocional:</strong> Tendencia a comer en respuesta a estados emocionales negativos.</p>
                </div>
                <div className="mt-4 p-4 bg-green-50 rounded-xl">
                  <p className="text-sm text-green-800 font-medium">
                    <strong>Nota:</strong> Este cuestionario es una herramienta de evaluación de patrones alimentarios. 
                    Consulte con un profesional de la salud para interpretación clínica y recomendaciones personalizadas.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={downloadCSV}
                  className="flex-1 bg-green-600 text-white px-6 py-4 rounded-2xl hover:bg-green-700 transition-all duration-300 flex items-center justify-center gap-2 font-medium shadow-lg hover:shadow-xl"
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

  const handleOptionTouch = (index, label, value) => {
    if (focusedOption === index && lastTouchedOption === index) {
      // Segundo toque: selecciona la opción
      setLastTouchedOption(null);
      setFocusedOption(null);
      handleAnswer(value);
    } else {
      // Primer toque: lee la opción
      setFocusedOption(index);
      setLastTouchedOption(index);
      speakText(label);
      if (touchTimeout.current) clearTimeout(touchTimeout.current);
      touchTimeout.current = setTimeout(() => {
        setFocusedOption(null);
        setLastTouchedOption(null);
      }, 2000); // Reinicia después de 2 segundos
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Navigation Bar */}
      <div className="fixed top-0 left-0 w-full z-50 bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between min-h-[80px]">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
                <Utensils className="w-7 h-7 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Cuestionario TFEQ-R18</h1>
                <p className="text-base text-gray-500">Inventario de Alimentación de Tres Factores</p>
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
              <h1 className="text-3xl font-bold text-gray-800">Inventario TFEQ-R18</h1>
              <p className="text-gray-600">Evaluación de patrones alimentarios</p>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Pregunta {current + 1} de {questions.length}</span>
                <span>{progress}% completado</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-green-600 to-green-800 h-3 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>

            {/* Question Card */}
            <div className="bg-gray-50 rounded-2xl p-8 space-y-6 border border-gray-200">
              <div className="space-y-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    {React.createElement(questions[current].icon, { 
                      className: "w-8 h-8 text-white" 
                    })}
                  </div>
                  <span className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-lg text-sm font-medium">
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
                    className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-xl hover:bg-green-200 transition-all duration-300 text-sm font-medium shadow"
                  >
                    {/* Solo bocina sin ondas */}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5L6 9H3v6h3l5 4V5z" /></svg>
                    Escuchar pregunta
                  </button>
                </div>
              </div>
            </div>            {/* Answer Buttons */}
            <div className="grid grid-cols-1 gap-3">
              {currentOptions.map((option, index) => (
                <button
                  key={index}
                  onClick={() => (!accessibilityMode || !isMobile) ? handleAnswer(option.value) : undefined}
                  onTouchStart={accessibilityMode && isMobile ? (e) => { e.preventDefault(); handleOptionTouch(index, option.label, option.value); } : undefined}
                  className={`bg-green-500 text-white px-6 py-4 rounded-2xl transition-all duration-300 transform shadow-lg hover:shadow-xl font-medium text-lg ${accessibilityMode ? 'text-2xl py-8 px-8 hover:scale-105' : 'hover:bg-green-600 hover:scale-105'} ${accessibilityMode && isMobile && focusedOption === index ? 'ring-4 ring-yellow-400 scale-105 bg-yellow-400/80 text-green-900 font-extrabold' : ''}`}
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

export default TFEQQuestionnaire;
