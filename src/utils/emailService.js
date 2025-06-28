import emailjs from '@emailjs/browser';

// Configuración de EmailJS
const EMAILJS_CONFIG = {
  SERVICE_ID: 'service_1von8vz',
  TEMPLATE_ID: 'template_oa0gwgm', 
  PUBLIC_KEY: '9ASHY49fDgKmq-_JP'
};

// Inicializar EmailJS
emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);

export const sendEmailWithAttachment = async (templateParams) => {
  try {
    // Log para debug
    console.log('Sending email with params:', templateParams);
    
    // Remover el archivo adjunto ya que nos enfocamos en el contenido legible
    if (templateParams.csv_attachment) {
      delete templateParams.csv_attachment;
      console.log('Removed CSV attachment - focusing on readable content');
    }
    
    // Enviar usando el método estándar de EmailJS
    const response = await emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      EMAILJS_CONFIG.TEMPLATE_ID,
      templateParams
    );
    
    console.log('Email sent successfully:', response);
    return { success: true, response };
    
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
};

// Función para crear archivo CSV como adjunto para EmailJS
export const createCSVAttachment = (csvString, filename) => {
  // Crear un blob con el contenido CSV
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  
  // Crear un File object que EmailJS puede manejar
  const file = new File([blob], filename, { type: 'text/csv' });
  
  return file;
};

// Función alternativa para crear CSV con BOM (para mejor compatibilidad con Excel)
export const createCSVWithBOM = (csvString, filename) => {
  // BOM para UTF-8 que ayuda a Excel a reconocer la codificación
  const BOM = '\uFEFF';
  const csvWithBOM = BOM + csvString;
  
  const blob = new Blob([csvWithBOM], { type: 'text/csv;charset=utf-8;' });
  const file = new File([blob], filename, { type: 'text/csv' });
  
  return file;
};

// Función para descargar CSV localmente (como respaldo)
export const downloadCSV = (csvString, filename) => {
  const BOM = '\uFEFF';
  const csvWithBOM = BOM + csvString;
  const blob = new Blob([csvWithBOM], { type: 'text/csv;charset=utf-8;' });
  
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Función para generar los datos del CSV como string
export const generateCSVString = (data) => {
  const headers = Object.keys(data).join(',');
  const values = Object.values(data).map(value => 
    typeof value === 'string' && value.includes(',') ? `"${value}"` : value
  ).join(',');
  return `${headers}\n${values}`;
};

// Función para convertir CSV a base64 para adjuntar
export const csvToBase64 = (csvString, filename) => {
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(',')[1];
      resolve({
        content: base64,
        filename: filename,
        type: 'text/csv'
      });
    };
    reader.readAsDataURL(blob);
  });
};
