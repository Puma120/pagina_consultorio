import React, { useState } from 'react';
import { User, Calendar, UserCircle, CheckCircle, Moon, Brain, Utensils, Home, Download, Mail } from 'lucide-react';
import StopBangQuestionnaire from './StopBangQuestionnaire';
import HADQuestionnaire from './HADQuestionnaire';
import TFEQQuestionnaire from './TFEQQuestionnaire';
import { sendEmailWithAttachment, generateCSVString } from '../utils/emailService';
import { evaluateStopBang } from '../utils/stopbangEvaluator';

const QuestionnaireFlow = () => {
  const [step, setStep] = useState('patient-data'); // patient-data, stopbang, had, tfeq, complete
  const [patientData, setPatientData] = useState({ name: '', age: '', gender: '' });
  const [questionnaireResults, setQuestionnaireResults] = useState({
    stopbang: null,
    had: null,
    tfeq: null
  });
  const [isEmailSending, setIsEmailSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const steps = [
    { id: 'stopbang', name: 'STOP-Bang', icon: Moon, color: 'blue' },
    { id: 'had', name: 'HAD', icon: Brain, color: 'purple' },
    { id: 'tfeq', name: 'TFEQ-R18', icon: Utensils, color: 'green' }
  ];

  const handlePatientSubmit = (e) => {
    e.preventDefault();
    if (patientData.name.trim() && patientData.age && patientData.gender) {
      setStep('stopbang');
    }
  };

  const handleQuestionnaireComplete = (questionnaireId, results) => {
    // Guardar resultados del cuestionario actual
    setQuestionnaireResults(prev => ({
      ...prev,
      [questionnaireId]: results
    }));

    // Avanzar al siguiente paso
    if (step === 'stopbang') setStep('had');
    else if (step === 'had') setStep('tfeq');
    else if (step === 'tfeq') setStep('complete');
  };

  const handleRestart = () => {
    setStep('patient-data');
    setPatientData({ name: '', age: '', gender: '' });
    setQuestionnaireResults({
      stopbang: null,
      had: null,
      tfeq: null
    });
    setEmailSent(false);
  };

  const downloadConsolidatedCSV = () => {
    const fecha = new Date().toISOString().slice(0, 10);
    
    // Crear contenido del CSV con codificación UTF-8
    let csvContent = '\uFEFF'; // BOM para UTF-8
    
    // Encabezado del CSV
    csvContent += '=== RESULTADOS CONSOLIDADOS DE CUESTIONARIOS ===\n\n';
    csvContent += `Fecha de evaluación:,${fecha}\n`;
    csvContent += `Nombre del paciente:,${patientData.name}\n`;
    csvContent += `Edad:,${patientData.age}\n`;
    csvContent += `Género:,${patientData.gender}\n\n`;
    
    // STOP-Bang
    if (questionnaireResults.stopbang) {
      const stopbang = questionnaireResults.stopbang;
      csvContent += '=== CUESTIONARIO STOP-BANG ===\n';
      csvContent += 'Evaluación de riesgo de apnea del sueño\n\n';
      csvContent += 'Pregunta,Respuesta\n';
      Object.keys(stopbang.answers).forEach(key => {
        csvContent += `${key},${stopbang.answers[key] ? 'Sí' : 'No'}\n`;
      });
      csvContent += `\nPuntaje total:,${stopbang.evaluation.score} de 8\n`;
      csvContent += `Nivel de riesgo:,${stopbang.evaluation.riskLevel}\n`;
      csvContent += `Evaluación:,"${stopbang.evaluation.interpretation}"\n\n`;
    }
    
    // HAD
    if (questionnaireResults.had) {
      const had = questionnaireResults.had;
      csvContent += '=== CUESTIONARIO HAD ===\n';
      csvContent += 'Escala de Ansiedad y Depresión Hospitalaria\n\n';
      csvContent += 'Pregunta,Respuesta\n';
      Object.keys(had.answers).forEach(key => {
        csvContent += `${key},${had.answers[key]}\n`;
      });
      csvContent += `\nPuntaje de Ansiedad:,${had.scores.anxiety.score}\n`;
      csvContent += `Nivel de Ansiedad:,${had.scores.anxiety.level}\n`;
      csvContent += `Interpretación:,"${had.scores.anxiety.interpretation}"\n`;
      csvContent += `Puntaje de Depresión:,${had.scores.depression.score}\n`;
      csvContent += `Nivel de Depresión:,${had.scores.depression.level}\n`;
      csvContent += `Interpretación:,"${had.scores.depression.interpretation}"\n\n`;
    }
    
    // TFEQ
    if (questionnaireResults.tfeq) {
      const tfeq = questionnaireResults.tfeq;
      csvContent += '=== CUESTIONARIO TFEQ-R18 ===\n';
      csvContent += 'Evaluación del Comportamiento Alimentario\n\n';
      csvContent += 'Pregunta,Respuesta\n';
      Object.keys(tfeq.answers).forEach(key => {
        csvContent += `${key},${tfeq.answers[key]}\n`;
      });
      csvContent += `\nRestricción Cognitiva:,${tfeq.scores.cognitive.score}\n`;
      csvContent += `Interpretación:,"${tfeq.scores.cognitive.interpretation}"\n`;
      csvContent += `Alimentación No Controlada:,${tfeq.scores.uncontrolled.score}\n`;
      csvContent += `Interpretación:,"${tfeq.scores.uncontrolled.interpretation}"\n`;
      csvContent += `Alimentación Emocional:,${tfeq.scores.emotional.score}\n`;
      csvContent += `Interpretación:,"${tfeq.scores.emotional.interpretation}"\n\n`;
    }
    
    // Crear blob con codificación UTF-8
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Resultados_Consolidados_${patientData.name.replace(/\s+/g, '_')}_${fecha}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const sendConsolidatedEmail = async () => {
    setIsEmailSending(true);
    
    try {
      const fecha = new Date().toISOString().slice(0, 10);
      
      // Construir el contenido del correo
      let emailContent = `RESULTADOS CONSOLIDADOS DE CUESTIONARIOS\n\n`;
      emailContent += `Fecha: ${fecha}\n`;
      emailContent += `Paciente: ${patientData.name}\n`;
      emailContent += `Edad: ${patientData.age}\n`;
      emailContent += `Género: ${patientData.gender}\n\n`;
      emailContent += `----------------------------\n\n`;
      
      // STOP-Bang
      if (questionnaireResults.stopbang) {
        const stopbang = questionnaireResults.stopbang;
        emailContent += `STOP-BANG (Apnea del Sueño)\n`;
        emailContent += `Puntaje: ${stopbang.evaluation.score}/8\n`;
        emailContent += `Riesgo: ${stopbang.evaluation.riskLevel}\n`;
        emailContent += `Evaluación: ${stopbang.evaluation.interpretation}\n\n`;
      }
      
      // HAD
      if (questionnaireResults.had) {
        const had = questionnaireResults.had;
        emailContent += `HAD (Ansiedad y Depresión)\n`;
        emailContent += `Ansiedad: ${had.scores.anxiety.score} - ${had.scores.anxiety.level}\n`;
        emailContent += `${had.scores.anxiety.interpretation}\n\n`;
        emailContent += `Depresión: ${had.scores.depression.score} - ${had.scores.depression.level}\n`;
        emailContent += `${had.scores.depression.interpretation}\n\n`;
      }
      
      // TFEQ
      if (questionnaireResults.tfeq) {
        const tfeq = questionnaireResults.tfeq;
        emailContent += `TFEQ-R18 (Comportamiento Alimentario)\n`;
        emailContent += `Restricción Cognitiva: ${tfeq.scores.cognitive.score}\n`;
        emailContent += `${tfeq.scores.cognitive.interpretation}\n\n`;
        emailContent += `Alimentación No Controlada: ${tfeq.scores.uncontrolled.score}\n`;
        emailContent += `${tfeq.scores.uncontrolled.interpretation}\n\n`;
        emailContent += `Alimentación Emocional: ${tfeq.scores.emotional.score}\n`;
        emailContent += `${tfeq.scores.emotional.interpretation}\n`;
      }
      
      const templateParams = {
        patient_name: patientData.name,
        patient_age: patientData.age,
        patient_gender: patientData.gender,
        date: fecha,
        questionnaire_results: emailContent
      };
      
      const result = await sendEmailWithAttachment(templateParams);
      
      if (result.success) {
        setEmailSent(true);
        alert('¡Correo enviado exitosamente!');
      } else {
        alert('Error al enviar el correo. Por favor intente nuevamente.');
      }
    } catch (error) {
      alert('Error al enviar el correo. Por favor intente nuevamente.');
      console.error('Error:', error);
    } finally {
      setIsEmailSending(false);
    }
  };

  const getCurrentStepIndex = () => {
    if (step === 'stopbang') return 0;
    if (step === 'had') return 1;
    if (step === 'tfeq') return 2;
    return -1;
  };

  // Pantalla de datos del paciente
  if (step === 'patient-data') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: '#f9fafb' }}>
        <div className="w-full max-w-4xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <User className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2 text-gray-800">
              Datos del Paciente
            </h1>
            <p className="text-gray-600">Por favor, complete sus datos para comenzar con los cuestionarios</p>
          </div>

          {/* Formulario */}
          <form onSubmit={handlePatientSubmit} className="bg-white rounded-lg shadow-md p-8">
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {/* Campo Nombre */}
              <div className="md:col-span-2">
                <label className="flex items-center text-gray-700 font-medium mb-2">
                  <User className="w-4 h-4 mr-2 text-blue-600" />
                  Nombre Completo
                </label>
                <input
                  type="text"
                  value={patientData.name}
                  onChange={(e) => setPatientData({ ...patientData, name: e.target.value })}
                  placeholder="Ingrese su nombre completo"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Campo Edad */}
              <div>
                <label className="flex items-center text-gray-700 font-medium mb-2">
                  <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                  Edad
                </label>
                <input
                  type="number"
                  value={patientData.age}
                  onChange={(e) => setPatientData({ ...patientData, age: e.target.value })}
                  placeholder="Ingrese su edad"
                  min="1"
                  max="120"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Campo Género */}
              <div>
                <label className="flex items-center text-gray-700 font-medium mb-2">
                  <UserCircle className="w-4 h-4 mr-2 text-blue-600" />
                  Género
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPatientData({ ...patientData, gender: 'Masculino' })}
                    className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                      patientData.gender === 'Masculino'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Masculino
                  </button>
                  <button
                    type="button"
                    onClick={() => setPatientData({ ...patientData, gender: 'Femenino' })}
                    className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                      patientData.gender === 'Femenino'
                        ? 'bg-pink-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Femenino
                  </button>
                </div>
              </div>
            </div>

            {/* Información adicional */}
            <div className="mb-6">
              <h3 className="text-gray-800 font-semibold mb-4 text-center">Completará 3 cuestionarios</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {/* STOP-Bang */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mx-auto mb-3">
                    <Moon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h4 className="text-blue-900 font-semibold text-center mb-2">STOP-Bang</h4>
                  <p className="text-blue-700 text-xs text-center">Evaluación de apnea del sueño</p>
                </div>

                {/* HAD */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mx-auto mb-3">
                    <Brain className="w-6 h-6 text-purple-600" />
                  </div>
                  <h4 className="text-purple-900 font-semibold text-center mb-2">HAD</h4>
                  <p className="text-purple-700 text-xs text-center">Escala de ansiedad y depresión</p>
                </div>

                {/* TFEQ */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mx-auto mb-3">
                    <Utensils className="w-6 h-6 text-green-600" />
                  </div>
                  <h4 className="text-green-900 font-semibold text-center mb-2">TFEQ-R18</h4>
                  <p className="text-green-700 text-xs text-center">Comportamiento alimentario</p>
                </div>
              </div>
              
              <div className="flex items-center justify-center text-gray-600 text-sm">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Tiempo estimado: 10-15 minutos</span>
              </div>
            </div>

            {/* Botón de envío */}
            <button
              type="submit"
              className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center group"
            >
              <span>Comenzar Cuestionarios</span>
              <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Pantalla de completado
  if (step === 'complete') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-6 animate-bounce" />
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              ¡Felicitaciones, {patientData.name}!
            </h1>
            <p className="text-xl text-gray-600 mb-2">
              Ha completado todos los cuestionarios exitosamente
            </p>
            <p className="text-gray-500">
              A continuación puede descargar los resultados o enviarlos por correo electrónico
            </p>
          </div>

          {/* Resumen de cuestionarios completados */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            {steps.map((s) => {
              const IconComp = s.icon;
              return (
                <div key={s.id} className={`p-4 bg-${s.color}-50 rounded-lg border-2 border-${s.color}-200`}>
                  <div className="flex items-center justify-center mb-3">
                    <IconComp className={`w-8 h-8 text-${s.color}-600`} />
                  </div>
                  <h3 className="font-semibold text-gray-700 mb-1 text-center">{s.name}</h3>
                  <p className="text-sm text-gray-500 text-center">Completado</p>
                  <div className="flex justify-center mt-2">
                    <CheckCircle className={`w-6 h-6 text-${s.color}-600`} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Información del paciente */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-gray-700 mb-3 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Datos del Paciente
            </h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Nombre:</span>
                <p className="font-medium text-gray-800">{patientData.name}</p>
              </div>
              <div>
                <span className="text-gray-500">Edad:</span>
                <p className="font-medium text-gray-800">{patientData.age} años</p>
              </div>
              <div>
                <span className="text-gray-500">Género:</span>
                <p className="font-medium text-gray-800">{patientData.gender}</p>
              </div>
            </div>
          </div>

          {/* Resultados de los cuestionarios */}
          <div className="space-y-4 mb-6">
            <h3 className="text-xl font-bold text-gray-800">Resultados de los Cuestionarios</h3>
            
            {/* STOP-Bang */}
            {questionnaireResults.stopbang && (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
                <div className="flex items-center justify-center mb-4 pb-3 border-b-2 border-blue-300">
                  <Moon className="w-6 h-6 text-blue-600 mr-3" />
                  <h4 className="text-xl font-bold text-blue-900">STOP-Bang - Apnea del Sueño</h4>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-blue-800 font-medium">Puntaje:</span>
                    <span className="text-blue-900 font-bold text-lg">{questionnaireResults.stopbang.evaluation.score} / 8</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-800 font-medium">Nivel de Riesgo:</span>
                    <span className="text-blue-900 font-bold">{questionnaireResults.stopbang.evaluation.riskLevel}</span>
                  </div>
                  <div className="mt-3 pt-3 border-t border-blue-200">
                    <p className="text-blue-800 text-sm">
                      <strong>Interpretación:</strong> {questionnaireResults.stopbang.evaluation.interpretation}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* HAD */}
            {questionnaireResults.had && (
              <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-6">
                <div className="flex items-center justify-center mb-4 pb-3 border-b-2 border-purple-300">
                  <Brain className="w-6 h-6 text-purple-600 mr-3" />
                  <h4 className="text-xl font-bold text-purple-900">HAD - Ansiedad y Depresión</h4>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4">
                    <h5 className="font-bold text-purple-800 mb-2">Ansiedad</h5>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-purple-700">Puntaje:</span>
                        <span className="font-bold text-purple-900">{questionnaireResults.had.scores.anxiety.score}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-purple-700">Nivel:</span>
                        <span className="font-bold text-purple-900">{questionnaireResults.had.scores.anxiety.level}</span>
                      </div>
                      <p className="text-xs text-purple-700 mt-2 pt-2 border-t border-purple-200">
                        {questionnaireResults.had.scores.anxiety.interpretation}
                      </p>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <h5 className="font-bold text-purple-800 mb-2">Depresión</h5>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-purple-700">Puntaje:</span>
                        <span className="font-bold text-purple-900">{questionnaireResults.had.scores.depression.score}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-purple-700">Nivel:</span>
                        <span className="font-bold text-purple-900">{questionnaireResults.had.scores.depression.level}</span>
                      </div>
                      <p className="text-xs text-purple-700 mt-2 pt-2 border-t border-purple-200">
                        {questionnaireResults.had.scores.depression.interpretation}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TFEQ */}
            {questionnaireResults.tfeq && (
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
                <div className="flex items-center justify-center mb-4 pb-3 border-b-2 border-green-300">
                  <Utensils className="w-6 h-6 text-green-600 mr-3" />
                  <h4 className="text-xl font-bold text-green-900">TFEQ-R18 - Comportamiento Alimentario</h4>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg p-4">
                    <h5 className="font-bold text-green-800 mb-2 text-sm">Restricción Cognitiva</h5>
                    <div className="text-center mb-2">
                      <span className="text-2xl font-bold text-green-900">{questionnaireResults.tfeq.scores.cognitive.score}</span>
                    </div>
                    <p className="text-xs text-green-700">
                      {questionnaireResults.tfeq.scores.cognitive.interpretation}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <h5 className="font-bold text-green-800 mb-2 text-sm">Alimentación No Controlada</h5>
                    <div className="text-center mb-2">
                      <span className="text-2xl font-bold text-green-900">{questionnaireResults.tfeq.scores.uncontrolled.score}</span>
                    </div>
                    <p className="text-xs text-green-700">
                      {questionnaireResults.tfeq.scores.uncontrolled.interpretation}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <h5 className="font-bold text-green-800 mb-2 text-sm">Alimentación Emocional</h5>
                    <div className="text-center mb-2">
                      <span className="text-2xl font-bold text-green-900">{questionnaireResults.tfeq.scores.emotional.score}</span>
                    </div>
                    <p className="text-xs text-green-700">
                      {questionnaireResults.tfeq.scores.emotional.interpretation}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Botones de acción */}
          <div className="grid md:grid-cols-3 gap-4">
            <button
              onClick={downloadConsolidatedCSV}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              Descargar CSV
            </button>
            <button
              onClick={sendConsolidatedEmail}
              disabled={isEmailSending || emailSent}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
                emailSent
                  ? 'bg-green-500 text-white cursor-not-allowed'
                  : isEmailSending
                  ? 'bg-gray-400 text-white cursor-wait'
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
            >
              {isEmailSending ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Enviando...
                </>
              ) : emailSent ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Enviado
                </>
              ) : (
                <>
                  <Mail className="w-5 h-5" />
                  Enviar al Médico
                </>
              )}
            </button>
            <button
              onClick={handleRestart}
              className="bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" />
              Nuevo Cuestionario
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Barra de progreso para los cuestionarios
  const ProgressBar = () => {
    const currentIndex = getCurrentStepIndex();
    
    return (
      <div className="fixed left-0 right-0 bg-white border-b border-gray-200 shadow-sm z-40" style={{ top: '64px' }}>
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            {steps.map((s, index) => {
              const IconComp = s.icon;
              const isCompleted = index < currentIndex;
              const isCurrent = index === currentIndex;
              
              return (
                <React.Fragment key={s.id}>
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      isCompleted
                        ? `bg-${s.color}-600 text-white`
                        : isCurrent
                        ? `bg-${s.color}-100 border-2 border-${s.color}-600`
                        : 'bg-gray-200 text-gray-400'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <IconComp className={`w-5 h-5 ${isCurrent ? `text-${s.color}-600` : ''}`} />
                      )}
                    </div>
                    <p className={`mt-1 text-xs font-medium ${
                      isCurrent ? `text-${s.color}-600` : isCompleted ? 'text-gray-700' : 'text-gray-400'
                    }`}>
                      {s.name}
                    </p>
                  </div>
                  
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-1 mx-3 rounded transition-all ${
                      isCompleted ? `bg-${s.color}-600` : 'bg-gray-200'
                    }`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // Renderizar el cuestionario actual
  return (
    <div className="min-h-screen bg-gray-50">
      {step === 'stopbang' && (
        <StopBangQuestionnaire
          onGoToHome={handleRestart}
          onGoToHAD={() => setStep('had')}
          onGoToTFEQ={() => setStep('tfeq')}
          patientInfo={patientData}
          onComplete={(results) => handleQuestionnaireComplete('stopbang', results)}
          hidePatientForm={true}
          progressBar={<ProgressBar />}
          showResultScreen={false}
        />
      )}
      {step === 'had' && (
        <HADQuestionnaire
          onGoToHome={handleRestart}
          onGoToStopBang={() => setStep('stopbang')}
          onGoToTFEQ={() => setStep('tfeq')}
          patientInfo={patientData}
          onComplete={(results) => handleQuestionnaireComplete('had', results)}
          hidePatientForm={true}
          progressBar={<ProgressBar />}
          showResultScreen={false}
        />
      )}
      {step === 'tfeq' && (
        <TFEQQuestionnaire
          onGoToHome={handleRestart}
          onGoToStopBang={() => setStep('stopbang')}
          onGoToHAD={() => setStep('had')}
          patientInfo={patientData}
          onComplete={(results) => handleQuestionnaireComplete('tfeq', results)}
          hidePatientForm={true}
          progressBar={<ProgressBar />}
          showResultScreen={false}
        />
      )}
    </div>
  );
};

export default QuestionnaireFlow;
