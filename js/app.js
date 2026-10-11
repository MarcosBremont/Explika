/* Explika · interfaz: pasos, vista previa, ajustes, exportación y proyectos guardados */
(function(){
'use strict';
var E=window.E3D;
function $(id){ return document.getElementById(id); }
function leer(k,def){ try{ var v=localStorage.getItem(k); return v==null?def:JSON.parse(v); }catch(e){ return def; } }
function guardar(k,v){ try{ localStorage.setItem(k,JSON.stringify(v)); return true; }catch(e){ return false; } }
function mmss(s){ s=Math.max(0,s); var m=Math.floor(s/60), r=Math.floor(s%60); return m+':'+(r<10?'0':'')+r; }
function slug(s){ return String(s||'video').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,60)||'video'; }
function nota(el,txt,clase){ el.textContent=txt||''; el.className='nota'+(clase?' '+clase:''); if(txt) setTimeout(function(){ if(el.textContent===txt){ el.textContent=''; } },4000); }
function copiar(txt,el){
  function listo(){ nota(el,'Copiado','ok'); }
  function manual(){ var ta=document.createElement('textarea'); ta.value=txt; ta.style.position='fixed'; ta.style.opacity='0'; document.body.appendChild(ta); ta.select(); var ok=false; try{ ok=document.execCommand('copy'); }catch(e){} document.body.removeChild(ta); if(ok) listo(); else nota(el,'No pude copiar. Selecciona el texto y cópialo a mano.','mal'); }
  if(navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(listo,manual); else manual();
}

/* Si la app se abrió por http y el mismo sitio responde por https, se pasa sola a https:
   sin conexión segura el navegador no deja exportar video ni instalar la app. */
var URL_SEGURA='https://'+location.host+location.pathname+location.search+location.hash;
if(location.protocol==='http:' && !/^(localhost$|127\.|\[::1\]$)/.test(location.hostname) && window.fetch){
  fetch(URL_SEGURA,{ mode:'no-cors', cache:'no-store' }).then(function(){ location.replace(URL_SEGURA); }).catch(function(){});
}

var AJ_BASE={ ritmo:0.38, marca:'', marcaModo:'lado', paleta:{} };
var motor=null, S={ texto:'', titulo:'', t:0, playing:false, sucio:true, exportando:false, ajustes:Object.assign({},AJ_BASE,leer('e3d.ajustes',{})), ultimo:0 };
if(!S.ajustes.paleta || typeof S.ajustes.paleta!=='object') S.ajustes.paleta={};
var COLORES={ cFondo:'fondo', cCrema:'crema', cAzul:'azul', cVerde:'verde', cAmbar:'ambar', cRojo:'rojo' };

/* ---------- pestañas ---------- */
var TABS=['tema','guion','ajustes','exportar'];
function abrir(nombre){
  TABS.forEach(function(n){ var on=n===nombre; $('tab-'+n).setAttribute('aria-selected',on?'true':'false'); $('tab-'+n).tabIndex=on?0:-1; $('hoja-'+n).hidden=!on; });
  if(nombre==='exportar') pintarExportar();
}
TABS.forEach(function(n,i){
  $('tab-'+n).addEventListener('click',function(){ abrir(n); });
  $('tab-'+n).addEventListener('keydown',function(e){ if(e.key==='ArrowRight'||e.key==='ArrowLeft'){ var j=(i+(e.key==='ArrowRight'?1:TABS.length-1))%TABS.length; abrir(TABS[j]); $('tab-'+TABS[j]).focus(); } });
});

/* ---------- paso 1: prompt ---------- */
function datosTema(){ return { tema:$('fTema').value.trim(), duracion:+$('fDur').value, idioma:$('fIdioma').value, tono:$('fTono').value, publico:$('fPublico').value.trim(), puntos:$('fPuntos').value.trim(), cierre:$('fCierre').value.trim(), marca:$('fMarca').value.trim() }; }
function refrescarPrompt(){ $('tPrompt').value=E.crearPrompt(datosTema()); guardar('e3d.tema',datosTema()); }
$('bCopiarPrompt').addEventListener('click',function(){
  if(!$('fTema').value.trim()){ nota($('notaPrompt'),'Escribe primero el tema del video.','mal'); $('fTema').focus(); return; }
  refrescarPrompt(); copiar($('tPrompt').value,$('notaPrompt'));
});
$('bVerPrompt').addEventListener('click',function(){ var ta=$('tPrompt'), ver=ta.hidden; if(ver) refrescarPrompt(); ta.hidden=!ver; this.setAttribute('aria-expanded',ver?'true':'false'); this.textContent=ver?'Ocultar prompt':'Ver prompt'; });
$('formTema').addEventListener('input',function(){ if(!$('tPrompt').hidden) refrescarPrompt(); });
$('formTema').addEventListener('submit',function(e){ e.preventDefault(); });

/* ---------- ideas de tema por categoría (banco local, sin repetir hasta agotar la categoría) ---------- */
var vistas=leer('e3d.ideasVistas',[]), ideaActual=null; if(!Array.isArray(vistas)) vistas=[];
Object.keys(E.IDEAS).forEach(function(n){ var o=document.createElement('option'); o.value=n; $('dlCategorias').appendChild(o); });
$('fCategoria').value=String(leer('e3d.categoria','')||'');
function generarIdea(){
  var txt=$('fCategoria').value.trim(), r=E.generarIdea(txt,vistas);
  guardar('e3d.categoria',txt);
  $('cajaIdea').hidden=false; $('notaIdea').textContent='';
  if(!r){
    ideaActual=null; $('cajaIdea').className='idea sin'; $('bUsarIdea').hidden=true;
    $('ideaCat').textContent='Categoría fuera del banco';
    $('ideaTxt').textContent='No tengo ideas guardadas para «'+txt+'». Copia el prompt de ideas, pídeselas a la IA y escribe en el tema la que más te guste.';
    return;
  }
  ideaActual=r; if(vistas.length>400) vistas.splice(0,vistas.length-400); guardar('e3d.ideasVistas',vistas);
  $('cajaIdea').className='idea'; $('bUsarIdea').hidden=false;
  $('ideaCat').textContent=r.categoria+' · '+(r.restantes ? 'quedan '+r.restantes+' por ver' : 'última de esta categoría');
  $('ideaTxt').textContent=r.idea;
}
$('bIdea').addEventListener('click',generarIdea);
$('fCategoria').addEventListener('keydown',function(e){ if(e.key==='Enter'){ e.preventDefault(); generarIdea(); } });
$('bUsarIdea').addEventListener('click',function(){
  if(!ideaActual) return;
  $('fTema').value=ideaActual.idea; refrescarPrompt(); nota($('notaIdea'),'Tema colocado','ok');
});
$('bPromptIdeas').addEventListener('click',function(){ copiar(E.promptIdeas($('fCategoria').value.trim() || (ideaActual && ideaActual.categoria)),$('notaIdea')); });

/* ---------- paso 2: guion ---------- */
function mensajes(res,avisos){
  var box=$('mensajes'); box.textContent='';
  function caja(clase,titulo,lista){ var d=document.createElement('div'); d.className='msg '+clase; var b=document.createElement('b'); b.textContent=titulo; d.appendChild(b);
    if(lista.length===1){ d.appendChild(document.createTextNode(lista[0])); } else { var ul=document.createElement('ul'); lista.forEach(function(x){ var li=document.createElement('li'); li.textContent=x; ul.appendChild(li); }); d.appendChild(ul); }
    box.appendChild(d); }
  if(res.errores.length){ caja('error','No se pudo cargar',res.errores); return; }
  var todos=res.avisos.concat(avisos||[]);
  caja('ok','Guion cargado',[ S.titulo+' · '+motor.rts.length+' escenas · '+motor.lineas.length+' líneas · '+mmss(motor.dur) ]);
  if(todos.length) caja('aviso','Avisos ('+todos.length+')',todos.slice(0,12));
}
/* aplica el texto del guion + los ajustes actuales al motor */
function cargarTexto(txt,opc){
  opc=opc||{};
  var res=E.leerGuion(txt);
  if(!res.guion){ if(!opc.silencio) mensajes(res); return false; }
  var g=res.guion;
  if(opc.nuevo){                                       // un guion nuevo puede traer su propio ritmo y marca
    if(typeof g.ritmo==='number' && g.ritmo!==0.38) S.ajustes.ritmo=E.clamp(g.ritmo,0.28,0.52);
    if(g.marca && !S.ajustes.marca) S.ajustes.marca=g.marca;
    pintarAjustes();
  }
  g.ritmo=S.ajustes.ritmo; g.marca=S.ajustes.marca||g.marca; g.marcaModo=S.ajustes.marcaModo||'lado'; g.paleta=Object.assign({},g.paleta,S.ajustes.paleta);
  var avisos;
  try{ avisos=motor.cargar(g); }
  catch(e){ res.errores.push('El guion se leyó, pero falló al armar la escena: '+e.message); if(!opc.silencio) mensajes(res); if(window.console) console.error(e); return false; }
  S.texto=txt; S.titulo=g.titulo;
  if(opc.nuevo){ S.t=0; S.playing=!opc.pausado; }
  S.t=Math.min(S.t,motor.dur); S.sucio=true;
  $('scrub').max=motor.dur.toFixed(2);
  $('resumen').textContent=g.titulo+' · '+mmss(motor.dur);
  guardar('e3d.ultimo',txt);
  if(!opc.silencio) mensajes(res,avisos);
  sincronizar(); pintarExportar();
  return true;
}
$('bCargar').addEventListener('click',function(){ var txt=$('tGuion').value; if(!txt.trim()){ mensajes({errores:['Pega primero el JSON del guion.'],avisos:[]}); return; } if(cargarTexto(txt,{nuevo:true}) && window.matchMedia('(max-width:899px)').matches) $('marco').scrollIntoView({behavior:'smooth',block:'start'}); });
$('bLimpiar').addEventListener('click',function(){ $('tGuion').value=''; $('mensajes').textContent=''; $('tGuion').focus(); });
E.EJEMPLOS.forEach(function(ej){ var o=document.createElement('option'); o.value=ej.id; o.textContent=ej.nombre; $('sEjemplo').appendChild(o); });
$('sEjemplo').addEventListener('change',function(){ var id=this.value; if(!id) return; var ej=E.EJEMPLOS.filter(function(x){ return x.id===id; })[0]; var txt=JSON.stringify(ej.guion,null,1); $('tGuion').value=txt; cargarTexto(txt,{nuevo:true}); this.value=''; });

/* ---------- paso 3: ajustes ---------- */
function pintarAjustes(){
  $('rRitmo').value=S.ajustes.ritmo; $('oRitmo').textContent=(+S.ajustes.ritmo).toFixed(2)+' s por palabra'; $('iMarca').value=S.ajustes.marca||''; $('sMarca').value=S.ajustes.marcaModo||'lado'; if($('sMarca').selectedIndex<0) $('sMarca').value='lado';
  Object.keys(COLORES).forEach(function(id){ $(id).value=S.ajustes.paleta[COLORES[id]] || E.PALETA_BASE[COLORES[id]]; });
}
var pend=null;
function aplicarAjustes(){ guardar('e3d.ajustes',S.ajustes); clearTimeout(pend); pend=setTimeout(function(){ if(S.texto) cargarTexto(S.texto,{silencio:true}); },120); }
$('rRitmo').addEventListener('input',function(){ S.ajustes.ritmo=+this.value; $('oRitmo').textContent=(+this.value).toFixed(2)+' s por palabra'; aplicarAjustes(); });
$('iMarca').addEventListener('input',function(){ S.ajustes.marca=this.value.trim().slice(0,28); aplicarAjustes(); });
$('sMarca').addEventListener('change',function(){ S.ajustes.marcaModo=this.value; aplicarAjustes(); });
Object.keys(COLORES).forEach(function(id){ $(id).addEventListener('input',function(){ S.ajustes.paleta[COLORES[id]]=this.value.toLowerCase(); aplicarAjustes(); }); });
$('bRestablecer').addEventListener('click',function(){ S.ajustes={ ritmo:0.38, marca:'', marcaModo:'lado', paleta:{} }; pintarAjustes(); aplicarAjustes(); });

/* ---------- paso 4: exportar, narración, proyectos ---------- */
var senal=null, urlDescarga=null;
function pintarExportar(){
  if(!motor) return;
  $('preNarracion').textContent=motor.guion ? motor.narracion() : '';
  if(!E.puedeExportar()){
    var n=$('notaExp'); $('bExportar').disabled=true; n.className='nota mal'; n.textContent='';
    if(window.isSecureContext===false){            // http: los navegadores solo permiten codificar video en páginas https
      n.appendChild(document.createTextNode('Esta página se abrió por http y el navegador bloquea la exportación en conexiones no seguras. Ábrela por https: '));
      var a=document.createElement('a'); a.href=URL_SEGURA; a.textContent=URL_SEGURA; n.appendChild(a);
    } else n.textContent='Este navegador no puede generar el MP4. Ábrelo en Chrome o Edge actualizados.';
  }
  pintarProyectos();
}
$('bExportar').addEventListener('click',function(){
  if(S.exportando || !motor.guion) return;
  S.exportando=true; S.playing=false; senal={cancelar:false};
  $('bExportar').disabled=true; $('bCancelar').hidden=false; $('aDescarga').hidden=true; $('progreso').hidden=false; $('barraProg').style.width='0%';
  $('notaExp').className='nota'; $('notaExp').textContent='Generando cuadros… deja esta pestaña abierta y visible.';
  var ini=performance.now(), fps=+$('sFps').value;
  E.exportar(motor,{fps:fps},function(p){ $('barraProg').style.width=(p*100).toFixed(1)+'%'; $('notaExp').textContent='Generando cuadros… '+Math.round(p*100)+'%'; },senal).then(function(r){
    if(urlDescarga) URL.revokeObjectURL(urlDescarga);
    urlDescarga=URL.createObjectURL(r.blob);
    var a=$('aDescarga'); a.href=urlDescarga; a.download=slug(S.titulo)+'.mp4'; a.hidden=false; a.click();
    $('notaExp').className='nota ok';
    $('notaExp').textContent='Listo: '+(r.blob.size/1048576).toFixed(1)+' MB, '+r.cuadros+' cuadros en '+Math.round((performance.now()-ini)/1000)+' s.'+(r.codec.indexOf('avc')!==0?' Se usó el códec '+r.codec.split('.')[0]+' porque este equipo no ofrece H.264; si alguna red no lo acepta, conviértelo.':'');
  },function(e){
    $('notaExp').className='nota '+(e.cancelada?'':'mal'); $('notaExp').textContent=e.cancelada?'Exportación cancelada.':'No se pudo exportar: '+e.message;
  }).then(function(){ S.exportando=false; S.sucio=true; $('bExportar').disabled=false; $('bCancelar').hidden=true; $('progreso').hidden=true; ajustarCalidad(true); });
});
$('bCancelar').addEventListener('click',function(){ if(senal) senal.cancelar=true; });
$('bNarracion').addEventListener('click',function(){ copiar($('preNarracion').textContent,$('notaNarr')); });

function proyectos(){ var p=leer('e3d.proyectos',[]); return Array.isArray(p)?p:[]; }
function pintarProyectos(){
  var ul=$('lProyectos'), lista=proyectos(); ul.textContent='';
  if(!lista.length){ var v=document.createElement('li'); v.className='vacio'; v.textContent='Aún no hay guiones guardados en este dispositivo.'; ul.appendChild(v); return; }
  lista.forEach(function(p){
    var li=document.createElement('li'), t=document.createElement('span'), f=document.createElement('small'), b1=document.createElement('button'), b2=document.createElement('button');
    t.className='tit'; t.textContent=p.titulo; f.textContent=p.fecha;
    b1.className='btn sec chico'; b1.type='button'; b1.textContent='Abrir'; b1.addEventListener('click',function(){ $('tGuion').value=p.texto; cargarTexto(p.texto,{nuevo:true}); });
    b2.className='btn sec chico'; b2.type='button'; b2.textContent='Borrar'; b2.setAttribute('aria-label','Borrar '+p.titulo);
    b2.addEventListener('click',function(){ guardar('e3d.proyectos',proyectos().filter(function(x){ return x.id!==p.id; })); pintarProyectos(); });
    li.appendChild(t); li.appendChild(f); li.appendChild(b1); li.appendChild(b2); ul.appendChild(li);
  });
}
$('bGuardar').addEventListener('click',function(){
  if(!S.texto) return;
  var lista=proyectos().filter(function(x){ return x.titulo!==S.titulo; }), d=new Date();
  lista.unshift({ id:String(Date.now()), titulo:S.titulo, fecha:d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2), texto:S.texto });
  if(guardar('e3d.proyectos',lista.slice(0,30))){ nota($('notaGuardar'),'Guardado en este dispositivo','ok'); pintarProyectos(); }
  else nota($('notaGuardar'),'No hay espacio para guardar. Borra algún proyecto.','mal');
});

/* ---------- reproductor ---------- */
function sincronizar(){
  if(!motor) return;
  $('bPlay').textContent = S.playing ? 'Pausa' : (S.t>=motor.dur-0.01 ? 'Repetir' : 'Reproducir');
  $('scrub').value=S.t.toFixed(2); $('reloj').textContent=mmss(S.t)+' / '+mmss(motor.dur);
}
$('bPlay').addEventListener('click',function(){ if(S.exportando) return; if(S.t>=motor.dur-0.01) S.t=0; S.playing=!S.playing; S.sucio=true; sincronizar(); });
$('bInicio').addEventListener('click',function(){ if(S.exportando) return; S.t=0; S.playing=true; S.sucio=true; sincronizar(); });
$('scrub').addEventListener('input',function(){ if(S.exportando) return; S.t=parseFloat(this.value); S.playing=false; S.sucio=true; sincronizar(); });
document.addEventListener('keydown',function(e){ if(e.code!=='Space' || /INPUT|TEXTAREA|SELECT|BUTTON|A/.test(e.target.tagName)) return; e.preventDefault(); $('bPlay').click(); });

var kActual=0;
function ajustarCalidad(forzar){
  if(!motor || S.exportando) return;
  var w=$('marco').clientWidth||360, k=E.clamp(Math.round(w*Math.min(window.devicePixelRatio||1,2)/1080*20)/20,0.3,1);
  if(forzar || Math.abs(k-kActual)>0.04){ kActual=k; motor.calidad(k); S.sucio=true; }
}
window.addEventListener('resize',function(){ ajustarCalidad(false); });
function bucle(ahora){
  var dt=Math.min(0.1,(ahora-S.ultimo)/1000); S.ultimo=ahora;
  if(!S.exportando && motor.guion){
    if(S.playing){ S.t+=dt; if(S.t>=motor.dur){ S.t=motor.dur; S.playing=false; } S.sucio=true; sincronizar(); }
    if(S.sucio && !document.hidden){ S.sucio=false; try{ motor.pintar(S.t); }catch(e){ S.playing=false; if(window.console) console.error(e); } }
  }
  requestAnimationFrame(bucle);
}

/* ---------- arranque ---------- */
function iniciar(){
  try{ motor=new E.Motor(); }
  catch(e){ $('resumen').textContent='Este dispositivo no pudo iniciar los gráficos 3D (WebGL).'; return; }
  motor.conectar($('lienzo'));
  var tema=leer('e3d.tema',null);
  if(tema){ $('fTema').value=tema.tema||''; $('fPublico').value=tema.publico||''; $('fPuntos').value=tema.puntos||''; $('fCierre').value=tema.cierre||''; $('fMarca').value=tema.marca||'';
    ['fDur','fIdioma','fTono'].forEach(function(id,i){ var v=[tema.duracion,tema.idioma,tema.tono][i]; if(v!=null){ $(id).value=String(v); if($(id).selectedIndex<0) $(id).selectedIndex=0; } }); }
  pintarAjustes(); ajustarCalidad(true);
  var reduce=window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ultimo=leer('e3d.ultimo',null), ok=false;
  if(typeof ultimo==='string' && ultimo) { ok=cargarTexto(ultimo,{nuevo:true,silencio:true,pausado:reduce}); if(ok) $('tGuion').value=ultimo; }
  if(!ok){ var txt=JSON.stringify(E.EJEMPLOS[0].guion,null,1); cargarTexto(txt,{nuevo:true,silencio:true,pausado:reduce}); }
  sincronizar();
  S.ultimo=performance.now(); requestAnimationFrame(function(n){ S.ultimo=n; bucle(n); });
}
var fuentes=['600 50px Inter','700 112px Inter','600 34px Inter','500 21px "JetBrains Mono"','700 24px "JetBrains Mono"'];
var listo=false; function arrancar(){ if(listo) return; listo=true; iniciar(); }
if(document.fonts && document.fonts.load){ Promise.all(fuentes.map(function(f){ return document.fonts.load(f,'Añ0'); })).then(arrancar,arrancar); setTimeout(arrancar,2500); } else arrancar();

/* ---------- PWA ---------- */
if('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) window.addEventListener('load',function(){ navigator.serviceWorker.register('sw.js').catch(function(){}); });
var instalar=null;
window.addEventListener('beforeinstallprompt',function(e){ e.preventDefault(); instalar=e; $('bInstalar').hidden=false; });
$('bInstalar').addEventListener('click',function(){ if(!instalar) return; instalar.prompt(); instalar=null; this.hidden=true; });

E.app={ estado:S, cargar:function(txt){ return cargarTexto(txt,{nuevo:true}); }, motor:function(){ return motor; } };
})();
