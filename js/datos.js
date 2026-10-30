/*
 * DATOS Y DISPONIBILIDAD — Dr. Jovanni Camacho Santana
 * Para editar sedes, días y horas sin programar: abre admin/agenda.html
 * en tu computadora, realiza cambios, descarga datos.js y reemplaza
 * js/datos.js en tu servidor. No publiques la carpeta admin.
 *
 * IMPORTANTE: una cita no queda confirmada desde esta tarjeta.
 * Solo se envía una SOLICITUD por WhatsApp; confirma por ese medio.
 */
window.DATOS_SITIO = {
  medico: {
    nombre: 'Dr. Jovanni Camacho Santana',
    titulo: 'Nefrólogo · Internista',
    especialidades: ['Nefrología diagnóstica e intervencionista', 'Nefrología'],
    lema: 'Atención renal con ciencia, precisión y cercanía.',
    biografia: [
      'Soy médico especialista en el diagnóstico y tratamiento oportuno de las enfermedades renales, hemodiálisis, diálisis peritoneal y el trasplante renal.',
      'Cuento con experiencia en la realización de biopsia renal, así como colocación de catéteres para hemodiálisis y diálisis peritoneal, todos ellos procedimientos guiados por ultrasonido, dando seguridad y certeza al paciente en cada procedimiento.',
      'Mi visión es la de un abordaje y manejo integral multidisciplinario de la enfermedad renal. Cuento con el apoyo de colegas profesionales en las áreas de nutrición renal y enfermería especializada en nefrología. Dicha atención podrá cubrirla por completo en nuestras instalaciones.'
    ],
    foto: 'img/JCS.png',
    telefono: '', // Ejemplo: 5512345678. Se muestra el botón Llamar cuando esté configurado.
    whatsapp: '', // Ejemplo: 525512345678. Se habilita solicitar cita cuando esté configurado.
    email: '',
    cedula: '' // Opcional: agrega la(s) cédula(s) cuando las verifiques.
  },
  servicios: [
    { id: 'visita-nefrologia', titulo: 'Visita Nefrología', categoria: 'Nefrología', detalle: 'Atención y seguimiento nefrológico. Consulta las condiciones de la visita con el consultorio.' },
    { id: 'abordaje', titulo: 'Abordaje', categoria: 'Nefrología', detalle: 'Valoración del caso y orientación sobre el abordaje adecuado según las necesidades individuales.' },
    { id: 'biopsia-renal', titulo: 'Biopsia renal percutánea', categoria: 'Procedimientos', detalle: 'Valoración para biopsia renal percutánea. El médico explicará indicaciones, preparación y cuidados.' },
    { id: 'colocacion-percutanea', titulo: 'Colocación percutánea de catéter para hemodiálisis', categoria: 'Procedimientos', detalle: 'Valoración para colocación percutánea de acceso para hemodiálisis, cuando esté indicada.' },
    { id: 'consulta-nefrologia', titulo: 'Consulta Nefrología', categoria: 'Consultas', detalle: 'Evaluación especializada de la salud renal, diagnóstico y seguimiento de enfermedades del riñón.' },
    { id: 'dialisis-peritoneal', titulo: 'Diálisis peritoneal', categoria: 'Terapias renales', detalle: 'Orientación y seguimiento para pacientes en tratamiento de diálisis peritoneal.' },
    { id: 'hemodialisis', titulo: 'Hemodiálisis', categoria: 'Terapias renales', detalle: 'Valoración y seguimiento médico relacionados con el tratamiento de hemodiálisis.' },
    { id: 'medicina-interna', titulo: 'Medicina interna', categoria: 'Medicina interna', detalle: 'Atención integral de padecimientos del adulto desde el enfoque de medicina interna.' },
    { id: 'cateter-hemodialisis', titulo: 'Colocación de catéter para hemodiálisis', categoria: 'Procedimientos', detalle: 'Evaluación del acceso vascular y del procedimiento de colocación de catéter para hemodiálisis.' },
    { id: 'cateter-peritoneal', titulo: 'Colocación de catéter peritoneal permanente', categoria: 'Procedimientos', detalle: 'Valoración y orientación sobre colocación de catéter para diálisis peritoneal.' },
    { id: 'consulta-interna', titulo: 'Consulta de medicina interna', categoria: 'Consultas', detalle: 'Consulta médica integral para personas adultas, con evaluación y seguimiento según el caso.' },
    { id: 'dialisis-automatizada', titulo: 'Diálisis peritoneal automatizada', categoria: 'Terapias renales', detalle: 'Evaluación y seguimiento de la terapia de diálisis peritoneal automatizada.' },
    { id: 'tcrr', titulo: 'Terapia de reemplazo renal lenta continua (TCRR)', categoria: 'Terapias renales', detalle: 'Valoración especializada relacionada con terapia de reemplazo renal continua.' },
    { id: 'trasplante', titulo: 'Trasplante renal', categoria: 'Nefrología', detalle: 'Orientación y seguimiento nefrológico relacionados con trasplante renal.' },
    { id: 'prequirurgica', titulo: 'Valoración prequirúrgica', categoria: 'Medicina interna', detalle: 'Evaluación médica previa a una intervención quirúrgica, según el contexto clínico.' },
    { id: 'visita-interna', titulo: 'Visita Medicina Interna', categoria: 'Medicina interna', detalle: 'Visita médica y seguimiento de medicina interna. Consulta las condiciones con el consultorio.' },
    { id: 'implantacion-cateter', titulo: 'Implantación de catéter', categoria: 'Procedimientos', detalle: 'Información y valoración sobre la implantación de catéter conforme al caso del paciente.' }
  ],
  sedes: [
    { id: 'xochimilco', nombre: 'Médica Xochimilco', zona: 'Xochimilco', direccion: 'Av. Guadalupe I. Ramírez, El Rosario, Ciudad de México', agenda: {} },
    { id: 'star-pedregal', nombre: 'Hospital Star Médica Pedregal', zona: 'Pedregal', direccion: 'Av. Insurgentes Sur 3500, Ciudad de México', agenda: {} },
    { id: 'nezahualcoyotl', nombre: 'Hospital Vivo Jardín Bicentenario', zona: 'Nezahualcóyotl', direccion: 'Av. Bordo de Xochiaca, Nezahualcóyotl, Estado de México', agenda: {} },
    { id: 'angeles-pedregal', nombre: 'Hospital Ángeles Pedregal', zona: 'Pedregal', direccion: 'Camino Santa Teresa 1055-S, Ciudad de México', agenda: {} }
  ]
};
