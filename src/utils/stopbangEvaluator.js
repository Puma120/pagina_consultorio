// src/utils/stopbangEvaluator.js

export function evaluateStopBang(answers) {
  const yesCount = Object.values(answers).filter(a => a === 'Yes').length;
  const bmi = answers['bmi'] === 'Yes';
  const gender = answers['gender'] === 'Yes'; // masculino
  const stopQuestions = ['snoring', 'tired', 'observed', 'pressure'];
  const stopYes = stopQuestions.filter(id => answers[id] === 'Yes').length;

  let level = 'Bajo';
  let reason = '';
  let interpretation = '';

  if (bmi) {
    if (yesCount >= 6) {
      level = 'Muy Alto';
      reason = 'IMC alto con 6 o más respuestas afirmativas';
      interpretation = 'Riesgo muy alto de apnea obstructiva del sueño (AOS). La combinación de IMC elevado con múltiples factores de riesgo (6 o más) indica alta probabilidad de AOS moderada a severa. Se recomienda enfáticamente evaluación urgente por especialista en medicina del sueño para realizar polisomnografía diagnóstica. La AOS no tratada puede causar hipertensión, arritmias cardíacas, accidentes cerebrovasculares, deterioro cognitivo y accidentes por somnolencia diurna excesiva. El tratamiento temprano con CPAP u otras intervenciones puede mejorar significativamente la calidad de vida y reducir riesgos cardiovasculares.';
    } else if (yesCount >= 4) {
      level = 'Alto';
      reason = 'IMC alto con 4-5 respuestas afirmativas';
      interpretation = 'Riesgo alto de apnea obstructiva del sueño (AOS). La presencia de IMC elevado junto con 4-5 factores de riesgo sugiere probabilidad significativa de AOS. Se recomienda evaluación prioritaria por especialista en medicina del sueño para estudio polisomnográfico. La AOS puede afectar la calidad del sueño, aumentar el riesgo cardiovascular y provocar somnolencia diurna que interfiere con actividades cotidianas. La detección y tratamiento tempranos son fundamentales para prevenir complicaciones a largo plazo.';
    } else {
      level = 'Bajo';
      reason = 'IMC alto pero menos de 4 respuestas afirmativas';
      interpretation = 'Riesgo bajo de apnea obstructiva del sueño (AOS). Aunque el IMC está elevado, la presencia de pocos factores de riesgo adicionales reduce la probabilidad de AOS significativa. Sin embargo, se recomienda mantener vigilancia sobre síntomas como ronquidos, pausas respiratorias observadas, somnolencia diurna o fatiga. El control del peso mediante dieta equilibrada y ejercicio regular puede reducir aún más el riesgo. Si los síntomas empeoran, considerar evaluación por especialista.';
    }
  } else {
    if (yesCount >= 5) {
      level = 'Muy Alto';
      reason = '5 o más respuestas afirmativas';
      interpretation = 'Riesgo muy alto de apnea obstructiva del sueño (AOS). La presencia de 5 o más factores de riesgo indica probabilidad muy elevada de AOS, posiblemente de severidad moderada a alta. Se recomienda urgentemente evaluación por especialista en medicina del sueño para realizar estudio polisomnográfico completo. La AOS no tratada se asocia con múltiples complicaciones: hipertensión arterial, insuficiencia cardíaca, arritmias, diabetes tipo 2, accidentes cerebrovasculares y deterioro cognitivo. El tratamiento adecuado puede revertir muchas de estas complicaciones y mejorar dramáticamente la calidad de vida.';
    } else if (stopYes >= 2 && gender && bmi) {
      level = 'Muy Alto';
      reason = '2 respuestas STOP + masculino + IMC alto';
      interpretation = 'Riesgo muy alto de apnea obstructiva del sueño (AOS). La combinación específica de síntomas cardinales STOP (ronquidos, fatiga, pausas observadas, presión arterial alta), género masculino e IMC elevado representa un perfil de alto riesgo para AOS severa. Se requiere evaluación urgente por especialista en medicina del sueño. Este perfil se asocia con mayor riesgo de complicaciones cardiovasculares y metabólicas. La intervención temprana es crucial.';
    } else if (stopYes >= 2 && gender) {
      level = 'Muy Alto';
      reason = '2 respuestas STOP + masculino';
      interpretation = 'Riesgo muy alto de apnea obstructiva del sueño (AOS). La presencia de síntomas STOP significativos junto con género masculino constituye un perfil de riesgo elevado. Los hombres tienen mayor prevalencia de AOS, especialmente cuando presentan ronquidos, pausas respiratorias observadas, cansancio diurno o hipertensión. Se recomienda evaluación prioritaria por especialista en medicina del sueño para estudio diagnóstico completo y posible inicio de tratamiento con CPAP u otras modalidades terapéuticas.';
    } else if (yesCount >= 3) {
      level = 'Alto';
      reason = '3-4 respuestas afirmativas';
      interpretation = 'Riesgo alto de apnea obstructiva del sueño (AOS). La presencia de 3-4 factores de riesgo sugiere probabilidad significativa de AOS que requiere evaluación profesional. Se recomienda consulta con especialista en medicina del sueño para valoración clínica y posible estudio polisomnográfico. Los síntomas pueden afectar la calidad de vida, el desempeño laboral y aumentar el riesgo de accidentes. El diagnóstico y tratamiento oportunos pueden mejorar sustancialmente el bienestar general y prevenir complicaciones cardiovasculares.';
    } else {
      level = 'Bajo';
      reason = '0-2 respuestas afirmativas';
      interpretation = 'Riesgo bajo de apnea obstructiva del sueño (AOS). Con pocos factores de riesgo presentes, la probabilidad de AOS es baja. Sin embargo, es importante mantener hábitos saludables: mantener peso adecuado, evitar alcohol antes de dormir, dormir de lado en lugar de boca arriba, y mantener buena higiene del sueño. Si aparecen síntomas nuevos como ronquidos intensos, pausas respiratorias, somnolencia diurna excesiva o fatiga persistente, se recomienda reevaluación. La prevención mediante estilo de vida saludable es fundamental.';
    }
  }

  return {
    score: yesCount,
    riskLevel: level,
    reason,
    interpretation
  };
}

