/* Explika · banco de ideas de temas por categoría.
   Para añadir una categoría, agrega una entrada más; para añadir ideas, suma líneas a la lista.
   Las ideas son títulos que explican un mecanismo ("cómo funciona", "por qué pasa") y se pueden mostrar con las piezas de la biblioteca. */
(function(){
'use strict';
var E=window.E3D;

E.IDEAS = {
  'Tecnología cotidiana': [
    'Cómo te encuentra un rastreador Bluetooth sin tener GPS',
    'Cómo sabe tu teléfono dónde estás sin enviar nada al espacio',
    'Cómo funciona la carga inalámbrica',
    'Por qué la batería del teléfono dura menos con los años',
    'Cómo funciona el pago sin contacto con el teléfono',
    'Cómo reconoce tu teléfono tu huella',
    'Cómo funciona el desbloqueo facial',
    'Por qué la pantalla táctil no responde con guantes',
    'Cómo cancelan el ruido los audífonos',
    'Cómo funciona un código QR',
    'Cómo funciona el Bluetooth',
    'Qué pasa dentro de un microondas',
    'Cómo frena solo un auto antes de chocar',
    'Cómo guarda datos una memoria USB sin piezas móviles',
    'Cómo enfoca la cámara de tu teléfono en milisegundos',
    'Por qué el modo avión ahorra batería',
    'Cómo funciona un control remoto',
    'Cómo mide tu pulso un reloj inteligente'
  ],
  'Internet y redes': [
    'Por qué el Wi-Fi no es internet',
    'Qué pasa en el segundo en que abres una página web',
    'Cómo cruza un mensaje el océano en milisegundos',
    'Qué es realmente la nube',
    'Cómo sabe internet a qué dispositivo enviar cada dato',
    'Qué hace un servidor DNS',
    'Por qué el video se pixela cuando la conexión es lenta',
    'Cómo funciona una videollamada',
    'Qué es la fibra óptica y por qué es tan rápida',
    'Cómo viaja un correo electrónico',
    'Qué hace realmente una VPN',
    'Por qué el 5G es más rápido pero llega menos lejos',
    'Cómo funciona el internet satelital',
    'Qué son las cookies y qué saben de ti',
    'Por qué a veces se cae una aplicación en todo el mundo',
    'Cómo funciona el streaming sin descargar la película'
  ],
  'Informática y programación': [
    'Cómo entiende una computadora solo ceros y unos',
    'Qué hace el procesador miles de millones de veces por segundo',
    'Diferencia entre memoria RAM y almacenamiento',
    'Qué pasa cuando presionas una tecla',
    'Cómo se guarda una foto en números',
    'Qué es un algoritmo, explicado con una receta',
    'Cómo ordena una computadora un millón de datos',
    'Qué es una base de datos y por qué no es una hoja de cálculo',
    'Qué hace un sistema operativo',
    'Cómo funciona la compresión de archivos',
    'Qué es una API, explicada con un restaurante',
    'Por qué se cuelga un programa',
    'Qué es el código abierto',
    'Cómo funciona una app web sin conexión',
    'Qué pasa de verdad cuando borras un archivo',
    'Cómo encuentra un programador el error en su código'
  ],
  'Inteligencia artificial': [
    'Cómo predice una IA la siguiente palabra',
    'Por qué una IA puede inventar datos con total seguridad',
    'Cómo aprende una IA a reconocer un gato',
    'Qué es un token y por qué importa',
    'Cómo genera una IA una imagen a partir de ruido',
    'Qué significa entrenar un modelo',
    'Por qué la IA necesita tantas tarjetas gráficas',
    'Cómo decide una app qué video mostrarte después',
    'Qué es un prompt y por qué cambia la respuesta',
    'Cómo traduce una IA sin diccionario',
    'Cómo reconoce tu voz un asistente',
    'Qué es el sesgo en la IA y de dónde sale',
    'Cómo detecta el correo el spam',
    'Diferencia entre IA, aprendizaje automático y redes neuronales',
    'Cómo ve la calle un auto autónomo'
  ],
  'Ciberseguridad': [
    'Cómo funciona el phishing y cómo detectarlo',
    'Por qué una contraseña larga vence a una complicada',
    'Qué hace la verificación en dos pasos',
    'Qué significa el candado del navegador',
    'Cómo se guardan las contraseñas sin guardarlas',
    'Qué es el cifrado de extremo a extremo',
    'Por qué no debes repetir la misma contraseña',
    'Qué riesgo tiene una red Wi-Fi pública',
    'Qué es el ransomware y cómo protegerte',
    'Cómo funciona un gestor de contraseñas',
    'Qué datos entregas al aceptar los permisos de una app',
    'Cómo te siguen los anuncios de una página a otra',
    'Qué es la copia de seguridad 3-2-1',
    'Cómo reconocer un enlace falso',
    'Qué es una llave de acceso y por qué reemplaza a la contraseña'
  ],
  'Cuerpo humano': [
    'Cómo crece un músculo mientras descansas',
    'Qué pasa en tu cerebro cuando duermes',
    'Cómo late el corazón sin que se lo ordenes',
    'Cómo viaja una señal por una neurona',
    'Cómo llega el dolor del dedo al cerebro',
    'Cómo combate el cuerpo a un virus',
    'Cómo funciona una vacuna',
    'Qué hace el oxígeno después de entrar a los pulmones',
    'Cómo se convierte la comida en energía',
    'Por qué te da fiebre',
    'Cómo sana una herida',
    'Cómo ve el ojo y por qué la imagen llega invertida',
    'Cómo mantiene el equilibrio el oído',
    'Cómo se forma un recuerdo',
    'Qué es el ADN y cómo guarda instrucciones',
    'Por qué sudas cuando hace calor'
  ],
  'Salud y ejercicio': [
    'Por qué duelen los músculos dos días después de entrenar',
    'Qué es la sobrecarga progresiva',
    'Qué pasa en tu cuerpo cuando corres 30 minutos',
    'Para qué sirve calentar antes de entrenar',
    'Qué hace el sueño por tu recuperación',
    'A dónde va la grasa cuando la pierdes',
    'Qué es el déficit calórico',
    'Por qué no se puede perder grasa de una sola zona',
    'Qué pasa cuando dejas de entrenar un mes',
    'Cómo se fortalece un hueso con el ejercicio',
    'Qué es la frecuencia cardíaca máxima y para qué sirve',
    'Qué hace la creatina en el músculo',
    'Qué pasa en tu cuerpo si pasas ocho horas sentado',
    'Cómo afecta el estrés al cuerpo',
    'Por qué la constancia le gana a la intensidad'
  ],
  'Nutrición': [
    'Qué hace la proteína después de comerla',
    'Qué es el índice glucémico',
    'Cómo regula la insulina el azúcar en la sangre',
    'Qué pasa en tu cuerpo cuando tomas café',
    'Por qué la fibra no se digiere y aun así importa',
    'Diferencia entre grasas saturadas e insaturadas',
    'Qué hace el agua en tu cuerpo',
    'Cómo leer una etiqueta nutricional en 20 segundos',
    'Qué es, en realidad, una caloría',
    'Por qué el azúcar de una bebida se absorbe tan rápido',
    'Qué es un electrolito',
    'Qué relación hay entre la sal y la presión arterial',
    'Cómo sabe tu cuerpo que tiene hambre',
    'Qué son las vitaminas y por qué se necesitan tan poco',
    'Por qué es tan fácil comer de más con ultraprocesados'
  ],
  'Ciencia y naturaleza': [
    'Por qué el cielo es azul',
    'Cómo se forma un rayo',
    'Por qué flota un barco de acero',
    'Cómo se sostiene un avión en el aire',
    'Por qué el hielo flota',
    'Cómo se forma un arcoíris',
    'Qué causa un terremoto',
    'Cómo fabrica una planta su alimento con luz',
    'Por qué la sal derrite el hielo',
    'Cómo funciona un imán',
    'Por qué el trueno suena después del rayo',
    'Cómo se forma un huracán',
    'Qué es el sonido',
    'Por qué cambian de color las hojas',
    'Cómo se orientan las aves migratorias',
    'Por qué hay mareas'
  ],
  'Espacio': [
    'Por qué los satélites no se caen',
    'Cómo sabemos de qué están hechas las estrellas',
    'Qué es un agujero negro',
    'Por qué la Luna siempre muestra la misma cara',
    'Cómo aterriza un cohete de pie',
    'Por qué hay estaciones del año',
    'Por qué los astronautas flotan si allí hay gravedad',
    'Cómo se mide la distancia a una estrella',
    'Qué es un año luz',
    'Cómo ocurre un eclipse',
    'Por qué Plutón dejó de ser planeta',
    'Cómo se mantiene en órbita la Estación Espacial',
    'Qué es la basura espacial',
    'Cómo llega la señal de una sonda desde tan lejos',
    'Por qué Marte es rojo'
  ],
  'Dinero y finanzas personales': [
    'Cómo funciona el interés compuesto',
    'Qué pasa cuando pagas con tarjeta',
    'Por qué pagar el mínimo de la tarjeta sale tan caro',
    'Qué es la inflación y cómo te afecta',
    'Cómo se arma un fondo de emergencia',
    'Qué es el presupuesto 50/30/20',
    'Cómo se reparte cada cuota de un préstamo',
    'Qué es el historial de crédito',
    'Diferencia entre ahorrar e invertir',
    'Qué significa una tasa de interés anual',
    'Qué hace un banco con tu dinero',
    'Qué es un gasto hormiga',
    'Cómo funciona una transferencia bancaria',
    'Qué es diversificar',
    'Por qué cambia el precio del dólar'
  ],
  'Empleo y vida laboral': [
    'Qué mira un reclutador en los primeros segundos de tu currículum',
    'Cómo responder "háblame de ti" en una entrevista',
    'Diferencia entre salario bruto y salario neto',
    'Qué son las habilidades blandas',
    'Cómo funciona el filtro automático de currículums',
    'Cómo pedir retroalimentación en el trabajo',
    'Qué debe decir un contrato de trabajo',
    'Cómo organizar tu día con bloques de tiempo',
    'Cómo se negocia un salario',
    'Qué es la marca personal',
    'Cómo escribir un correo profesional',
    'Qué hacer en tus primeros 90 días de trabajo',
    'Diferencia entre empleo, emprendimiento y trabajo independiente',
    'Cómo funciona un tablero Kanban',
    'Qué es el método STAR para entrevistas'
  ],
  'Seguridad en el trabajo': [
    'Cómo se propaga un incendio y cómo cortarlo',
    'Qué extintor sirve para cada tipo de fuego',
    'Cómo absorbe el golpe un casco',
    'Cómo levantar una carga sin dañar la espalda',
    'Qué hace un arnés durante una caída',
    'Qué significan los colores de las señales de seguridad',
    'Diferencia entre peligro y riesgo',
    'Cómo te protege la puesta a tierra',
    'Cómo corta la corriente un interruptor diferencial',
    'Cómo daña el ruido al oído con los años',
    'Qué es la ergonomía frente a la computadora',
    'Cómo se evacúa un edificio',
    'Qué hacer en los primeros minutos de un accidente',
    'Qué es el bloqueo y etiquetado de máquinas',
    'Por qué la fatiga causa accidentes'
  ],
  'Comercio y turismo': [
    'Cómo decide un hotel el precio de cada noche',
    'Por qué los vuelos cambian de precio cada día',
    'Cómo funciona la sobreventa de vuelos',
    'Qué pasa con tu maleta después del mostrador',
    'Cómo funciona un código de barras',
    'Por qué los supermercados ponen la leche al fondo',
    'Cómo llega un paquete en 24 horas',
    'Qué es un canal de distribución',
    'Cómo funciona una reserva en línea',
    'Qué es el turismo sostenible',
    'Cómo se calcula el precio de un producto',
    'Qué es la experiencia del cliente',
    'Cómo funciona un programa de puntos',
    'Por qué existe la temporada alta',
    'Qué hace que un cliente deje una buena reseña'
  ],
  'Psicología y hábitos': [
    'Cómo se forma un hábito',
    'Por qué procrastinamos',
    'Qué hace realmente la dopamina',
    'Por qué engancha el scroll infinito',
    'Cómo funciona la memoria a corto y a largo plazo',
    'Por qué olvidamos lo que estudiamos',
    'Qué es la repetición espaciada',
    'Por qué la multitarea te hace más lento',
    'Cómo afecta el sueño a la memoria',
    'Qué es el efecto de anclaje',
    'Por qué pesan tanto las primeras impresiones',
    'Qué es el sesgo de confirmación',
    'Cómo funciona la técnica Pomodoro',
    'Qué es el estado de flujo',
    'Por qué cuesta tanto empezar y tan poco seguir'
  ],
  'Energía y medio ambiente': [
    'Cómo convierte la luz en electricidad un panel solar',
    'Cómo llega la electricidad a tu casa',
    'Qué es el efecto invernadero',
    'Cómo funciona una batería de litio',
    'Cómo recarga la batería un auto eléctrico al frenar',
    'Cómo genera electricidad una turbina eólica',
    'Qué pasa con una botella después de reciclarla',
    'Cómo se potabiliza el agua',
    'Qué es la huella de carbono',
    'Cómo funciona una hidroeléctrica',
    'Por qué ocurre un apagón',
    'Qué consume más electricidad en tu casa',
    'Cómo enfría un aire acondicionado',
    'Qué es el consumo fantasma',
    'Cómo se forma la lluvia ácida'
  ]
};

function llano(s){ return String(s==null?'':s).toLowerCase().trim().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/\s+/g,' '); }

/* Busca la categoría del banco que corresponde a lo escrito (sin importar tildes ni mayúsculas; acepta parte del nombre). */
var SINONIMOS={
  'Tecnología cotidiana':['gadgets','celulares','telefonos','aparatos','dispositivos'],
  'Internet y redes':['web','wifi','conectividad'],
  'Informática y programación':['computacion','computadoras','software','codigo','sistemas'],
  'Inteligencia artificial':['ia','ai','chatbots','machine learning'],
  'Ciberseguridad':['hackers','hacking','seguridad informatica','seguridad digital','privacidad'],
  'Cuerpo humano':['anatomia','medicina','biologia humana','organos'],
  'Salud y ejercicio':['deporte','deportes','gym','gimnasio','fitness','entrenamiento'],
  'Nutrición':['comida','alimentacion','dieta','alimentos'],
  'Ciencia y naturaleza':['fisica','quimica','biologia','clima','animales'],
  'Espacio':['astronomia','universo','planetas','cosmos'],
  'Dinero y finanzas personales':['ahorro','economia','inversiones','banca'],
  'Empleo y vida laboral':['trabajo','curriculum','entrevistas','orientacion laboral','carrera'],
  'Seguridad en el trabajo':['seguridad laboral','seguridad industrial','prevencion','riesgos laborales','salud ocupacional'],
  'Comercio y turismo':['ventas','negocios','marketing','hoteleria','viajes'],
  'Psicología y hábitos':['mente','productividad','estudio','motivacion'],
  'Energía y medio ambiente':['ecologia','electricidad','reciclaje','sostenibilidad']
};
E.buscarCategoria=function(texto){
  var q=llano(texto), nombres=Object.keys(E.IDEAS), i;
  if(!q) return null;
  for(i=0;i<nombres.length;i++) if(llano(nombres[i])===q) return nombres[i];
  for(i=0;i<nombres.length;i++) if((SINONIMOS[nombres[i]]||[]).indexOf(q)>=0) return nombres[i];
  var qs=q.split(' ');                                                  // alguna palabra suelta es un sinónimo: "ia generativa", "rutinas de gym"
  for(i=0;i<nombres.length;i++){ var sn=SINONIMOS[nombres[i]]||[]; for(var w=0;w<qs.length;w++) if(sn.indexOf(qs[w])>=0) return nombres[i]; }
  if(q.length<4) return null;
  for(i=0;i<nombres.length;i++){ var n=llano(nombres[i]); if(n.indexOf(q)>=0 || q.indexOf(n)>=0) return nombres[i]; }
  for(i=0;i<nombres.length;i++){                                      // coincide con alguna palabra del nombre: "salud", "dinero", "redes"
    var pal=llano(nombres[i]).split(' ');
    for(var j=0;j<pal.length;j++) if(pal[j].length>=4 && (pal[j].indexOf(q)===0 || q.indexOf(pal[j])===0)) return nombres[i];
  }
  return null;
};

/* Devuelve { categoria, idea } sin repetir hasta agotar la categoría. "vistas" es la lista de ideas ya mostradas (se modifica).
   Con categoría vacía elige una al azar; si la categoría no está en el banco devuelve null. */
E.generarIdea=function(texto, vistas, azar){
  azar=azar||Math.random; vistas=vistas||[];
  var nombres=Object.keys(E.IDEAS), cat = String(texto||'').trim() ? E.buscarCategoria(texto) : nombres[Math.floor(azar()*nombres.length)];
  if(!cat) return null;
  var lista=E.IDEAS[cat], libres=lista.filter(function(x){ return vistas.indexOf(x)<0; });
  if(!libres.length){                                                 // ya salieron todas: se reinicia esa categoría
    for(var i=vistas.length-1;i>=0;i--) if(lista.indexOf(vistas[i])>=0) vistas.splice(i,1);
    libres=lista.slice();
  }
  var idea=libres[Math.floor(azar()*libres.length)];
  vistas.push(idea);
  return { categoria:cat, idea:idea, restantes:libres.length-1, total:lista.length };
};

/* Prompt para pedirle más ideas a una IA, útil para categorías que no están en el banco. */
E.promptIdeas=function(categoria){
  var c=String(categoria||'').trim() || 'cualquier tema de cultura general';
  return [
    'Dame 10 ideas de temas para videos explicativos cortos (30 a 90 segundos) en la categoría: '+c+'.',
    '',
    'Cada idea debe:',
    '- Explicar un mecanismo: cómo funciona algo o por qué pasa.',
    '- Partir de una contradicción o de una idea equivocada muy común, para que sirva de gancho.',
    '- Poder mostrarse con objetos simples en 3D (personas, dispositivos, edificios, órganos, vehículos) y con señales dibujadas como ondas, líneas, domos y etiquetas.',
    '- Ser correcta y fácil de verificar. Nada de mitos ni cifras dudosas.',
    '',
    'Responde con una lista numerada, una línea por idea, solo el título de cada video (máximo 12 palabras), sin explicaciones.'
  ].join('\n');
};
})();
