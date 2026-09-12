/**
 * Contenido por defecto y catálogos de Puente UCI.
 * El contenido (FAQ, etapas, videos, config) se reemplaza en tiempo de ejecución por el de la
 * planilla (acción getContent); estos valores sirven como respaldo sin conexión y como semilla.
 * Los catálogos (chips, vínculos, emojis) son la única fuente de verdad para onboarding, panel
 * lateral y ficha: el prototipo usaba etiquetas distintas en cada lugar.
 */
export const FAQ_DATA = {
  "Las etapas UCI": [
    { tag:"🔴", q: "¿Qué es la Etapa Aguda?", a: "Es el momento más crítico desde que tu familiar ingresó a la UCI. Su cuerpo necesita ayuda para funciones básicas como respirar, mantener la presión arterial o proteger sus órganos. El equipo trabaja de forma intensiva con medicamentos, máquinas y monitoreo continuo las 24 horas.\n\nEs normal que en esta etapa tu familiar esté dormido o sedado — no es que esté inconsciente sin sentir nada, sino que su cuerpo necesita toda su energía para recuperarse. La sedación es un cuidado, no una señal de alarma." },
    { tag:"🟡", q: "¿Qué significa que está en Estabilización?", a: "Es una buena señal. Quiere decir que lo más crítico ya pasó y que el cuerpo de tu familiar está respondiendo al tratamiento. Los valores del monitor empiezan a normalizarse y el equipo puede ir reduciendo algunos medicamentos o ajustando el soporte.\n\nTu familiar puede comenzar a abrir los ojos, reaccionar a tu voz o mostrar pequeñas señales de mejoría. El camino no siempre es una línea recta — puede haber días mejores y días más difíciles, y eso es completamente normal." },
    { tag:"🟠", q: "¿Qué es el Destete o Weaning?", a: "Es una palabra técnica que simplemente significa: enseñarle al cuerpo a respirar solo de nuevo.\n\nCuando alguien ha necesitado una máquina para respirar (ventilador mecánico), los músculos respiratorios pueden haberse debilitado. El destete es el proceso gradual y controlado de ir retirando ese apoyo poco a poco, haciendo pruebas diarias para ver si tu familiar puede mantener la respiración por su cuenta.\n\nEs como aprender a caminar después de una lesión: requiere tiempo y paciencia. Si hay un día de retroceso, no significa que algo salió mal — el equipo simplemente ajusta el ritmo según cómo responde tu familiar ese día." },
    { tag:"🟢", q: "¿Qué pasa en la Pre-Alta UCI?", a: "Tu familiar ya no necesita el nivel de cuidado intensivo de la UCI. Esta etapa es la preparación para el traslado a una sala de hospitalización normal, donde el equipo de enfermería seguirá cuidándolo con menos máquinas y más autonomía.\n\nEl equipo de la UCI coordinará toda la información con los profesionales que lo recibirán. También es el momento para que la familia empiece a prepararse: qué cuidados puede necesitar en casa, qué medicamentos tomará y a qué controles deberá asistir." },
  ],
  "Comunicación": [
    { q: "¿Puedo hablarle a mi familiar?", a: "Sí. Aunque esté dormido, sedado o conectado a equipos, hablarle con calma y tocarle suavemente puede ser reconfortante. Explícale quién eres y que estás allí. Si tienes dudas sobre cómo hacerlo, el equipo puede orientarte." },
    { q: "¿Mi familiar me escucha?", a: "En muchos casos, incluso cuando la persona parece dormida, puede percibir voces o estímulos. Por eso es importante hablarle con tranquilidad y cariño. Si tienes dudas sobre su nivel de conciencia, consúltalo con el equipo." },
    { q: "¿Podemos llevarle música?", a: "En algunas situaciones sí es posible, especialmente si la música le resulta significativa. Antes de traer dispositivos, pregunta al equipo para asegurarte de que no interfiera con los cuidados." },
  ],
  "Conciencia y Memoria": [
    { q: "¿Por qué no recuerda lo que le pasó?", a: "La enfermedad grave, los medicamentos y el estrés pueden afectar la memoria temporalmente. Es frecuente que existan 'lagunas' de recuerdo. Con el tiempo, muchas personas recuperan parte de la memoria." },
    { q: "¿Es normal que esté desorientado/a?", a: "Sí. La desorientación o confusión es frecuente en UCI y puede deberse a la enfermedad, medicamentos o al entorno. Generalmente es transitoria, pero el equipo la vigila activamente." },
    { q: "¿Por qué está contenido/a a la cama?", a: "Las contenciones se usan solo cuando es necesario para evitar que la persona se haga daño o retire dispositivos importantes. No son un castigo. Se revisan constantemente y se retiran cuando es seguro hacerlo." },
  ],
  "Procedimientos": [
    { q: "¿Qué son los elementos invasivos?", a: "Son dispositivos que ayudan a mantener funciones vitales, como tubos para respirar, sondas o catéteres. Aunque pueden impresionar, cumplen una función muy importante en el tratamiento." },
    { q: "¿Mi familiar se está alimentando?", a: "En UCI la alimentación suele administrarse de manera especial (por sonda o vía intravenosa). Por seguridad, no se debe ofrecer comida sin indicación médica. Consulta siempre antes de traer alimentos." },
    { q: "¿Necesita ir al baño?", a: "No. El equipo controla la eliminación mediante sondas o dispositivos especiales. Esto permite mantener higiene y monitoreo adecuados." },
  ],
  "Alarmas y Seguridad": [
    { q: "Si suena una alarma, ¿debo avisar?", a: "Las alarmas forman parte del monitoreo continuo. Muchas veces el equipo ya está al tanto. Si te genera inquietud, puedes avisar con tranquilidad, pero no es necesario alarmarse." },
    { q: "¿Por qué usar elementos de protección (EPP)?", a: "El uso de EPP protege tanto a los pacientes como a los visitantes frente a infecciones. Es una medida de cuidado mutuo." },
    { q: "¿Puedo tocar a otro paciente con EPP?", a: "No. Aunque uses protección, cada paciente requiere cuidados individuales. Es importante limitar el contacto solo a tu familiar." },
  ],
};

const JOURNEY_STEPS_RAW = [
  { id: 1, label: "Etapa Aguda", sub: "Fase crítica inicial", desc: "Tu familiar ingresó a la UCI en su fase más crítica. El equipo trabaja para estabilizar sus funciones vitales: respiración, presión arterial, función del corazón y otros órganos. Es el período de mayor intervención y monitoreo continuo.", state: "done" },
  { id: 2, label: "Estabilización", sub: "Mejoría progresiva", desc: "Los signos vitales comienzan a estabilizarse. El equipo mantiene el soporte pero ya se observan señales de mejora. Tu familiar puede estar más reactivo o comenzar a abrir los ojos.", state: "done" },
  { id: 3, label: "Destete (Weaning)", sub: "Aquí estamos hoy", desc: "El destete o weaning es el proceso gradual de reducir el apoyo del ventilador mecánico para que tu familiar recupere su propia capacidad de respirar. Es una etapa delicada: se hacen pruebas diarias de respiración espontánea, siempre con supervisión. No siempre es lineal — puede haber días de avance y días de pausa, y eso es completamente normal.", state: "current" },
  { id: 4, label: "Pre-Alta UCI", sub: "Preparando la transición", desc: "Tu familiar ya no necesita el nivel de soporte intensivo. El equipo prepara su traslado a una sala de menor complejidad. Se coordinan los cuidados continuos, el plan de medicamentos y la información para el equipo que lo recibirá.", state: "future" },
];

const VIDEOS_RAW = [
  { emoji: "💊", title: "¿Qué significa que esté sedado/a?", desc: "Explicamos qué son los sedantes y por qué se usan", dur: "2:30" },
  { emoji: "🗣️", title: "¿Por qué no puede hablar?", desc: "El tubo endotraqueal y la comunicación alternativa", dur: "3:15" },
  { emoji: "🫀", title: "¿Qué es la diálisis?", desc: "Cómo funciona el riñón artificial y para qué sirve", dur: "4:00" },
  { emoji: "🫁", title: "¿Para qué sirve el ventilador mecánico?", desc: "La ventilación mecánica explicada paso a paso", dur: "3:45" },
  { emoji: "🧠", title: "¿Qué es el delirium?", desc: "Confusión en UCI: causas, señales y manejo", dur: "2:50" },
  { emoji: "🩺", title: "¿Qué es una traqueostomía?", desc: "Cuándo se hace y cómo ayuda a la recuperación", dur: "3:20" },
];

export const CHECKLIST_ITEMS = ["Shampoo", "Jabón de baño", "Crema corporal", "Cepillo de dientes", "Pasta dental", "Pijama de 2 piezas", "Pantuflas"];

// Las etapas no traen estado fijo: el estado (done/current/future) se calcula desde `etapa` (1–4) del backend.
export const JOURNEY_STEPS = JOURNEY_STEPS_RAW.map(({ state, ...s }) => s);
export const STAGE_SHORT = ["Etapa Aguda", "Estabiliz.", "Destete", "Pre-Alta UCI"];

// Los videos aceptan una URL (YouTube) que el equipo completa en la hoja Videos.
export const VIDEOS = VIDEOS_RAW.map((v) => ({ ...v, url: "" }));

export const CONFIG_DEFAULTS = {
  nombre_unidad: "Unidad de Cuidados Intensivos",
  horario_visitas: "14:00 – 16:00 hrs",
  sala: "Sala UCI — Piso 4",
  sala_detalle: "Al llegar, identifícate en el mesón de enfermería. Recuerda usar los elementos de protección (EPP) que te entreguen.",
  hora_informe: "11:00 hrs",
  informe_detalle: "Solo puede asistir un familiar directo por día.",
  telefono_uci: "+56 2 2000 0000",
  consejo_dia: "Hablarle a tu familiar, aunque parezca dormido, puede ser reconfortante. Las palabras de amor llegan aunque los ojos estén cerrados.",
  grupo_apoyo: "Grupos de apoyo a familias · Cada jueves 18 hrs",
  linea_escucha: "Línea de escucha 24/7 · Fono Salud Mental: 600 360 7777",
};

export const TEAM_ROLES = [
  { r: "Médico/a tratante", d: "Lidera el diagnóstico y plan de tratamiento. Informa a la hora indicada en Información útil." },
  { r: "Enfermero/a", d: "Cuidado directo y continuo. Tu principal punto de contacto en la UCI." },
  { r: "Kinesiólogo/a", d: "Manejo respiratorio y movilización progresiva del paciente." },
  { r: "TENS", d: "Apoyo en cuidados básicos: higiene, posición, confort." },
  { r: "Psicólogo/a", d: "Apoyo emocional para el paciente y la familia." },
  { r: "Trabajador/a Social", d: "Orientación en recursos, trámites y red de apoyo familiar." },
];

export const EOL_CARDS = [
  { icon: "💊", title: "Manejo del dolor", color: "#FFF0F0", border: "#FFD0D0", desc: "Nos aseguramos que tu familiar esté cómodo. El equipo evalúa y trata el dolor de forma continua. El objetivo es garantizar su bienestar y dignidad en todo momento." },
  { icon: "🙏", title: "Apoyo espiritual", color: "#F5F0FF", border: "#DDD0FF", desc: "Respetamos profundamente las creencias de cada persona. Puedes solicitar acompañamiento espiritual o religioso en cualquier momento, independientemente de la fe o creencia." },
  { icon: "💙", title: "Acompañamiento en el duelo", color: "#F0F7FF", border: "#C0D8FF", desc: "El duelo puede comenzar antes de la pérdida. El equipo de psicología y trabajo social está disponible para ti y tu familia. No tienes que atravesar este proceso solo/a." },
];

export const POST_STEPS = [
  { n: "1", icon: "🏥", title: "Traslado a sala general", desc: "Cuando la condición se estabiliza, tu familiar será trasladado a un servicio de menor complejidad. Habrá menos máquinas y más autonomía. El equipo de la UCI entregará toda la información al equipo que lo recibirá." },
  { n: "2", icon: "💪", title: "Rehabilitación", desc: "Es frecuente necesitar rehabilitación física, respiratoria, cognitiva o del habla tras una estadía en UCI. El equipo de kinesiología y terapia ocupacional diseñará un plan personalizado." },
  { n: "3", icon: "📋", title: "Planificación del alta hospitalaria", desc: "El equipo preparará un plan de cuidados para el hogar con instrucciones claras: medicamentos, curaciones, signos de alarma y a qué servicio acudir si es necesario." },
  { n: "4", icon: "🩺", title: "Seguimiento ambulatorio", desc: "El alta hospitalaria no es el fin del cuidado. Habrá controles médicos programados y apoyo profesional según las necesidades específicas de tu familiar." },
];

// ── Catálogos (única fuente de verdad) ────────────────────────────────────────
export const CATALOG = {
  music:  ["Cumbia", "Bolero", "Salsa", "Rock", "Pop", "Baladas", "Clásica", "Folklore", "Reggaetón", "Religiosa"],
  sport:  ["Caminar", "Fútbol", "Natación", "Ciclismo", "Gimnasio", "Baile", "Yoga / Pilates", "No practica"],
  daily:  ["Leer", "Ver TV / Series", "Cocinar", "Jardín / Plantas", "Artesanías", "Juegos de mesa", "Pesca", "Tejido / Bordado", "Carpintería", "Voluntariado"],
  social: ["Muy sociable", "Le gusta la tranquilidad", "Activo en su comunidad", "Práctica religiosa regular", "Reuniones familiares frecuentes", "Tiene mascotas"],
  devices: ["Lentes 👓", "Audífonos 🦻", "Bastón 🦯", "Andador 🚶", "Silla de ruedas ♿", "Prótesis dental 🦷", "Marcapasos 🫀", "No utiliza ninguna ✓"],
  livesWith: ["Solo/a", "Con pareja", "Con hijos", "Con padres", "Con hermanos", "Con nietos", "Con cuidador/a", "En hogar de adulto mayor"],
  education: ["Básica", "Media", "Técnica", "Universitaria", "Postgrado"],
  zonas: ["Urbana", "Rural"],
  vinculos: ["Papá", "Mamá", "Hermano", "Hermana", "Pareja", "Esposo/a", "Hijo", "Hija", "Abuelo", "Abuela", "Tío/a", "Sobrino/a", "Nieto/a", "Amigo/a cercano/a", "Otro"],
  emojis: ["👨", "👩", "🧑", "👴", "👵", "🧒", "👦", "👧", "💑", "👶", "🐾", "👱", "🧔", "👩‍🦳", "👨‍🦳"],
  patientEmojis: ["🙂", "👨", "👩", "🧑", "👴", "👵", "🧔", "👩‍🦳", "👨‍🦳", "👱"],
};

// Etiquetas de personalizado: se guardan dentro de `hobbies` con prefijo [cat] para no cambiar el modelo del prototipo.
export const CUSTOM_PREFIX = { music: "[music]", sport: "[sport]", daily: "[daily]", social: "[social]" };

export const DEFAULT_TREE = [
  { id: "pat",  label: "", role: "",          gen: 1, col: 2, emoji: "🙂", photo: null, fixed: true },
  { id: "pap",  label: "", role: "Papá",      gen: 0, col: 0, emoji: "👨", photo: null, fixed: false },
  { id: "mam",  label: "", role: "Mamá",      gen: 0, col: 1, emoji: "👩", photo: null, fixed: false },
  { id: "par",  label: "", role: "Pareja",    gen: 1, col: 0, emoji: "💑", photo: null, fixed: false },
  { id: "sib1", label: "", role: "Hermano/a", gen: 1, col: 3, emoji: "🧑", photo: null, fixed: false },
  { id: "hij1", label: "", role: "Hijo/a",    gen: 2, col: 0, emoji: "🧒", photo: null, fixed: false },
  { id: "hij2", label: "", role: "Hijo/a",    gen: 2, col: 1, emoji: "🧒", photo: null, fixed: false },
];

export const EMPTY_FORM = {
  famName: "", famPhone: "",
  patName: "", patNick: "", patJob: "",
  education: "", living: "", religion: "",
  hobbies: [], extra: "",
  musicCustom: "", musicExtra: "",
  sportCustom: "", dailyCustom: "",
  helpDevices: [],
  idCardApproved: false,
  livesWith: [], livesWhere: "", zonaType: "",
  familyMessage: "",
};
