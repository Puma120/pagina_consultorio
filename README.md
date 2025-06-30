# Panel de Evaluación Médica

Sistema de cuestionarios médicos interactivos con funcionalidad de descarga y envío por correo electrónico.

## Características

### Cuestionarios Disponibles:
- **HAD** - Escala Hospitalaria de Ansiedad y Depresión
- **STOP-Bang** - Evaluación de riesgo de apnea del sueño
- **TFEQ-R18** - Inventario de Alimentación de Tres Factores

### Funcionalidades:
- ✅ Interfaz moderna y responsiva
- ✅ Modo de accesibilidad con síntesis de voz
- ✅ Descarga de resultados en formato CSV
- ✅ **Envío de resultados por correo electrónico** (EmailJS)
- ✅ **Datos completamente legibles para médicos** - sin archivos técnicos
- ✅ **Presentación profesional de todas las respuestas** en formato tabla
- ✅ Evaluación automática con interpretación de resultados
- ✅ Información del paciente personalizada
- ✅ Envío directo sin formularios adicionales

## Instalación

```bash
npm install
```

## Configuración de EmailJS

Para habilitar el envío por correo electrónico, sigue los pasos en el archivo `EMAIL_SETUP.md`.

## Desarrollo

```bash
npm run dev
```

## Construcción

```bash
npm run build
```

## Tecnologías

- React 19
- Vite
- Tailwind CSS
- Lucide React (iconos)
- EmailJS (envío de correos)

## Estructura de Archivos

```
src/
├── components/           # Componentes de los cuestionarios
├── utils/               # Utilidades (CSV, EmailJS, evaluadores)
├── templates/           # Plantillas HTML para correos
└── assets/             # Recursos estáticos
```
