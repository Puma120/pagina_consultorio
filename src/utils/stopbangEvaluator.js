// src/utils/stopbangEvaluator.js

export function evaluateStopBang(answers) {
  const yesCount = Object.values(answers).filter(a => a === 'Yes').length;
  const bmi = answers['bmi'] === 'Yes';
  const gender = answers['gender'] === 'Yes'; // masculino
  const stopQuestions = ['snoring', 'tired', 'observed', 'pressure'];
  const stopYes = stopQuestions.filter(id => answers[id] === 'Yes').length;

  let level = 'Bajo';
  let reason = '';

  if (bmi) {
    if (yesCount >= 6) {
      level = 'Muy Alto';
      reason = 'IMC alto con 6 o más respuestas afirmativas';
    } else if (yesCount >= 4) {
      level = 'Alto';
      reason = 'IMC alto con 4-5 respuestas afirmativas';
    } else {
      level = 'Bajo';
      reason = 'IMC alto pero menos de 4 respuestas afirmativas';
    }
  } else {
    if (yesCount >= 5) {
      level = 'Muy Alto';
      reason = '5 o más respuestas afirmativas';
    } else if (stopYes >= 2 && gender && bmi) {
      level = 'Muy Alto';
      reason = '2 respuestas STOP + masculino + IMC alto';
    } else if (stopYes >= 2 && gender) {
      level = 'Muy Alto';
      reason = '2 respuestas STOP + masculino';
    } else if (yesCount >= 3) {
      level = 'Alto';
      reason = '3-4 respuestas afirmativas';
    } else {
      level = 'Bajo';
      reason = '0-2 respuestas afirmativas';
    }
  }

  return {
    score: yesCount,
    riskLevel: level,
    reason
  };
}
