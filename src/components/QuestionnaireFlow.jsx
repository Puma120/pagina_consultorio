import React, { useState } from 'react';
import { User, Calendar, UserCircle, CheckCircle, Moon, Brain, Utensils, Home, Download, Mail, FileText } from 'lucide-react';
import StopBangQuestionnaire from './StopBangQuestionnaire';
import HADQuestionnaire from './HADQuestionnaire';
import TFEQQuestionnaire from './TFEQQuestionnaire';
import { sendEmailWithAttachment, generateCSVString } from '../utils/emailService';
import { evaluateStopBang } from '../utils/stopbangEvaluator';
import jsPDF from 'jspdf';

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
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const steps = [
    { id: 'stopbang', name: 'STOP-Bang', icon: Moon, color: 'blue' },
    { id: 'had', name: 'HAD', icon: Brain, color: 'purple' },
    { id: 'tfeq', name: 'TFEQ-R18', icon: Utensils, color: 'green' }
  ];

  // Función para determinar el color del semáforo según el nivel de riesgo
  const getRiskColor = (questionnaireId) => {
    if (!questionnaireResults[questionnaireId]) return 'gray';

    if (questionnaireId === 'stopbang') {
      const score = questionnaireResults.stopbang.evaluation.score;
      if (score <= 2) return 'green'; // Bajo riesgo
      if (score <= 4) return 'yellow'; // Riesgo intermedio
      return 'red'; // Alto riesgo
    }

    if (questionnaireId === 'had') {
      const anxietyScore = questionnaireResults.had.scores.anxiety.score;
      const depressionScore = questionnaireResults.had.scores.depression.score;
      const maxScore = Math.max(anxietyScore, depressionScore);
      
      if (maxScore <= 7) return 'green'; // Normal
      if (maxScore <= 10) return 'yellow'; // Borderline
      return 'red'; // Anormal
    }

    if (questionnaireId === 'tfeq') {
      const cognitiveScore = questionnaireResults.tfeq.scores.cognitive.score;
      const uncontrolledScore = questionnaireResults.tfeq.scores.uncontrolled.score;
      const emotionalScore = questionnaireResults.tfeq.scores.emotional.score;
      
      // Determinar si algún score está en rango alto
      const hasHighRisk = 
        (cognitiveScore >= 14) || 
        (uncontrolledScore >= 27) || 
        (emotionalScore >= 8);
      
      const hasMediumRisk = 
        (cognitiveScore >= 10 && cognitiveScore < 14) || 
        (uncontrolledScore >= 20 && uncontrolledScore < 27) || 
        (emotionalScore >= 5 && emotionalScore < 8);
      
      if (hasHighRisk) return 'red';
      if (hasMediumRisk) return 'yellow';
      return 'green';
    }

    return 'gray';
  };

  const getRiskLevel = (questionnaireId) => {
    if (!questionnaireResults[questionnaireId]) return 'low';

    if (questionnaireId === 'stopbang') {
      const score = questionnaireResults.stopbang.evaluation.score;
      if (score <= 2) return 'low'; // Bajo riesgo
      if (score <= 4) return 'medium'; // Riesgo intermedio
      return 'high'; // Alto riesgo
    }

    if (questionnaireId === 'had') {
      const anxietyScore = questionnaireResults.had.scores.anxiety.score;
      const depressionScore = questionnaireResults.had.scores.depression.score;
      const maxScore = Math.max(anxietyScore, depressionScore);
      
      if (maxScore <= 7) return 'low'; // Normal
      if (maxScore <= 10) return 'medium'; // Borderline
      return 'high'; // Anormal
    }

    if (questionnaireId === 'tfeq') {
      const cognitiveScore = questionnaireResults.tfeq.scores.cognitive.score;
      const uncontrolledScore = questionnaireResults.tfeq.scores.uncontrolled.score;
      const emotionalScore = questionnaireResults.tfeq.scores.emotional.score;
      
      // Determinar si algún score está en rango alto
      const hasHighRisk = 
        (cognitiveScore >= 14) || 
        (uncontrolledScore >= 27) || 
        (emotionalScore >= 8);
      
      const hasMediumRisk = 
        (cognitiveScore >= 10 && cognitiveScore < 14) || 
        (uncontrolledScore >= 20 && uncontrolledScore < 27) || 
        (emotionalScore >= 5 && emotionalScore < 8);
      
      if (hasHighRisk) return 'high';
      if (hasMediumRisk) return 'medium';
      return 'low';
    }

    return 'low';
  };

  const getRiskLevelText = (questionnaireId) => {
    const level = getRiskLevel(questionnaireId);
    
    if (questionnaireId === 'stopbang') {
      if (level === 'low') return 'Bajo Riesgo';
      if (level === 'medium') return 'Riesgo Intermedio';
      return 'Alto Riesgo';
    }
    
    if (questionnaireId === 'had') {
      if (level === 'low') return 'Normal';
      if (level === 'medium') return 'Borderline';
      return 'Anormal';
    }
    
    if (questionnaireId === 'tfeq') {
      if (level === 'low') return 'Bajo';
      if (level === 'medium') return 'Moderado';
      return 'Alto';
    }
    
    return 'No especificado';
  };

  // Componente termómetro
  const Thermometer = ({ level }) => {
    const getFillPercentage = (level) => {
      switch (level) {
        case 'low':
          return 33;
        case 'medium':
          return 66;
        case 'high':
          return 100;
        default:
          return 0;
      }
    };

    const getGradientStops = (level) => {
      // El degradado se ajusta según el nivel de riesgo
      // Para que la punta del relleno tenga el color correspondiente
      switch (level) {
        case 'low':
          // Solo va de verde a un verde más claro
          return {
            start: '#22c55e',
            end: '#4ade80'
          };
        case 'medium':
          // Va de verde a amarillo
          return {
            start: '#22c55e',
            end: '#eab308'
          };
        case 'high':
          // Va de verde a amarillo a rojo
          return {
            start: '#22c55e',
            mid: '#eab308',
            end: '#ef4444'
          };
        default:
          return {
            start: '#9ca3af',
            end: '#9ca3af'
          };
      }
    };

    const percentage = getFillPercentage(level);
    const fillHeight = (percentage / 100) * 140; // 140 es la altura del tubo
    const gradientId = `thermometer-gradient-${level}`;
    const gradientStops = getGradientStops(level);

    return (
      <div style={{ width: '60px', height: '180px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <svg width="60" height="180" viewBox="0 0 60 180" xmlns="http://www.w3.org/2000/svg">
          <defs>
            {/* Degradado dinámico según el nivel de riesgo */}
            <linearGradient id={gradientId} x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" style={{ stopColor: gradientStops.start, stopOpacity: 1 }} />
              {gradientStops.mid && (
                <stop offset="50%" style={{ stopColor: gradientStops.mid, stopOpacity: 1 }} />
              )}
              <stop offset="100%" style={{ stopColor: gradientStops.end, stopOpacity: 1 }} />
            </linearGradient>
          </defs>
          
          {/* Tubo exterior del termómetro */}
          <rect x="20" y="10" width="20" height="140" rx="10" fill="#f3f4f6" stroke="#374151" strokeWidth="2"/>
          
          {/* Bulbo del termómetro */}
          <circle cx="30" cy="160" r="18" fill="#f3f4f6" stroke="#374151" strokeWidth="2"/>
          
          {/* Relleno del bulbo siempre verde */}
          <circle cx="30" cy="160" r="14" fill="#22c55e"/>
          
          {/* Relleno del tubo (de abajo hacia arriba) con degradado */}
          <rect 
            x="24" 
            y={150 - fillHeight} 
            width="12" 
            height={fillHeight} 
            fill={`url(#${gradientId})`}
            rx="6"
          />
          
          {/* Marcas de medición */}
          <line x1="40" y1="30" x2="45" y2="30" stroke="#6b7280" strokeWidth="1.5"/>
          <line x1="40" y1="50" x2="43" y2="50" stroke="#9ca3af" strokeWidth="1"/>
          <line x1="40" y1="70" x2="45" y2="70" stroke="#6b7280" strokeWidth="1.5"/>
          <line x1="40" y1="90" x2="43" y2="90" stroke="#9ca3af" strokeWidth="1"/>
          <line x1="40" y1="110" x2="45" y2="110" stroke="#6b7280" strokeWidth="1.5"/>
          <line x1="40" y1="130" x2="43" y2="130" stroke="#9ca3af" strokeWidth="1"/>
          
          {/* Tubo interior para efecto de profundidad */}
          <rect x="24" y="15" width="12" height="135" rx="6" fill="none" stroke="#d1d5db" strokeWidth="1" opacity="0.5"/>
        </svg>
      </div>
    );
  };

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

  const downloadPDF = async () => {
    if (isGeneratingPDF) return;
    
    setIsGeneratingPDF(true);
    
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      const contentWidth = pageWidth - (2 * margin);
      let yPosition = margin;
      const fecha = new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });

      // Función para dibujar termómetro
      const drawThermometer = (x, y, level) => {
        const getFillPercentage = (level) => {
          switch (level) {
            case 'low': return 33;
            case 'medium': return 66;
            case 'high': return 100;
            default: return 0;
          }
        };
        
        const getColorForHeight = (heightPercent, level) => {
          // Simular el degradado calculando el color según la altura
          if (level === 'low') {
            // Verde a verde claro
            const ratio = heightPercent / 33;
            return [
              34 + (74 - 34) * ratio,
              197 + (222 - 197) * ratio,
              94 + (128 - 94) * ratio
            ];
          } else if (level === 'medium') {
            // Verde a amarillo
            if (heightPercent < 33) {
              return [34, 197, 94]; // Verde base
            } else {
              const ratio = (heightPercent - 33) / 33;
              return [
                34 + (234 - 34) * ratio,
                197 + (179 - 197) * ratio,
                94 + (8 - 94) * ratio
              ];
            }
          } else { // high
            // Verde a amarillo a rojo
            if (heightPercent < 33) {
              return [34, 197, 94]; // Verde
            } else if (heightPercent < 66) {
              const ratio = (heightPercent - 33) / 33;
              return [
                34 + (234 - 34) * ratio,
                197 + (179 - 197) * ratio,
                94 + (8 - 94) * ratio
              ];
            } else {
              const ratio = (heightPercent - 66) / 34;
              return [
                234 + (239 - 234) * ratio,
                179 + (68 - 179) * ratio,
                8 + (68 - 8) * ratio
              ];
            }
          }
        };
        
        const percentage = getFillPercentage(level);
        const tubeHeight = 20;
        const fillHeight = (percentage / 100) * tubeHeight;
        
        // Tubo exterior
        pdf.setFillColor(243, 244, 246);
        pdf.setDrawColor(55, 65, 81);
        pdf.setLineWidth(0.4);
        pdf.roundedRect(x + 1.5, y, 4, tubeHeight, 2, 2, 'FD');
        
        // Bulbo exterior
        pdf.setFillColor(243, 244, 246);
        pdf.circle(x + 3.5, y + 23, 3.5, 'FD');
        
        // Relleno del bulbo (siempre verde)
        pdf.setFillColor(34, 197, 94);
        pdf.circle(x + 3.5, y + 23, 2.8, 'F');
        
        // Relleno del tubo con degradado simulado usando rectángulo redondeado como base
        if (fillHeight > 0) {
          const steps = 30;
          const stepHeight = fillHeight / steps;
          
          // Dibujar el fondo completo redondeado primero
          for (let i = 0; i < steps; i++) {
            const currentPercent = ((steps - i - 1) / steps) * percentage;
            const color = getColorForHeight(currentPercent, level);
            pdf.setFillColor(Math.round(color[0]), Math.round(color[1]), Math.round(color[2]));
            const stepY = y + tubeHeight - fillHeight + (i * stepHeight);
            const remainingHeight = fillHeight - (i * stepHeight);
            
            // Usar rectángulo redondeado para toda la altura restante
            if (remainingHeight > 1) {
              pdf.roundedRect(x + 2, stepY, 3, remainingHeight, 1.5, 1.5, 'F');
            }
          }
        }
        
        // Líneas de medición
        pdf.setDrawColor(107, 114, 128);
        pdf.setLineWidth(0.3);
        pdf.line(x + 5.5, y + 3, x + 7, y + 3);
        pdf.line(x + 5.5, y + 10, x + 7, y + 10);
        pdf.line(x + 5.5, y + 17, x + 7, y + 17);
      };

      // Función para verificar espacio y agregar nueva página si es necesario
      const checkSpace = (needed) => {
        if (yPosition + needed > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
          return true;
        }
        return false;
      };

      // Función para agregar texto con ajuste automático
      const addText = (text, x, y, maxWidth, options = {}) => {
        pdf.setFontSize(options.fontSize || 10);
        pdf.setFont('helvetica', options.fontStyle || 'normal');
        pdf.setTextColor(options.color?.[0] || 0, options.color?.[1] || 0, options.color?.[2] || 0);
        
        const lines = pdf.splitTextToSize(text, maxWidth);
        let currentY = y;
        const lineHeight = (options.fontSize || 10) * 0.5;
        
        lines.forEach(line => {
          if (currentY + lineHeight > pageHeight - margin) {
            pdf.addPage();
            currentY = margin;
          }
          pdf.text(line, x, currentY);
          currentY += lineHeight;
        });
        
        return currentY;
      };

      // ============ HEADER ============
      pdf.setFillColor(59, 130, 246); // blue-500
      pdf.rect(0, 0, pageWidth, 45, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.text('RESULTADOS DE CUESTIONARIOS', pageWidth / 2, 20, { align: 'center' });
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Evaluación Clínica Consolidada', pageWidth / 2, 30, { align: 'center' });
      pdf.text(fecha, pageWidth / 2, 38, { align: 'center' });

      yPosition = 55;

      // ============ INFORMACIÓN DEL PACIENTE ============
      pdf.setFillColor(243, 244, 246); // gray-100
      pdf.roundedRect(margin, yPosition, contentWidth, 28, 3, 3, 'F');
      
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Información del Paciente', margin + 5, yPosition + 8);
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Nombre: ${patientData.name}`, margin + 5, yPosition + 15);
      pdf.text(`Edad: ${patientData.age} años`, margin + 5, yPosition + 21);
      pdf.text(`Género: ${patientData.gender}`, margin + 70, yPosition + 21);

      yPosition += 35;

      // ============ STOP-BANG ============
      if (questionnaireResults.stopbang) {
        checkSpace(70);
        
        const stopbang = questionnaireResults.stopbang;
        const riskColor = getRiskColor('stopbang');
        
        // Header de sección
        const headerY = yPosition;
        pdf.setFillColor(59, 130, 246); // blue-500
        pdf.roundedRect(margin, headerY, contentWidth, 15, 2, 2, 'F');
        
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('STOP-BANG', margin + 5, headerY + 6);
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        pdf.text('Evaluación de Apnea del Sueño', margin + 5, headerY + 11);
        
        // Termómetro
        const riskLevel = getRiskLevel('stopbang');
        drawThermometer(pageWidth - margin - 10, headerY - 2, riskLevel);
        
        yPosition = headerY + 18;
        
        // Contenido simplificado
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`${stopbang.evaluation.score}/8`, margin + 5, yPosition + 6);
        
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Nivel de Riesgo: ', margin + 5, yPosition + 13);
        const riskColorRGB = riskColor === 'red' ? [220, 38, 38] : riskColor === 'yellow' ? [202, 138, 4] : [21, 128, 61];
        pdf.setTextColor(riskColorRGB[0], riskColorRGB[1], riskColorRGB[2]);
        pdf.text(`${stopbang.evaluation.riskLevel}`, margin + 37, yPosition + 13);
        
        yPosition += 20;
      }

      // ============ HAD ============
      if (questionnaireResults.had) {
        checkSpace(80);
        
        const had = questionnaireResults.had;
        const riskColor = getRiskColor('had');
        
        // Header
        const headerY = yPosition;
        pdf.setFillColor(168, 85, 247); // purple-500
        pdf.roundedRect(margin, headerY, contentWidth, 15, 2, 2, 'F');
        
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('HAD', margin + 5, headerY + 6);
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        pdf.text('Evaluación Psicológica', margin + 5, headerY + 11);
        
        // Termómetro
        const riskLevel = getRiskLevel('had');
        drawThermometer(pageWidth - margin - 10, headerY - 2, riskLevel);
        
        yPosition = headerY + 18;
        
        // Dos columnas simplificadas
        const colWidth = (contentWidth - 3) / 2;
        const leftX = margin;
        const rightX = margin + colWidth + 3;
        const startY = yPosition;
        
        // Columna izquierda: Ansiedad
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.text('ANSIEDAD', leftX + 2, startY + 6);
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`${had.scores.anxiety.score}/21`, leftX + 2, startY + 13);
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`${had.scores.anxiety.level}`, leftX + 2, startY + 19);
        
        // Columna derecha: Depresión
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.text('DEPRESIÓN', rightX + 2, startY + 6);
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`${had.scores.depression.score}/21`, rightX + 2, startY + 13);
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`${had.scores.depression.level}`, rightX + 2, startY + 19);
        
        // Nivel de riesgo general
        yPosition = startY + 26;
        const hadRiskLevel = getRiskLevelText('had');
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Nivel de Riesgo: ', margin + 2, yPosition);
        const hadRiskColor = riskColor === 'red' ? [220, 38, 38] : riskColor === 'yellow' ? [202, 138, 4] : [21, 128, 61];
        pdf.setTextColor(hadRiskColor[0], hadRiskColor[1], hadRiskColor[2]);
        pdf.text(hadRiskLevel, margin + 32, yPosition);
        
        yPosition += 8;
      }

      // ============ TFEQ ============
      if (questionnaireResults.tfeq) {
        checkSpace(80);
        
        const tfeq = questionnaireResults.tfeq;
        const riskColor = getRiskColor('tfeq');
        
        // Header
        const headerY = yPosition;
        pdf.setFillColor(34, 197, 94); // green-500
        pdf.roundedRect(margin, headerY, contentWidth, 15, 2, 2, 'F');
        
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('TFEQ-R18', margin + 5, headerY + 6);
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        pdf.text('Evaluación de Comportamiento Alimentario', margin + 5, headerY + 11);
        
        // Termómetro
        const riskLevel = getRiskLevel('tfeq');
        drawThermometer(pageWidth - margin - 10, headerY - 2, riskLevel);
        
        yPosition = headerY + 18;
        
        // Tres columnas simplificadas
        const colWidth3 = (contentWidth - 6) / 3;
        const col1X = margin;
        const col2X = margin + colWidth3 + 3;
        const col3X = margin + 2 * (colWidth3 + 3);
        const startY = yPosition;
        
        // Col 1: Restricción Cognitiva
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(7);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Restricción Cognitiva', col1X + colWidth3 / 2, startY + 4, { align: 'center' });
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'normal');
        pdf.text(String(tfeq.scores.cognitive.score), col1X + colWidth3 / 2, startY + 12, { align: 'center' });
        
        // Col 2: Alimentación No Controlada
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(7);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Alimentación No', col2X + colWidth3 / 2, startY + 3, { align: 'center' });
        pdf.text('Controlada', col2X + colWidth3 / 2, startY + 6.5, { align: 'center' });
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'normal');
        pdf.text(String(tfeq.scores.uncontrolled.score), col2X + colWidth3 / 2, startY + 14, { align: 'center' });
        
        // Col 3: Alimentación Emocional
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(7);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Alimentación', col3X + colWidth3 / 2, startY + 3, { align: 'center' });
        pdf.text('Emocional', col3X + colWidth3 / 2, startY + 6.5, { align: 'center' });
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'normal');
        pdf.text(String(tfeq.scores.emotional.score), col3X + colWidth3 / 2, startY + 14, { align: 'center' });
        
        // Nivel de riesgo general
        yPosition = startY + 20;
        const tfeqRiskLevel = getRiskLevelText('tfeq');
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Nivel de Riesgo: ', margin + 2, yPosition);
        const tfeqRiskColor = riskColor === 'red' ? [220, 38, 38] : riskColor === 'yellow' ? [202, 138, 4] : [21, 128, 61];
        pdf.setTextColor(tfeqRiskColor[0], tfeqRiskColor[1], tfeqRiskColor[2]);
        pdf.text(tfeqRiskLevel, margin + 32, yPosition);
        
        yPosition += 8;
      }

      // ============ FOOTER ============
      const totalPages = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(156, 163, 175);
        pdf.text(`Página ${i} de ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
        pdf.text('Documento generado automáticamente', pageWidth / 2, pageHeight - 6, { align: 'center' });
      }

      // Guardar PDF
      pdf.save(`Resultados_${patientData.name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (error) {
      console.error('Error al generar PDF:', error);
      alert('Error al generar el PDF. Por favor intente nuevamente.');
    } finally {
      setIsGeneratingPDF(false);
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
        <div className="w-full max-w-6xl mx-auto">
          {/* Header con información del paciente */}
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-full p-4">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                    ¡Cuestionarios Completados!
                  </h1>
                  <p className="text-gray-600">{patientData.name} • {patientData.age} años • {patientData.gender}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={downloadPDF}
                  disabled={isGeneratingPDF}
                  className={`text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-md ${
                    isGeneratingPDF 
                      ? 'bg-red-400 cursor-wait' 
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                  title="Descargar PDF"
                >
                  {isGeneratingPDF ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span className="hidden md:inline">Generando...</span>
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4" />
                      <span className="hidden md:inline">PDF</span>
                    </>
                  )}
                </button>
                <button
                  onClick={downloadConsolidatedCSV}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-md"
                  title="Descargar CSV"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden md:inline">CSV</span>
                </button>
                <button
                  onClick={sendConsolidatedEmail}
                  disabled={isEmailSending || emailSent}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-md ${
                    emailSent
                      ? 'bg-green-500 text-white cursor-not-allowed'
                      : isEmailSending
                      ? 'bg-gray-400 text-white cursor-wait'
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}
                  title="Enviar por email"
                >
                  {isEmailSending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span className="hidden md:inline">Enviando...</span>
                    </>
                  ) : emailSent ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span className="hidden md:inline">Enviado</span>
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4" />
                      <span className="hidden md:inline">Email</span>
                    </>
                  )}
                </button>
                <button
                  onClick={handleRestart}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors flex items-center gap-2 shadow-md"
                  title="Iniciar nuevo cuestionario"
                >
                  <Home className="w-4 h-4" />
                  <span className="hidden md:inline">Nuevo</span>
                </button>
              </div>
            </div>
          </div>

          {/* Resultados de los cuestionarios */}
          <div className="space-y-5">
            {/* STOP-Bang */}
            {questionnaireResults.stopbang && (
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-white/20 rounded-lg p-2">
                      <Moon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">STOP-BANG</h3>
                      <p className="text-blue-100 text-sm">Evaluación de Apnea del Sueño</p>
                    </div>
                  </div>
                  <Thermometer level={getRiskLevel('stopbang')} />
                </div>
                <div className="p-6">
                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div className="bg-blue-50 rounded-lg p-4 text-center">
                      <p className="text-blue-600 text-sm font-medium mb-1">Puntaje Total</p>
                      <p className="text-3xl font-bold text-blue-900">{questionnaireResults.stopbang.evaluation.score}<span className="text-lg text-blue-600">/8</span></p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4 text-center md:col-span-2">
                      <p className="text-blue-600 text-sm font-medium mb-1">Nivel de Riesgo</p>
                      <p className="text-2xl font-bold text-blue-900">{questionnaireResults.stopbang.evaluation.riskLevel}</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 text-sm leading-relaxed">
                      <strong className="text-gray-900">Interpretación:</strong> {questionnaireResults.stopbang.evaluation.interpretation}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* HAD */}
            {questionnaireResults.had && (
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-white/20 rounded-lg p-2">
                      <Brain className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">HAD</h3>
                      <p className="text-purple-100 text-sm">Escala de Ansiedad y Depresión</p>
                    </div>
                  </div>
                  <Thermometer level={getRiskLevel('had')} />
                </div>
                <div className="p-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-purple-50 rounded-lg p-5">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-bold text-purple-900 text-lg">Ansiedad</h4>
                        <span className="text-3xl font-bold text-purple-600">{questionnaireResults.had.scores.anxiety.score}</span>
                      </div>
                      <div className="mb-3 pb-3 border-b border-purple-200">
                        <p className="text-sm text-purple-700">
                          <strong>Nivel:</strong> {questionnaireResults.had.scores.anxiety.level}
                        </p>
                      </div>
                      <p className="text-xs text-purple-800 leading-relaxed">
                        {questionnaireResults.had.scores.anxiety.interpretation}
                      </p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-5">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-bold text-purple-900 text-lg">Depresión</h4>
                        <span className="text-3xl font-bold text-purple-600">{questionnaireResults.had.scores.depression.score}</span>
                      </div>
                      <div className="mb-3 pb-3 border-b border-purple-200">
                        <p className="text-sm text-purple-700">
                          <strong>Nivel:</strong> {questionnaireResults.had.scores.depression.level}
                        </p>
                      </div>
                      <p className="text-xs text-purple-800 leading-relaxed">
                        {questionnaireResults.had.scores.depression.interpretation}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TFEQ */}
            {questionnaireResults.tfeq && (
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-white/20 rounded-lg p-2">
                      <Utensils className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">TFEQ-R18</h3>
                      <p className="text-green-100 text-sm">Comportamiento Alimentario</p>
                    </div>
                  </div>
                  <Thermometer level={getRiskLevel('tfeq')} />
                </div>
                <div className="p-6">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-green-50 rounded-lg p-5">
                      <h4 className="font-bold text-green-900 text-sm mb-3">Restricción Cognitiva</h4>
                      <div className="text-center mb-3">
                        <span className="text-4xl font-bold text-green-600">{questionnaireResults.tfeq.scores.cognitive.score}</span>
                      </div>
                      <p className="text-xs text-green-800 leading-relaxed">
                        {questionnaireResults.tfeq.scores.cognitive.interpretation}
                      </p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-5">
                      <h4 className="font-bold text-green-900 text-sm mb-3">Alimentación No Controlada</h4>
                      <div className="text-center mb-3">
                        <span className="text-4xl font-bold text-green-600">{questionnaireResults.tfeq.scores.uncontrolled.score}</span>
                      </div>
                      <p className="text-xs text-green-800 leading-relaxed">
                        {questionnaireResults.tfeq.scores.uncontrolled.interpretation}
                      </p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-5">
                      <h4 className="font-bold text-green-900 text-sm mb-3">Alimentación Emocional</h4>
                      <div className="text-center mb-3">
                        <span className="text-4xl font-bold text-green-600">{questionnaireResults.tfeq.scores.emotional.score}</span>
                      </div>
                      <p className="text-xs text-green-800 leading-relaxed">
                        {questionnaireResults.tfeq.scores.emotional.interpretation}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
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

  // Cuestionarios individuales
  if (step === 'stopbang') {
    return (
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
    );
  }

  if (step === 'had') {
    return (
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
    );
  }

  if (step === 'tfeq') {
    return (
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
    );
  }
};

export default QuestionnaireFlow;
