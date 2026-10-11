/* Explika · guion: leer y validar el JSON pegado, y armar el prompt para la IA */
(function(){
'use strict';
var E=window.E3D;
function llano(s){ return String(s==null?'':s).toLowerCase().trim().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[\s-]+/g,'_'); }
function num(v,d){ return typeof v==='number' && isFinite(v) ? v : d; }

var ALIAS_TIPO={ celular:'telefono', movil:'telefono', smartphone:'telefono', computadora:'laptop', portatil:'laptop', pc:'monitor', pantalla:'monitor',
  carro:'auto', coche:'auto', humano:'persona', hombre:'persona', mujer:'persona', gente:'multitud', personas:'multitud', tierra:'planeta', mundo:'planeta',
  torre:'antena', paquete:'caja', caja_de_carton:'caja', tubo:'fibra', foco:'bombilla', lampara:'bombilla', cpu:'chip', procesador:'chip', bola:'esfera',
  caja_3d:'cubo', aro:'anillo', dumbbell:'mancuerna', pesa:'mancuerna', escritorio:'mesa', cohete_espacial:'cohete', arbol_grande:'arbol', servidores:'servidor' };
var ALIAS_ENT={ gym:'gimnasio', dormitorio:'habitacion', cuarto:'habitacion', casa:'habitacion', sala:'habitacion', salon:'aula', clase:'aula', escuela:'aula',
  bosque:'naturaleza', campo:'naturaleza', parque:'naturaleza', exterior:'calle', cuerpo:'micro', interior_cuerpo:'micro', microscopico:'micro', celular:'micro',
  universo:'espacio', orbita:'espacio', neutro:'vacio', abstracto:'vacio', estudio:'vacio' };
var ALIAS_FX={ label:'etiqueta', ring:'anillos', anillo:'anillos', ondas:'anillos', dome:'domo', cupula:'domo', line:'linea', conexion:'linea', rayo:'haz', beam:'haz',
  marcador:'pin', particles:'particulas', flujo:'particulas', move:'mover', mostrar:'aparecer', ocultar:'desaparecer', escalar:'escala', crecer:'escala',
  recolor:'color', anim:'animar', animacion:'animar', destacar:'resaltar', numero:'dato', cifra:'dato', status:'estado', camera:'camara', icon:'icono' };

function parsear(txt,res){
  var s=String(txt).trim(); s=s.replace(/^```[a-zA-Z]*\s*/,'').replace(/```\s*$/,'');
  var a=s.indexOf('{'), b=s.lastIndexOf('}');
  if(a<0 || b<=a){ res.errores.push('No encontré un objeto JSON en lo que pegaste. Debe empezar con { y terminar con }.'); return null; }
  s=s.slice(a,b+1);
  try{ return JSON.parse(s); }
  catch(e1){
    var s2=s.replace(/[“”]/g,'"').replace(/,\s*([}\]])/g,'$1');
    try{ return JSON.parse(s2); }
    catch(e2){ res.errores.push('El JSON tiene un error de formato ('+e2.message+'). Pídele a la IA que lo devuelva completo y válido.'); return null; }
  }
}

/* Devuelve { guion, errores, avisos }. Tolera faltantes y nombres parecidos; lo que no entiende lo avisa. */
E.leerGuion=function(entrada){
  var res={ guion:null, errores:[], avisos:[] }, raw = typeof entrada==='string' ? parsear(entrada,res) : entrada;
  if(!raw) return res;
  var esc=raw.escenas||raw.scenes;
  if(!Array.isArray(esc) || !esc.length){ res.errores.push('El guion no trae "escenas".'); return res; }
  var g={ titulo:String(raw.titulo||raw.title||'Sin título').slice(0,90), marca:String(raw.marca||'').slice(0,28), ritmo:num(raw.ritmo,0.38), paleta:{}, escenas:[] };
  if(raw.paleta && typeof raw.paleta==='object') Object.keys(E.PALETA_BASE).forEach(function(k){ if(/^#[0-9a-fA-F]{6}$/.test(raw.paleta[k]||'')) g.paleta[k]=raw.paleta[k].toLowerCase(); });
  if(esc.length>12){ res.avisos.push('El guion trae '+esc.length+' escenas; usé las primeras 12.'); esc=esc.slice(0,12); }

  esc.forEach(function(sr,si){
    if(!sr || typeof sr!=='object') return;
    var n=si+1, ent=llano(sr.entorno||sr.environment||'vacio'); ent=ALIAS_ENT[ent]||ent;
    if(!E.ENTORNOS[ent]){ res.avisos.push('Escena '+n+': el entorno "'+sr.entorno+'" no existe. Usé "vacio".'); ent='vacio'; }
    var s={ entorno:ent, objetos:[], lineas:[], camara:obj(sr.camara), camara_fin:obj(sr.camara_fin) };
    if(sr.estado) s.estado = typeof sr.estado==='string' ? {texto:sr.estado} : { texto:String(sr.estado.texto||''), color:sr.estado.color };
    var ids={};
    (Array.isArray(sr.objetos||sr.objects) ? (sr.objetos||sr.objects) : []).slice(0,16).forEach(function(or,oi){
      if(!or || typeof or!=='object') return;
      var d=Object.assign({}, or); d.tipo=llano(or.tipo||or.type||'cubo'); d.tipo=ALIAS_TIPO[d.tipo]||d.tipo;
      d.id=String(or.id||d.tipo+(oi+1)); if(ids[d.id]){ res.avisos.push('Escena '+n+': el id "'+d.id+'" está repetido.'); d.id=d.id+'_'+(oi+1); } ids[d.id]=1;
      if(d.anim) d.anim=llano(d.anim); if(d.parte_heroe) d.parte_heroe=llano(d.parte_heroe);
      s.objetos.push(d);
    });
    var lr=sr.lineas||sr.lines;
    (Array.isArray(lr)?lr:[]).slice(0,40).forEach(function(l){
      if(typeof l==='string') l={texto:l};
      if(!l || typeof l!=='object') return;
      var texto=String(l.texto||l.text||'').replace(/\s+/g,' ').trim(); if(!texto) return;
      var efectos=(Array.isArray(l.efectos||l.effects)?(l.efectos||l.effects):[]).filter(function(f){ return f && typeof f==='object'; }).map(function(f){
        var e=Object.assign({}, f); e.tipo=llano(f.tipo||f.type); e.tipo=ALIAS_FX[e.tipo]||e.tipo;
        if(e.icono) e.icono=llano(e.icono); if(e.anim) e.anim=llano(e.anim); if(e.plano) e.plano=llano(e.plano); if(typeof e.angulo==='string') e.angulo=llano(e.angulo);
        return e; });
      var cam=obj(l.camara), w=texto.split(' ');
      if(w.length<=6) s.lineas.push({ texto:texto, efectos:efectos, camara:cam, segundos:num(l.segundos,0), pausa:num(l.pausa,-1) });
      else {                                         // líneas largas: se reparten en trozos de hasta 4 palabras
        var trozos=Math.ceil(w.length/4), por=Math.ceil(w.length/trozos), k;
        for(k=0;k<trozos;k++) s.lineas.push({ texto:w.slice(k*por,(k+1)*por).join(' '), efectos:k?[]:efectos, camara:k?null:cam, segundos:0, pausa:-1 });
      }
    });
    if(!s.lineas.length){ res.avisos.push('Escena '+n+': no tiene líneas de narración y la omití.'); return; }
    g.escenas.push(s);
  });
  function obj(c){ if(!c || typeof c!=='object') return null; var o=Object.assign({}, c); if(o.plano) o.plano=llano(o.plano); if(typeof o.angulo==='string') o.angulo=llano(o.angulo); return o; }
  if(!g.escenas.length){ res.errores.push('Ninguna escena tiene narración.'); return res; }
  res.guion=g; return res;
};

/* ---------- prompt ---------- */
var DOC_EFECTOS=[
  '{"tipo":"estado","texto":"EMITIENDO","color":"azul"}  cambia la píldora de estado',
  '{"tipo":"etiqueta","en":"id","titulo":"Router","sub":"EMISOR DE RADIO","color":"azul"}  etiqueta flotante unida al objeto; dura 2 líneas ("dura": n para cambiarlo)',
  '{"tipo":"icono","icono":"wifi","color":"azul","tachado":false}  cuadro con icono a la derecha (máximo 3 a la vez); "tachado": true lo cruza con una barra',
  '{"tipo":"dato","texto":"24–48 h","sub":"TIEMPO DE RECUPERACIÓN","color":"verde"}  cifra grande en pantalla; dura 2 líneas',
  '{"tipo":"anillos","en":"id","color":"azul"}  ondas concéntricas que pulsan desde el objeto',
  '{"tipo":"domo","en":"id","radio":4,"color":"azul"}  domo de malla sobre el suelo que muestra un alcance',
  '{"tipo":"linea","de":"id","a":"id","color":"verde"}  línea que conecta dos objetos, con un pulso que viaja',
  '{"tipo":"haz","en":"id","color":"verde"}  haz vertical hacia el cielo (datos que suben a la red)',
  '{"tipo":"pin","en":"id","color":"verde"}  marcador de mapa sobre el objeto',
  '{"tipo":"particulas","de":"id","a":"id","color":"verde"}  flujo de cubitos de un objeto a otro (datos, materia, energía)',
  '{"tipo":"mover","obj":"id","a":[x,y,z],"segundos":3}  mueve el objeto (también "hacia":"id" o "por":[dx,dy,dz]); una persona camina sola al moverse',
  '{"tipo":"aparecer","obj":"id"} y {"tipo":"desaparecer","obj":"id"}  para objetos creados con "oculto": true',
  '{"tipo":"escala","obj":"id","factor":1.4,"segundos":2}  agranda o achica',
  '{"tipo":"color","obj":"id","color":"rojo"}  cambia el color del objeto',
  '{"tipo":"animar","obj":"id","anim":"caminar"}  cambia la animación',
  '{"tipo":"resaltar","obj":"id"}  pequeño salto para llamar la atención'
];
E.catalogo=function(){
  var o=[], e=[];
  Object.keys(E.ENTORNOS).forEach(function(k){ e.push('- '+k+': '+E.ENTORNOS[k].desc); });
  Object.keys(E.PROPS).forEach(function(k){ var p=E.PROPS[k]; o.push('- '+k+' ('+p.tam+'): '+p.desc+(p.opciones?'. '+p.opciones:'')); });
  return { entornos:e, objetos:o, efectos:DOC_EFECTOS, iconos:Object.keys(E.ICONOS) };
};
E.crearPrompt=function(f){
  var c=E.catalogo(), dur=num(f.duracion,60), pal=Math.round(dur/0.58), L=[];
  L.push('Eres guionista y director de videos explicativos 3D verticales (9:16) de estilo minimalista low-poly: escena nocturna oscura, un solo objeto protagonista en color crema, personas como maniquíes grises sin rostro, y los conceptos invisibles dibujados con domos, anillos, líneas, etiquetas e iconos.');
  L.push('');
  L.push('Escribe el guion completo del video como UN SOLO objeto JSON para el motor "Explika". Responde únicamente con el JSON: sin texto antes ni después, sin comentarios y sin bloque de código.');
  L.push('');
  L.push('TEMA: '+(f.tema||'(escribe aquí el tema)'));
  L.push('DURACIÓN: unos '+dur+' segundos, es decir entre '+Math.round(pal*0.9)+' y '+Math.round(pal*1.1)+' palabras de narración en total.');
  L.push('IDIOMA DE LA NARRACIÓN Y DE LOS TEXTOS EN PANTALLA: '+(f.idioma||'español'));
  L.push('TONO: '+(f.tono||'claro y tranquilo'));
  if(f.publico) L.push('PÚBLICO: '+f.publico);
  if(f.puntos) L.push('DEBE INCLUIR: '+f.puntos);
  if(f.cierre) L.push('CIERRE O LLAMADO A LA ACCIÓN: '+f.cierre);
  if(f.marca) L.push('MARCA (campo "marca"): '+f.marca);
  L.push('');
  L.push('NARRACIÓN');
  L.push('- Primera frase: un gancho con una contradicción o una pregunta ("X no tiene A ni B. Entonces, ¿cómo hace Y?").');
  L.push('- Después: "Imagina que...", el mecanismo paso a paso, cómo escala o qué pasa en el caso límite, y un cierre que corrige la idea equivocada ("Así que X no es A. Es B.").');
  L.push('- Frases cortas y habladas. Datos correctos: no inventes cifras ni mecanismos.');
  L.push('- Cada elemento de "lineas" es un trozo de 2 a 5 palabras que se muestra como subtítulo. Una frase se reparte en varias líneas seguidas. La línea que cierra una frase termina en punto, signo de interrogación o dos puntos; el motor hace la pausa solo.');
  L.push('');
  L.push('ESCENAS');
  L.push('- De 3 a 6 escenas. Una escena es un lugar. Mientras el lugar no cambie, sigue en la misma escena y usa efectos y movimientos de cámara por línea.');
  L.push('- Cada escena lleva 1 entorno, de 1 a 8 objetos y de 4 a 14 líneas.');
  L.push('- Un solo objeto protagonista por escena con "heroe": true (sale en crema). Los demás quedan grises salvo que su color signifique algo.');
  L.push('- Colores con significado fijo en todo el video: azul = señal, alcance o lo que se está explicando; verde = confirmado, resultado o dato que llega; ambar = orden, precisión o detalle; rojo = problema o fallo.');
  L.push('- Unidades en metros, eje y hacia arriba. La cámara mira desde +z: lo que tiene z mayor queda más cerca. Coloca los objetos con x entre -4 y 4 y z entre -3 y 3. Una persona mide 1.8.');
  L.push('- No encimes objetos: sepáralos según su tamaño. Para poner algo encima de otro usa "sobre"; para que una persona lo sostenga usa "en_mano".');
  L.push('- Si un objeto pequeño comparte escena con personas y debe verse, súbele "escala" (por ejemplo un teléfono con escala 2 o 3).');
  L.push('- "estado" es una o dos palabras en MAYÚSCULAS (máximo 16 caracteres) que resume la etapa. Debe cambiar de 4 a 7 veces en el video, como una máquina de estados.');
  L.push('- Pon cada efecto en la línea donde se nombra el concepto, no todos al inicio. Máximo 2 efectos por línea, y deja líneas sin efectos.');
  L.push('- Etiquetas: título de 1 a 3 palabras y "sub" de 2 a 3 palabras. Máximo 2 visibles a la vez.');
  L.push('- Mueve la cámara cada 2 a 4 líneas para seguir lo que se nombra, alternando entre plano general y primer plano. Empieza el video con un "detalle" o "primer_plano" del protagonista.');
  L.push('- La cámara encuadra según el tamaño del objetivo: un "primer_plano" de algo pequeño acerca mucho la cámara y lo grande que esté al lado llena la pantalla. Para ver un objeto pequeño junto a uno grande, usa "general" sobre el pequeño o "primer_plano" sobre el grande.');
  L.push('- Usa solo los nombres de las listas de abajo. Si te falta un objeto, constrúyelo con "grupo" y primitivas (cubo, esfera, cilindro, cono, capsula).');
  L.push('');
  L.push('FORMATO');
  L.push('{');
  L.push('  "titulo": "texto",');
  L.push('  "escenas": [');
  L.push('    {');
  L.push('      "entorno": "nombre de ENTORNOS",');
  L.push('      "estado": { "texto": "EN REPOSO", "color": "gris" },');
  L.push('      "objetos": [ { "id": "nombre_unico", "tipo": "nombre de OBJETOS", "pos": [x, y, z], "rot": grados, "escala": 1, "heroe": true, "color": "azul", "oculto": false, "anim": "...", "sobre": "id", "en_mano": "id de una persona" } ],');
  L.push('      "camara": { "plano": "general", "objetivo": "escena" },');
  L.push('      "lineas": [ { "texto": "2 a 5 palabras", "camara": { "plano": "primer_plano", "objetivo": "id" }, "efectos": [ { "tipo": "...", "...": "..." } ] } ]');
  L.push('    }');
  L.push('  ]');
  L.push('}');
  L.push('Solo son obligatorios "entorno", "objetos" y "lineas" con su "texto". Omite los campos que no uses. De cada objeto solo "id" y "tipo" son obligatorios.');
  L.push('');
  L.push('CÁMARA: "plano" puede ser detalle, primer_plano, medio, general, aereo o cenital. "objetivo" es el id de un objeto, "id.ancla" o "escena". "angulo" (opcional) puede ser frente, derecha, izquierda o lateral.');
  L.push('COLORES: crema, gris, azul, verde, ambar, rojo.');
  L.push('ANIMACIONES para cualquier objeto que no sea persona: girar, flotar, latir, vibrar.');
  L.push('');
  L.push('ENTORNOS'); c.entornos.forEach(function(x){ L.push(x); });
  L.push('');
  L.push('OBJETOS (tamaño natural entre paréntesis)'); c.objetos.forEach(function(x){ L.push(x); });
  L.push('');
  L.push('EFECTOS (van dentro de "efectos" de una línea y empiezan cuando esa línea se dice; los efectos 3D duran hasta el final de la escena salvo que pongas "dura": número de líneas)');
  c.efectos.forEach(function(x){ L.push('- '+x); });
  L.push('');
  L.push('ICONOS: '+c.iconos.join(', '));
  L.push('');
  L.push('EJEMPLO DE FORMATO (es de otro tema y está recortado; no copies su contenido):');
  L.push(JSON.stringify(E.EJEMPLO_PROMPT));
  return L.join('\n');
};
})();
