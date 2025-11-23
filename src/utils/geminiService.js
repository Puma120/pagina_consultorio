import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Servicio para interactuar con la API de Gemini AI
 * Evalúa la fuerza de agarre usando las tablas de referencia
 */

// Inicializar la API de Gemini
const initGeminiAPI = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error('API Key de Gemini no configurada. Por favor configura VITE_GEMINI_API_KEY en tu archivo .env');
    return null;
  }
  
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI;
};

/**
 * Evalúa la fuerza de agarre del paciente usando Gemini AI
 * @param {Object} patientData - Datos del paciente
 * @param {string} patientData.sexo - "male" o "female"
 * @param {number} patientData.edad - Edad del paciente
 * @param {number} patientData.estatura_m - Estatura en metros
 * @param {number} patientData.hgs_kg - Fuerza de agarre medida en kg
 * @param {Object} tablesData - JSON con las tablas de referencia
 * @returns {Promise<Object>} - Resultado de la evaluación
 */
export const evaluateHandGripStrength = async (patientData, tablesData) => {
  try {
    const genAI = initGeminiAPI();
    
    if (!genAI) {
      throw new Error('No se pudo inicializar la API de Gemini. Verifica tu API Key.');
    }

    // Usar el modelo Gemini 2.5 Flash (rápido, eficiente y con cuota disponible)
    const model = genAI.getGenerativeModel({ model: "gemini-3-pro-preview" });

    // Construir el prompt refinado
    const prompt = `Eres un asistente médico especializado en evaluación de fuerza de agarre. Dispones de las siguientes tablas de referencia científicas del estudio Tomkinson et al. 2025:

${JSON.stringify(tablesData, null, 2)}

**Datos del paciente:**
- Sexo: ${patientData.sexo}
- Edad: ${patientData.edad} años
- Estatura: ${patientData.estatura_m} metros
- Fuerza de agarre medida (HGS): ${patientData.hgs_kg} kg

**Tu tarea:**

1. **Identificar el rango de edad correcto**: Las edades están en intervalos de 5 años (20-24, 25-29, etc.). Encuentra el rango que corresponde a la edad del paciente.

2. **Calcular la fuerza normalizada**: Usa la fórmula:
   \`hgs_normalizada = hgs_kg / (estatura_m²)\`

3. **Determinar percentiles**:
   - Compara \`hgs_kg\` con la tabla \`absolute_strength\` del JSON
   - Compara \`hgs_normalizada\` con la tabla \`normalized_strength\` del JSON
   - Los percentiles en las tablas son: [5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95]
   - Si el valor está entre dos percentiles, realiza interpolación lineal:
     \`percentil = p_low + ((valor_paciente - v_low) / (v_high - v_low)) * (p_high - p_low)\`

4. **Clasificar según quintiles**:
   - < 20 → "Fuerza baja"
   - 20-39 → "Fuerza algo baja"
   - 40-59 → "Fuerza moderada"
   - 60-79 → "Fuerza algo alta"
   - ≥ 80 → "Fuerza alta"

5. **Generar interpretación**: Explica de forma clara y profesional qué significa el resultado comparado con la población mundial del estudio.

**IMPORTANTE**: Devuelve ÚNICAMENTE un JSON válido con esta estructura exacta (sin texto adicional antes o después):

{
  "input_data": {
    "sexo": "${patientData.sexo}",
    "edad": ${patientData.edad},
    "estatura_m": ${patientData.estatura_m},
    "hgs_kg": ${patientData.hgs_kg}
  },
  "hgs_normalizada": [número calculado],
  "percentil_absoluto": [número calculado],
  "percentil_normalizado": [número calculado],
  "clasificacion": "[clasificación según quintiles]",
  "interpretacion": "[texto explicativo detallado y profesional para un consultorio médico]"
}

No inventes valores. Usa exclusivamente los percentiles del JSON proporcionado.`;

    // Generar el resultado
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Limpiar la respuesta para extraer solo el JSON
    let jsonText = text.trim();
    
    // Remover markdown code blocks si existen
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/^```json\n/, '').replace(/\n```$/, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```\n/, '').replace(/\n```$/, '');
    }
    
    // Parsear el JSON
    const evaluation = JSON.parse(jsonText);
    
    return {
      success: true,
      data: evaluation
    };
    
  } catch (error) {
    console.error('Error al evaluar con Gemini:', error);
    
    // Si hay un error de parsing, intentar extraer el JSON de la respuesta
    if (error.message && error.message.includes('JSON')) {
      return {
        success: false,
        error: 'Error al procesar la respuesta de Gemini. Por favor intente nuevamente.',
        details: error.message
      };
    }
    
    return {
      success: false,
      error: 'Error al conectar con el servicio de evaluación. Verifica tu conexión a internet y la API Key.',
      details: error.message
    };
  }
};

/**
 * Valida que los datos del paciente sean correctos
 */
export const validatePatientData = (data) => {
  const errors = [];
  
  if (!data.sexo || (data.sexo !== 'male' && data.sexo !== 'female')) {
    errors.push('El sexo debe ser "male" o "female"');
  }
  
  if (!data.edad || data.edad < 20 || data.edad > 100) {
    errors.push('La edad debe estar entre 20 y 100 años');
  }
  
  if (!data.estatura_m || data.estatura_m < 1.0 || data.estatura_m > 2.5) {
    errors.push('La estatura debe estar entre 1.0 y 2.5 metros');
  }
  
  if (!data.hgs_kg || data.hgs_kg < 0 || data.hgs_kg > 150) {
    errors.push('La fuerza de agarre debe estar entre 0 y 150 kg');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};
