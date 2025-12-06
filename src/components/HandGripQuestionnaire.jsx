import React, { useState, useEffect } from 'react';
import { Hand, User, Calendar, Ruler, Scale, CheckCircle, AlertCircle, Loader, ArrowLeft, Home, Download, Mail, Brain } from 'lucide-react';
import { evaluateHandGripStrength, validatePatientData } from '../utils/geminiService';
import QuestionnaireNavBar from './QuestionnaireNavBar';

const HandGripQuestionnaire = ({ 
  onGoToHome, 
  patientInfo: externalPatientInfo, 
  onComplete, 
  hidePatientForm = false, 
  progressBar, 
  showResultScreen = true 
}) => {
  const [step, setStep] = useState('input'); // input, evaluating, result
  const [formData, setFormData] = useState({
    estatura: '',
    hgs_kg: ''
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Cargar datos del JSON
  const [tablesData, setTablesData] = useState(null);

  useEffect(() => {
    // Cargar el JSON de tablas de referencia
    fetch('/handgrip_full_tables.json')
      .then(response => response.json())
      .then(data => setTablesData(data))
      .catch(err => {
        console.error('Error al cargar las tablas de referencia:', err);
        setError('Error al cargar las tablas de referencia');
      });
  }, []);

  // Convertir género del paciente al formato esperado por la API
  const getSexForAPI = () => {
    if (!externalPatientInfo?.gender) return 'male';
    return externalPatientInfo.gender.toLowerCase() === 'femenino' ? 'female' : 'male';
  };

  // Validar y procesar el formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (!tablesData) {
      setError('Las tablas de referencia aún no están cargadas. Por favor espere un momento.');
      return;
    }

    // Preparar datos del paciente
    const patientData = {
      sexo: getSexForAPI(),
      edad: parseInt(externalPatientInfo?.age || 25),
      estatura_m: parseFloat(formData.estatura),
      hgs_kg: parseFloat(formData.hgs_kg)
    };

    // Validar datos
    const validation = validatePatientData(patientData);
    if (!validation.isValid) {
      setError(validation.errors.join(', '));
      return;
    }

    // Iniciar evaluación
    setIsLoading(true);
    setStep('evaluating');

    try {
      const evaluationResult = await evaluateHandGripStrength(patientData, tablesData);
      
      if (evaluationResult.success) {
        setResult(evaluationResult.data);
        setStep('result');
        
        // Si hay callback de completado, ejecutarlo
        if (onComplete) {
          onComplete({
            patientData,
            evaluation: evaluationResult.data,
            timestamp: new Date().toISOString()
          });
        }
      } else {
        setError(evaluationResult.error || 'Error al evaluar los datos');
        setStep('input');
      }
    } catch (err) {
      setError('Error inesperado al procesar la evaluación: ' + err.message);
      setStep('input');
    } finally {
      setIsLoading(false);
    }
  };

  // Pantalla de entrada de datos
  const renderInputForm = () => (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center p-4">
      {progressBar && <div className="fixed top-0 left-0 right-0 z-50">{progressBar}</div>}
      
      <QuestionnaireNavBar 
        icon={Hand}
        iconBgColor="bg-orange-100"
        iconColor="text-orange-600"
        onGoHome={onGoToHome}
        title="Evaluación de Fuerza de Agarre"
        subtitle="Dinamometría Manual"
      />

      <div className="w-full max-w-3xl mt-20">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full mb-4 shadow-lg">
              <Hand className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Evaluación de Fuerza de Agarre
            </h1>
            <p className="text-gray-600">
              Medición con dinamómetro manual según normas internacionales
            </p>
          </div>

          {/* Información del paciente */}
          {externalPatientInfo && (
            <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-6 mb-6 border-l-4 border-orange-500">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                <User className="w-5 h-5 mr-2 text-orange-600" />
                Datos del Paciente
              </h3>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Nombre:</span>
                  <p className="font-medium text-gray-800">{externalPatientInfo.name}</p>
                </div>
                <div>
                  <span className="text-gray-600">Edad:</span>
                  <p className="font-medium text-gray-800">{externalPatientInfo.age} años</p>
                </div>
                <div>
                  <span className="text-gray-600">Género:</span>
                  <p className="font-medium text-gray-800">{externalPatientInfo.gender}</p>
                </div>
              </div>
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Estatura */}
            <div>
              <label className="flex items-center text-gray-700 font-medium mb-2">
                <Ruler className="w-5 h-5 mr-2 text-orange-600" />
                Estatura (metros)
              </label>
              <input
                type="number"
                step="0.01"
                min="1.0"
                max="2.5"
                value={formData.estatura}
                onChange={(e) => setFormData({ ...formData, estatura: e.target.value })}
                placeholder="Ej: 1.74"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Ingrese la estatura en metros (ej: 1.74)</p>
            </div>

            {/* Fuerza de agarre */}
            <div>
              <label className="flex items-center text-gray-700 font-medium mb-2">
                <Scale className="w-5 h-5 mr-2 text-orange-600" />
                Fuerza de Agarre Medida (kg)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="150"
                value={formData.hgs_kg}
                onChange={(e) => setFormData({ ...formData, hgs_kg: e.target.value })}
                placeholder="Ej: 42.5"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Medición realizada con dinamómetro manual en kilogramos</p>
            </div>

            {/* Información sobre la medición */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
                <Brain className="w-5 h-5 mr-2" />
                Nota sobre la medición
              </h4>
              <p className="text-sm text-blue-800">
                La fuerza de agarre se evalúa usando un dinamómetro de mano. Esta prueba es un indicador importante de la fuerza muscular general y está asociada con diversos resultados de salud. Los resultados se comparan con datos normativos internacionales (Tomkinson et al. 2025).
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
                <AlertCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-red-800">{error}</div>
              </div>
            )}

            {/* Botón de envío */}
            <button
              type="submit"
              disabled={isLoading || !tablesData}
              className={`w-full py-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-3 ${
                isLoading || !tablesData
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
              }`}
            >
              {isLoading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Evaluando con IA...
                </>
              ) : !tablesData ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Cargando datos de referencia...
                </>
              ) : (
                <>
                  <Brain className="w-5 h-5" />
                  Evaluar con Gemini AI
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );

  // Pantalla de evaluación (loading)
  const renderEvaluating = () => (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-full mb-6 shadow-xl">
          <Brain className="w-12 h-12 text-orange-600 animate-pulse" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Analizando con Gemini AI</h2>
        <p className="text-gray-600 mb-4">Comparando con normas internacionales...</p>
        <div className="flex justify-center">
          <Loader className="w-8 h-8 text-orange-600 animate-spin" />
        </div>
      </div>
    </div>
  );

  // Pantalla de resultados
  const renderResults = () => {
    if (!result) return null;

    const getClassificationColor = (clasificacion) => {
      if (clasificacion.includes('baja')) return 'red';
      if (clasificacion.includes('moderada')) return 'yellow';
      if (clasificacion.includes('algo alta') || clasificacion.includes('alta')) return 'green';
      return 'gray';
    };

    const color = getClassificationColor(result.clasificacion);

    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center p-4">
        {progressBar && <div className="fixed top-0 left-0 right-0 z-50">{progressBar}</div>}
        
        <QuestionnaireNavBar 
          icon={Hand}
          iconBgColor="bg-orange-100"
          iconColor="text-orange-600"
          onGoHome={onGoToHome}
          title="Resultados de Fuerza de Agarre"
          subtitle="Evaluación completada"
        />

        <div className="w-full max-w-4xl mt-20">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* Header de éxito */}
            <div className="text-center mb-8">
              <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Evaluación Completada
              </h1>
              <p className="text-gray-600">
                Análisis realizado con IA - Normas Tomkinson et al. 2025
              </p>
            </div>

            {/* Datos de entrada */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-gray-800 mb-4">Datos del Paciente</h3>
              <div className="grid md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Sexo:</span>
                  <p className="font-medium text-gray-800">{result.input_data.sexo === 'male' ? 'Masculino' : 'Femenino'}</p>
                </div>
                <div>
                  <span className="text-gray-600">Edad:</span>
                  <p className="font-medium text-gray-800">{result.input_data.edad} años</p>
                </div>
                <div>
                  <span className="text-gray-600">Estatura:</span>
                  <p className="font-medium text-gray-800">{result.input_data.estatura_m} m</p>
                </div>
                <div>
                  <span className="text-gray-600">Fuerza medida:</span>
                  <p className="font-medium text-gray-800">{result.input_data.hgs_kg} kg</p>
                </div>
              </div>
            </div>

            {/* Resultados principales */}
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              {/* Clasificación */}
              <div className={`bg-${color}-50 border-2 border-${color}-200 rounded-lg p-6 text-center`}>
                <h4 className="text-sm font-medium text-gray-600 mb-2">Clasificación</h4>
                <p className={`text-2xl font-bold text-${color}-700 capitalize`}>
                  {result.clasificacion}
                </p>
              </div>

              {/* Percentil Absoluto */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 text-center">
                <h4 className="text-sm font-medium text-gray-600 mb-2">Percentil Absoluto</h4>
                <p className="text-3xl font-bold text-blue-700">
                  {result.percentil_absoluto.toFixed(1)}
                </p>
                <p className="text-xs text-blue-600 mt-1">Comparado con población mundial</p>
              </div>

              {/* Percentil Normalizado */}
              <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-6 text-center">
                <h4 className="text-sm font-medium text-gray-600 mb-2">Percentil Normalizado</h4>
                <p className="text-3xl font-bold text-purple-700">
                  {result.percentil_normalizado.toFixed(1)}
                </p>
                <p className="text-xs text-purple-600 mt-1">Ajustado por altura</p>
              </div>
            </div>

            {/* Fuerza normalizada */}
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6 mb-6">
              <h4 className="font-semibold text-indigo-900 mb-2">Fuerza Normalizada</h4>
              <p className="text-2xl font-bold text-indigo-700">
                {result.hgs_normalizada.toFixed(2)} kg/m²
              </p>
              <p className="text-sm text-indigo-700 mt-1">
                Fuerza ajustada según la superficie corporal
              </p>
            </div>

            {/* Interpretación clínica */}
            <div className="bg-gradient-to-r from-orange-50 to-orange-100 border-l-4 border-orange-500 rounded-lg p-6">
              <h4 className="font-semibold text-orange-900 mb-3 flex items-center">
                <Brain className="w-5 h-5 mr-2" />
                Interpretación Clínica (Gemini AI)
              </h4>
              <p className="text-gray-800 leading-relaxed">
                {result.interpretacion}
              </p>
            </div>

            {/* Botones de acción */}
            {showResultScreen && (
              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => {
                    setStep('input');
                    setFormData({ estatura: '', hgs_kg: '' });
                    setResult(null);
                    setError(null);
                  }}
                  className="flex-1 bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Nueva Evaluación
                </button>
                <button
                  onClick={onGoToHome}
                  className="flex-1 bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Home className="w-5 h-5" />
                  Ir al Inicio
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Renderizado principal
  if (step === 'input') return renderInputForm();
  if (step === 'evaluating') return renderEvaluating();
  if (step === 'result') return renderResults();

  return null;
};

export default HandGripQuestionnaire;
