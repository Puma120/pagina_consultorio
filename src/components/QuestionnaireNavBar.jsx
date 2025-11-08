import React from 'react';
import { Home } from 'lucide-react';

const QuestionnaireNavBar = ({
  icon: Icon,
  title,
  subtitle,
  iconBgColor = 'bg-blue-100',
  iconColor = 'text-blue-600',
  accessibilityMode,
  onToggleAccessibility,
  onGoHome,
  accessibilityBgColor = 'bg-blue-100',
  accessibilityTextColor = 'text-blue-700'
}) => {
  return (
    <div className="fixed top-0 left-0 w-full z-50 bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo y Título */}
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 ${iconBgColor} rounded-full flex items-center justify-center`}>
              <Icon className={`w-5 h-5 ${iconColor}`} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-800">{title}</h1>
              <p className="text-xs text-gray-500">{subtitle}</p>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex items-center gap-2">
            {/* Botón de accesibilidad */}
            <button
              onClick={onToggleAccessibility}
              className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 font-semibold text-sm shadow-sm ${
                accessibilityMode 
                  ? `${accessibilityBgColor} ${accessibilityTextColor}` 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              title="Activar/desactivar accesibilidad"
            >
              <img
                src="/1-a4575525.png"
                alt="Accesibilidad"
                className="h-5 w-5 object-contain"
                style={{ 
                  filter: accessibilityMode ? 'grayscale(0%)' : 'grayscale(60%)', 
                  opacity: accessibilityMode ? 1 : 0.7 
                }}
              />
              <span className="hidden sm:inline text-sm">
                {accessibilityMode ? 'Accesibilidad ON' : 'Accesibilidad OFF'}
              </span>
            </button>

            {/* Botón volver al inicio */}
            {onGoHome && (
              <button
                onClick={onGoHome}
                className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all duration-300 font-semibold text-sm shadow-sm"
              >
                <Home className="w-5 h-5" />
                <span className="hidden sm:inline">Inicio</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionnaireNavBar;
