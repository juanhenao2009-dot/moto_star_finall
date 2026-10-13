/* Motor de diagnóstico por palabras clave (lo usan index y dashboard) */
const REGLAS = [
    { sintomaClave: 'encender / prende / arranque / batería / frío', urgencia: 'Media', nivel: 'media',
      keys: ['encender', 'prende', 'arranc', 'bateria', 'batería', 'frío', 'frio'],
      titulo: 'Falla en Sistema de Encendido / Carga o Carburación',
      causa: 'Batería con baja tensión, bujía desgastada o desajuste de aire en el carburador.',
      cuerpo: 'Se detecta dificultad en el inicio del ciclo de combustión. Esto suele estar asociado a baja tensión en la batería, bujía desgastada/sulfatada o desajuste en el aire del carburador/cuerpo de aceleración.',
      solucion: '1. Verificar voltaje de batería en frío (mínimo 12.4V).\n2. Inspeccionar o reemplazar bujía (calibración de luz a 0.7mm).\n3. Limpieza y ajuste de la aguja del carburador o sensor IAC.' },
    { sintomaClave: 'aceite / humo / presión / fuga', urgencia: 'Alta', nivel: 'alta',
      keys: ['aceite', 'humo', 'presion', 'presión', 'fuga'],
      titulo: 'Alerta en Sistema de Lubricación / Cilindro',
      causa: 'Presión o nivel de aceite anormal; posible desgaste de anillos o sellos de válvula.',
      cuerpo: 'Anomalía en la presión o nivel de lubricante en el cárter. Si presenta humo blanco/azul, puede haber desgaste en anillos del pistón o sellos de válvula.',
      solucion: '1. Detener el motor si el testigo de aceite está encendido.\n2. Verifique la mirilla del cárter y complete con viscosidad adecuada (ej. 20W-50 / 10W-40 según manual).\n3. Inspeccionar el filtro de aceite y empaques por fugas.' },
    { sintomaClave: 'freno / chilla / disco / pastilla', urgencia: 'Alta', nivel: 'alta',
      keys: ['freno', 'chilla', 'disco', 'pastilla'],
      titulo: 'Sistema de Frenado Requiere Mantenimiento',
      causa: 'Pastillas gastadas, disco contaminado o líquido de frenos degradado.',
      cuerpo: 'Fricción irregular o degradación del fluido hidráulico. Cristalización de pastillas o desgaste cerca del límite de seguridad.',
      solucion: '1. Revisar grosor de pastillas (mínimo 2mm de pasta restante).\n2. Limpiar el disco con limpiafrenos para eliminar residuos de grasa.\n3. Purgar el líquido de frenos DOT4 si la maneta se siente esponjosa.' },
    { sintomaClave: 'tiembla / cadena / ruido / acelerar', urgencia: 'Media', nivel: 'media',
      keys: ['tiembla', 'cadena', 'ruido', 'aceler'],
      titulo: 'Holgura en Kit de Arrastre o Desajuste Mecánico',
      causa: 'Cadena destensada, piñón gastado o rodamientos desbalanceados.',
      cuerpo: 'Vibraciones anómalas o tirones en la aceleración originados por destensión en la cadena, piñón gastado o desbalance en los rodamientos.',
      solucion: '1. Tensionar la cadena dejando una holgura de 20-30 mm.\n2. Limpiar y lubricar con grasa/spray especializado para cadena.\n3. Inspeccionar dientes de la catalina y piñón de ataque.' }
];

const REGLA_POR_DEFECTO = {
    urgencia: 'Evaluativa', nivel: 'info',
    titulo: 'Análisis de Telemetría Registrado',
    cuerpo: 'Los síntomas descritos requieren una revisión física complementaria o escaneo mediante puerto OBD2 para corroborar sensores del motor.',
    solucion: '1. Realizar un escaneo de códigos de falla DTC en taller.\n2. Inspeccionar niveles generales de fluidos y conexiones eléctricas.'
};

function diagnosticar(sintoma) {
    const s = (sintoma || '').toLowerCase();
    return REGLAS.find(r => r.keys.some(k => s.includes(k))) || REGLA_POR_DEFECTO;
}

const COLORES_URGENCIA = {
    alta:  { color: '#dc2626', bg: '#fee2e2' },
    media: { color: '#d97706', bg: '#fef3c7' },
    info:  { color: '#2563eb', bg: '#dbeafe' }
};
