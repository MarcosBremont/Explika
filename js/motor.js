/* Explika · motor
   Lee un guion ya normalizado (ver guion.js), arma las escenas 3D y dibuja cualquier instante t
   en un lienzo 2D de 1080x1920 (3D + subtítulos + estado + etiquetas + iconos).
   Todo es función pura del tiempo: pintar(t) siempre da el mismo cuadro, por eso se puede exportar cuadro a cuadro. */
(function(){
'use strict';
var E=window.E3D, G=E.G, V3=THREE.Vector3, W=1080, H=1920, PI=Math.PI;
var clamp=E.clamp, seg=E.seg, smooth=E.smooth, eio=E.eio, lerp=E.lerp, pop=E.pop, fade=E.fade;
function num(v,d){ return typeof v==='number' && isFinite(v) ? v : d; }
function smoother(x){ return x*x*x*(x*(6*x-15)+10); }

var TAN_H=0.145, TAN_V=0.175;      // encuadre útil: deja aire a los lados y el tercio inferior para la interfaz
var PLANOS={ detalle:{k:0.62,ke:0.45,el:10}, primer_plano:{k:1.0,ke:0.7,el:12}, medio:{k:1.5,ke:1.0,el:14},
             general:{k:2.6,ke:1.5,el:18}, aereo:{k:3.0,ke:1.8,el:46}, cenital:{k:2.6,ke:1.6,el:76} };
var ANGULOS={ frente:0, derecha:30, izquierda:-30, lateral:78, lateral_izquierda:-78, atras:180 };
var FUENTE={ cap:'600 50px Inter, system-ui, sans-serif', lab:'600 34px Inter, system-ui, sans-serif',
  sub:'500 21px "JetBrains Mono", ui-monospace, monospace', pil:'700 24px "JetBrains Mono", ui-monospace, monospace',
  datoSub:'500 26px "JetBrains Mono", ui-monospace, monospace', marca:'600 30px Inter, system-ui, sans-serif' };
/* posiciones de la marca de agua [x, y, alineación]: libres de etiquetas, iconos, estado y subtítulos */
var MARCA_POS={ lado:[68,1236,'left'], centro:[540,1150,'center'] };
var MARCA_RUTA=[ [68,1236,'left'], [1012,236,'right'], [540,1150,'center'], [68,236,'left'], [1012,1236,'right'] ];
var TXT='#eef1f5', TENUE='#8a96a8', PILDORA='#080b10';
E.PLANOS=PLANOS; E.ANGULOS=ANGULOS;

/* ---------- anillos que pulsan (siempre de cara a la cámara) ---------- */
var RING_GEO=null;
function RingSet(parent,color,n){
  if(!RING_GEO) RING_GEO=new THREE.RingGeometry(0.982,1,72);
  this.m=[];
  for(var i=0;i<n;i++){
    var mat=E.glow(color,{side:THREE.DoubleSide, depthTest:false}), r=new THREE.Mesh(RING_GEO, mat);
    mat.userData.uW={value:0.018};
    /* el borde interior se recalcula en el shader para que el trazo mida lo mismo en pantalla a cualquier tamaño */
    mat.onBeforeCompile=(function(u){ return function(sh){ sh.uniforms.uW=u;
      sh.vertexShader=sh.vertexShader.replace('void main() {','uniform float uW;\nvoid main() {')
        .replace('#include <begin_vertex>','#include <begin_vertex>\n  transformed.xy = normalize( position.xy ) * ( 1.0 - step( length( position.xy ), 0.99 ) * uW );'); }; })(mat.userData.uW);
    r.renderOrder=5; r.visible=false; parent.add(r); this.m.push(r);
  }
}
RingSet.prototype.set=function(cam,pos,alpha,phase,r0,r1){
  for(var i=0,n=this.m.length;i<n;i++){
    var r=this.m[i], u=(((phase+i/n)%1)+1)%1;
    r.visible=alpha>0.01; if(!r.visible) continue;
    var sc=Math.max(lerp(r0,r1,u),1e-4);
    r.position.copy(pos); r.scale.setScalar(sc); r.quaternion.copy(cam.quaternion);
    r.material.userData.uW.value=clamp(cam.position.distanceTo(pos)*0.0014/sc,0.003,0.6);
    r.material.opacity=alpha*(1-u)*Math.min(1,u*8);
  }
};
RingSet.prototype.hide=function(){ for(var i=0;i<this.m.length;i++) this.m[i].visible=false; };

var DOMO_GEO=null;
function domoGeo(){
  if(DOMO_GEO) return DOMO_GEO;
  var g=new THREE.Group(), m=new THREE.MeshBasicMaterial(), i, t;
  for(i=0;i<5;i++){ var a=i/5*PI/2; t=new THREE.Mesh(new THREE.TorusGeometry(Math.cos(a), 0.0045, 4, 56), m); t.rotation.x=PI/2; t.position.y=Math.sin(a); g.add(t); }
  for(i=0;i<8;i++){ t=new THREE.Mesh(new THREE.TorusGeometry(1,0.0045,4,28,PI), m); t.rotation.y=i/8*PI; g.add(t); }
  E.fusionar(g,false); DOMO_GEO=g.children[0].geometry; return DOMO_GEO;
}

/* ---------- referencias: "id" o "id.ancla" ---------- */
function resolver(rt,nombre){
  if(nombre==null) return null;
  if(Array.isArray(nombre)) return { punto:new V3(num(nombre[0],0),num(nombre[1],0),num(nombre[2],0)) };
  var s=String(nombre), i=s.indexOf('.'), id=i<0?s:s.slice(0,i), an=i<0?null:s.slice(i+1), o=rt.objs[id];
  if(!o) return null;
  return { obj:o, ancla: an ? (o.anclas[an]||null) : null };
}
function posRef(ref,out){
  if(ref.punto) return out.copy(ref.punto);
  if(ref.ancla) return ref.ancla.getWorldPosition(out);
  return ref.obj.node.localToWorld(out.copy(ref.obj.centro));
}
function radioRef(ref){ if(ref.punto) return 0.4; if(ref.ancla) return 0.13*ref.obj.esc0; return ref.obj.radio*Math.max(ref.obj.sc||ref.obj.esc0,0.001); }

/* =====================================================================
   Motor
   ===================================================================== */
function Motor(){
  this.gl=document.createElement('canvas');
  this.renderer=new THREE.WebGLRenderer({ canvas:this.gl, antialias:true, preserveDrawingBuffer:true });
  this.renderer.setPixelRatio(1);
  this.scene=new THREE.Scene(); this.scene.fog=new THREE.Fog(0x0f141c,8,30);
  this.camera=new THREE.PerspectiveCamera(38,9/16,0.05,900);
  this.camera.setViewOffset(W,H,0,230,W,H);          // sube el sujeto: el tercio inferior es para la interfaz
  this.scene.add(new THREE.HemisphereLight(0xe6ebf4,0x0a0d12,0.66));
  var sun=new THREE.DirectionalLight(0xffffff,0.62); sun.position.set(5,9,7); this.scene.add(sun);
  this.raiz=new THREE.Group(); this.scene.add(this.raiz);
  this.out=null; this.ctx=null; this.k=1; this.guion=null; this.dur=0; this.rts=[]; this.estados=[]; this.lineas=[];
}
Motor.prototype.conectar=function(canvas){ this.out=canvas; this.ctx=canvas.getContext('2d'); this.calidad(this.k); };
Motor.prototype.calidad=function(k){
  k=clamp(k,0.2,1); this.k=k;
  var w=k>=0.999?W:Math.round(W*k/2)*2, h=k>=0.999?H:Math.round(w*16/9/2)*2;
  this.renderer.setSize(w,h,false);
  if(this.out){ this.out.width=w; this.out.height=h; }
  this.vig=null;
};
Motor.prototype.liberar=function(){
  var self=this;
  this.raiz.traverse(function(o){ if(o.geometry && o.geometry!==RING_GEO && o.geometry!==DOMO_GEO) o.geometry.dispose(); if(o.material && o.material.dispose) o.material.dispose(); });
  while(this.raiz.children.length) this.raiz.remove(this.raiz.children[0]);
  this.rts=[]; this.estados=[]; this.lineas=[]; this.guion=null; this.dur=0; self.anchos={};
};
Motor.prototype.reiniciar=function(){ this.rts.forEach(function(rt){ rt.etiquetas.forEach(function(L){ L._lado=null; }); }); };

/* ---------- tiempos: cada línea dura según sus palabras ---------- */
function tiempos(g){
  var t=0.5, R=clamp(num(g.ritmo,0.38),0.2,0.8), n=g.escenas.length;
  g.escenas.forEach(function(s,si){
    s.corte = si===0 ? 0 : t-0.25;
    s.lineas.forEach(function(l){
      var w=String(l.texto).split(/\s+/).filter(Boolean); l.palabras=w;
      var d = num(l.segundos,0)>0 ? l.segundos : Math.max(0.8, w.length*R+0.2);
      l.t0=t; l.t1=t+d; t+=d;
      t += num(l.pausa,-1)>=0 ? l.pausa : (/[.?!…]$/.test(l.texto) ? 0.45 : (/[:,;]$/.test(l.texto) ? 0.12 : 0));
    });
    t+=0.55;
  });
  g.dur = t-0.55+0.9;
  g.escenas.forEach(function(s,si){ s.fin = si<n-1 ? g.escenas[si+1].corte : g.dur; });
}

Motor.prototype.cargar=function(g){
  var self=this, avisos=[];
  this.liberar();
  E.paleta=Object.assign({}, E.PALETA_BASE, g.paleta||{});
  this.fondo=new THREE.Color(E.paleta.fondo); this.renderer.setClearColor(this.fondo); this.scene.fog.color.copy(this.fondo);
  this.mats=new E.Mats();
  tiempos(g);
  this.guion=g; this.dur=g.dur;
  g.escenas.forEach(function(s,si){ self.rts.push(armarEscena(self,s,si,avisos)); s.lineas.forEach(function(l){ self.lineas.push(l); }); });
  this.estados.sort(function(a,b){ return a.t-b.t; });
  if(!this.estados.length || this.estados[0].t>0.01) this.estados.unshift({t:0,texto:'',color:'gris'});
  return avisos;
};

/* ---------- escena ---------- */
function armarEscena(M,s,si,avisos){
  var rt={ def:s, i:si, grupo:new THREE.Group(), objs:{}, lista:[], fx:[], etiquetas:[], iconos:[], datos:[] };
  rt.grupo.visible=false; M.raiz.add(rt.grupo);
  var en=E.ENTORNOS[s.entorno]||E.ENTORNOS.vacio, eg=new THREE.Group(); rt.grupo.add(eg);
  rt.meta=en.build(eg, M.mats, E.rng(1000+si*77)) || {};
  (s.objetos||[]).forEach(function(d){ crearObj(M,rt,d,avisos); });
  rt.lista.forEach(function(o){ colocar(rt,o,avisos,0); });
  rt.lista.forEach(function(o){ o.ultima=o.pos0.clone(); evalObj(o,-1); });
  rt.grupo.updateMatrixWorld(true);

  // caja de la escena (para planos "de escena")
  var box=new THREE.Box3(), tmp=new V3(), ext=new V3(), hay=false;
  rt.lista.forEach(function(o){ if(o.enMano) return; tmp.copy(o.centro).multiplyScalar(o.esc0).add(o.pos0); ext.set(o.hw*o.esc0,o.hh*o.esc0,o.hw*o.esc0);
    box.expandByPoint(tmp.clone().add(ext)); box.expandByPoint(tmp.clone().sub(ext)); hay=true; });
  if(!hay){ box.set(new V3(-2,0,-2), new V3(2,2,2)); }
  rt.centro=box.getCenter(new V3()); var sz=box.getSize(new V3());
  rt.fit=Math.max(3.2, Math.max(sz.x,sz.z)/2/TAN_H, sz.y/2/TAN_V);

  if(s.estado && s.estado.texto) M.estados.push({ t:s.corte, texto:String(s.estado.texto).toUpperCase(), color:s.estado.color||'gris' });
  s.lineas.forEach(function(l,li){ (l.efectos||[]).forEach(function(fx){ compilarFx(M,rt,l,li,fx,avisos); }); });
  rt.cam=compilarCamara(rt,s,avisos);

  // ranuras de iconos (máximo 3 a la vez; el más viejo cede su lugar)
  rt.iconos.sort(function(a,b){ return a.t0-b.t0; });
  var activos=[];
  rt.iconos.forEach(function(ic){
    activos=activos.filter(function(x){ return x.t1>ic.t0+0.05; });
    var libres=[0,1,2].filter(function(sl){ return !activos.some(function(x){ return x.slot===sl; }); });
    if(libres.length) ic.slot=libres[0];
    else { var viejo=activos.shift(); viejo.t1=ic.t0+0.25; ic.slot=viejo.slot; }
    activos.push(ic);
  });
  return rt;
}

function crearObj(M,rt,d,avisos){
  var pr=E.PROPS[d.tipo];
  if(!pr){ avisos.push('Escena '+(rt.i+1)+': el objeto "'+d.id+'" pide el tipo "'+d.tipo+'", que no está en la biblioteca. Usé un cubo.'); pr=E.PROPS.cubo; }
  var mm=M.mats.paraObjeto(d,pr), inner=pr.build(d,mm,E.rng(E.hash(d.id)+rt.i*13),M.mats), anclas=inner.userData.anclas||{};
  if(!pr.rig) E.fusionar(inner,false);
  var node=new THREE.Group(); node.add(inner); rt.grupo.add(node);
  var p=d.pos||[0,0,0]; if(p.length===2) p=[p[0],0,p[1]];
  var o={ id:d.id, def:d, prop:pr, node:node, inner:inner, anclas:anclas, mat:mm.main,
    esc0:clamp(num(d.escala,1),0.01,300), pos0:new V3(num(p[0],0),num(p[1],0),num(p[2],0)), yaw0:(Array.isArray(d.rot)?num(d.rot[1],0):num(d.rot,0))*PI/180, oculto:!!d.oculto,
    mov:[], esc:[], vis:[], col:[], res:[], anim:[{t0:-9, n:d.anim||'quieto'}], sc:1 };
  node.rotation.order='YXZ'; if(Array.isArray(d.rot)){ node.rotation.x=num(d.rot[0],0)*PI/180; node.rotation.z=num(d.rot[2],0)*PI/180; }
  if(pr.pose) pr.pose(o,o.anim[0].n,0,0);
  inner.updateMatrixWorld(true);
  var box=new THREE.Box3().setFromObject(inner), size=box.getSize(new V3());
  if(!isFinite(size.x)){ box.set(new V3(-0.5,0,-0.5), new V3(0.5,1,0.5)); size.set(1,1,1); }
  o.centro=box.getCenter(new V3()); o.apoyo = pr.apoyo!=null ? pr.apoyo : box.max.y;
  o.hw=Math.max(size.x,size.z,0.02)/2; o.hh=Math.max(size.y,0.02)/2; o.radio=Math.max(0.04, size.length()/2*0.8);
  o.col0=mm.main.color.clone(); o.ei0=(mm.main.emissive.r+mm.main.emissive.g+mm.main.emissive.b)>0 ? mm.main.emissiveIntensity : 0;
  rt.objs[d.id]=o; rt.lista.push(o);
}
function colocar(rt,o,avisos,nivel){
  if(o._col || nivel>8) return; o._col=true;
  var d=o.def;
  if(d.en_mano){
    var s=String(d.en_mano), ref=resolver(rt, s.indexOf('.')<0 ? s+'.mano_der' : s);
    if(ref && ref.ancla){ ref.ancla.add(o.node); o.enMano=true; o.pos0.set(0,0,0); o.inner.position.sub(o.centro); o.centro.set(0,0,0); if(o.prop.mano){ o.node.rotation.x=o.prop.mano[0]; o.node.rotation.z=o.prop.mano[2]; o.yaw0+=o.prop.mano[1]; } }
    else avisos.push('Escena '+(rt.i+1)+': "'+o.id+'" pide en_mano "'+d.en_mano+'", pero no es una persona de la escena.');
  } else if(d.sobre){
    var b=rt.objs[d.sobre];
    if(b && b!==o){ colocar(rt,b,avisos,nivel+1); o.pos0.x+=b.pos0.x; o.pos0.z+=b.pos0.z; o.pos0.y+=b.pos0.y+b.apoyo*b.esc0; }
    else avisos.push('Escena '+(rt.i+1)+': "'+o.id+'" pide estar sobre "'+d.sobre+'", que no existe.');
  }
}

/* ---------- estado de un objeto en el instante t ---------- */
var tC=new THREE.Color(), tE=new THREE.Euler(), tV=new V3();
function lerpAng(a,b,u){ var d=((b-a+PI)%(2*PI)+2*PI)%(2*PI)-PI; return a+d*u; }
function evalObj(o,t){
  var x=o.pos0.x,y=o.pos0.y,z=o.pos0.z, yaw=o.yaw0, moving=false, i, s, u;
  for(i=0;i<o.mov.length;i++){
    s=o.mov[i]; if(t<=s.t0) break;
    u=seg(t,s.t0,s.t0+s.dur);
    if(o.prop.orienta){ var dx=s.to.x-x, dz=s.to.z-z; if(dx*dx+dz*dz>0.01){ var ya=o.prop.frente==='x' ? Math.atan2(-dz,dx) : Math.atan2(dx,dz); yaw=lerpAng(yaw,ya,smooth(seg(t,s.t0,s.t0+0.35))); } }
    if(u>0 && u<1) moving=true;
    u=smooth(u); x=lerp(x,s.to.x,u); y=lerp(y,s.to.y,u); z=lerp(z,s.to.z,u);
  }
  var sc=o.esc0;
  for(i=0;i<o.esc.length;i++){ s=o.esc[i]; if(t<=s.t0) break; sc=lerp(sc,o.esc0*s.to,eio(seg(t,s.t0,s.t0+s.dur))); }
  var v=o.oculto?0:1;
  for(i=0;i<o.vis.length;i++){ s=o.vis[i]; if(t<=s.t0) break; u=seg(t,s.t0,s.t0+0.4); v = s.on ? lerp(v,1,pop(u)) : lerp(v,0,smooth(u)); }
  for(i=0;i<o.res.length;i++) sc*=1+0.16*Math.sin(PI*seg(t,o.res[i],o.res[i]+0.5));
  var an=o.anim[0]; for(i=1;i<o.anim.length;i++) if(t>=o.anim[i].t0) an=o.anim[i];
  var nombre=an.n, tt=Math.max(0,t-Math.max(an.t0,0));
  if(o.prop.pose){ if(moving && nombre==='quieto') nombre='caminar'; o.prop.pose(o,nombre,tt,Math.max(t,0)); }
  else {
    var rot=0;
    if(nombre==='girar') rot=tt*1.1;
    else if(nombre==='flotar') y+=Math.sin(t*1.4+o.pos0.x)*0.09*o.radio*o.esc0;
    else if(nombre==='latir') sc*=1+Math.pow(Math.max(0,Math.sin(t*6.5)),6)*0.08+Math.pow(Math.max(0,Math.sin(t*6.5-0.9)),6)*0.045;
    else if(nombre==='vibrar') x+=Math.sin(t*42)*0.012*o.radio*o.esc0;
    if(!o.enMano){
      tE.set(0,0,0); tE[o.prop.eje||'y']=rot; o.inner.rotation.copy(tE);
      if(rot){ tV.copy(o.centro).applyEuler(tE); o.inner.position.copy(o.centro).sub(tV); } else o.inner.position.set(0,0,0);
    }
  }
  if(!o.enMano) o.node.position.set(x,y,z);
  o.node.rotation.y=yaw;
  o.sc=sc*v; o.node.visible=v>0.01; o.node.scale.setScalar(Math.max(o.sc,1e-4));
  if(o.col.length){
    tC.copy(o.col0); var ei=o.ei0, any=0;
    for(i=0;i<o.col.length;i++){ s=o.col[i]; if(t<=s.t0) break; u=smooth(seg(t,s.t0,s.t0+0.45)); tC.lerp(s.c,u); ei=lerp(ei,0.2,u); any=1; }
    o.mat.color.copy(tC); if(any || o.ei0>0){ o.mat.emissive.copy(tC); o.mat.emissiveIntensity=ei; }
  }
}

/* ---------- efectos de una línea ---------- */
function compilarFx(M,rt,l,li,fx,avisos){
  var s=rt.def, t0=l.t0+clamp(num(fx.retraso,0),0,20), col=E.color(fx.color,'azul'), donde='Escena '+(rt.i+1)+', "'+String(l.texto).slice(0,24)+'": ';
  function hasta(nDef){
    var d=fx.dura; if(d==null) d=nDef;
    if(d==='escena') return s.fin; if(d==='linea') d=1;
    d=Math.max(1,d|0); var j=li+d-1;
    return j>=s.lineas.length-1 ? s.fin : Math.min(s.fin, s.lineas[j].t1+0.35);
  }
  function ref(n){ var r=resolver(rt,n); if(!r) avisos.push(donde+'el efecto "'+fx.tipo+'" apunta a "'+n+'", que no existe en la escena.'); return r; }
  function obj(n){ var o=rt.objs[String(n==null?'':n).split('.')[0]]; if(!o) avisos.push(donde+'el efecto "'+fx.tipo+'" usa el objeto "'+n+'", que no existe en la escena.'); return o; }
  var r, r2, o, b;
  switch(fx.tipo){
    case 'estado': M.estados.push({ t:t0, texto:String(fx.texto||'').toUpperCase(), color:fx.color||'gris' }); break;
    case 'etiqueta': r=ref(fx.en); if(r) rt.etiquetas.push({ t0:t0+0.1, t1:hasta(2), ref:r, titulo:String(fx.titulo||fx.texto||''), sub:String(fx.sub||'').toUpperCase(), color:E.nombreColor(fx.color)==='gris'?TENUE:col }); break;
    case 'icono':
      if(!E.ICONOS[fx.icono]) avisos.push(donde+'el icono "'+fx.icono+'" no existe. Usé el de información.');
      rt.iconos.push({ t0:t0, t1:hasta('escena'), icono:fx.icono, color:fx.color?col:null, tachado:!!fx.tachado }); break;
    case 'dato': rt.datos.push({ t0:t0, t1:hasta(2), texto:String(fx.texto||''), sub:String(fx.sub||'').toUpperCase(), color:col }); break;
    case 'anillos': r=ref(fx.en); if(r) rt.fx.push(fxAnillos(M,rt,r,t0,hasta('escena'),col,fx)); break;
    case 'domo': r=ref(fx.en); if(r) rt.fx.push(fxDomo(M,rt,r,t0,hasta('escena'),col,fx)); break;
    case 'linea': r=ref(fx.de); r2=ref(fx.a); if(r&&r2) rt.fx.push(fxLinea(M,rt,r,r2,t0,hasta('escena'),col,fx)); break;
    case 'haz': r=ref(fx.en); if(r) rt.fx.push(fxLinea(M,rt,r,null,t0,hasta('escena'),col,fx)); break;
    case 'pin': r=ref(fx.en); if(r) rt.fx.push(fxPin(M,rt,r,t0,hasta('escena'),col,fx)); break;
    case 'particulas': r=ref(fx.de); r2=ref(fx.a); if(r&&r2) rt.fx.push(fxParticulas(M,rt,r,r2,t0,hasta('escena'),col,fx)); break;
    case 'mover':
      o=obj(fx.obj); if(!o) break;
      if(o.enMano){ avisos.push(donde+'"'+o.id+'" va en la mano de una persona; mueve a la persona.'); break; }
      var to=o.ultima.clone();
      if(Array.isArray(fx.a)){ var a=fx.a.length===2?[fx.a[0],o.ultima.y,fx.a[1]]:fx.a; to.set(num(a[0],0),num(a[1],0),num(a[2],0)); }
      else if(Array.isArray(fx.por)){ to.x+=num(fx.por[0],0); to.y+=num(fx.por[1],0); to.z+=num(fx.por[2],0); }
      else if(fx.hacia!=null){ b=obj(fx.hacia); if(!b) break; var d=new V3(b.ultima.x-o.ultima.x,0,b.ultima.z-o.ultima.z), L=d.length(), gap=b.hw*b.esc0+o.hw*o.esc0+0.2;
        if(L>gap){ d.multiplyScalar((L-gap)/L); to.x+=d.x; to.z+=d.z; } }
      else { avisos.push(donde+'"mover" necesita "a", "por" o "hacia".'); break; }
      o.mov.push({ t0:t0, dur:clamp(num(fx.segundos, Math.max(1.2,l.t1-l.t0)),0.2,30), to:to }); o.ultima=to.clone(); break;
    case 'aparecer': o=obj(fx.obj); if(o) o.vis.push({t0:t0,on:true}); break;
    case 'desaparecer': o=obj(fx.obj); if(o) o.vis.push({t0:t0,on:false}); break;
    case 'escala': o=obj(fx.obj); if(o) o.esc.push({ t0:t0, dur:clamp(num(fx.segundos,0.9),0.1,20), to:clamp(num(fx.factor,1.3),0.01,50) }); break;
    case 'color': o=obj(fx.obj); if(o) o.col.push({ t0:t0, c:new THREE.Color(E.color(fx.color)) }); break;
    case 'animar': o=obj(fx.obj); if(o) o.anim.push({ t0:t0, n:String(fx.anim||'quieto') }); break;
    case 'resaltar': o=obj(fx.obj); if(o) o.res.push(t0); break;
    case 'camara': break;                                    // se procesa en compilarCamara
    default: avisos.push(donde+'no conozco el efecto "'+fx.tipo+'". Lo ignoré.');
  }
}

function fxAnillos(M,rt,ref,t0,t1,color,fx){
  var rs=new RingSet(rt.grupo,color,3), p=new V3(), k=clamp(num(fx.tam,1),0.1,20);
  return { t0:t0, t1:t1, off:function(){ rs.hide(); },
    upd:function(t,a){ posRef(ref,p); var R=radioRef(ref)*k; rs.set(M.camera,p,a*0.95,(t-t0)*0.4,R*0.55,R*1.9); } };
}
function fxDomo(M,rt,ref,t0,t1,color,fx){
  var mat=E.glow(color,{opacity:0.6}), mesh=new THREE.Mesh(domoGeo(),mat), p=new V3(), Rb=num(fx.radio,0), un={ uThick:{value:0.0008}, uInv:{value:1} };
  /* las líneas del domo se ensanchan con la distancia para verse igual de finas de cerca y de lejos */
  mat.onBeforeCompile=function(sh){
    sh.uniforms.uThick=un.uThick; sh.uniforms.uInv=un.uInv;
    sh.vertexShader=sh.vertexShader.replace('void main() {','uniform float uThick;\nuniform float uInv;\nvoid main() {')
      .replace('#include <begin_vertex>','#include <begin_vertex>\n  vec4 mvE = modelViewMatrix * vec4( position, 1.0 );\n  transformed += normalize( normal ) * ( uThick * max( -mvE.z, 0.0 ) * uInv - 0.0045 );');
  };
  mesh.visible=false; mesh.frustumCulled=false; rt.grupo.add(mesh);
  return { t0:t0, t1:t1, off:function(){ mesh.visible=false; },
    upd:function(t,a){ posRef(ref,p); var o=ref.obj, R=Rb>0?Rb:Math.max(2.5,(o?o.radio*o.esc0:0.5)*4);
      var y = rt.meta.sinSuelo ? p.y : (o && !o.enMano && !ref.ancla ? o.node.position.y : 0);
      var sc=Math.max(R*eio(seg(t,t0,t0+0.9)),0.001); un.uInv.value=1/sc;
      mesh.visible=true; mesh.position.set(p.x,y,p.z); mesh.scale.setScalar(sc); mat.opacity=0.62*a; } };
}
/* línea entre dos referencias; si rb es null es un haz vertical hacia el cielo */
function fxLinea(M,rt,ra,rb,t0,t1,color,fx){
  var geo=new THREE.CylinderGeometry(1,1,1,6); geo.translate(0,0.5,0);
  var mat=E.glow(color,{depthTest:!rb}), mesh=new THREE.Mesh(geo,mat), dots=[], i, n=rb?1:3;   // las líneas entre objetos se dibujan por encima, como en un diagrama
  mesh.renderOrder=4;
  mesh.visible=false; mesh.frustumCulled=false; rt.grupo.add(mesh);
  for(i=0;i<n;i++){ var d=new THREE.Mesh(new THREE.SphereGeometry(1,8,6), E.glow(0xdfeaff,{depthTest:!rb})); d.renderOrder=6; d.visible=false; rt.grupo.add(d); dots.push(d); }
  var a=new V3(), b=new V3(), dir=new V3(), UP=new V3(0,1,0);
  function off(){ mesh.visible=false; for(var j=0;j<dots.length;j++) dots[j].visible=false; }
  return { t0:t0, t1:t1, off:off,
    upd:function(t,al){
      posRef(ra,a); if(rb) posRef(rb,b); else { if(ra.obj && !ra.ancla) a.y+=ra.obj.hh*ra.obj.sc; b.copy(a); b.y+=70; }
      dir.subVectors(b,a); var L=dir.length(); if(L<1e-4){ off(); return; } dir.multiplyScalar(1/L);
      var g=eio(seg(t,t0,t0+(rb?0.5:0.9))), th=M.camera.position.distanceTo(a)*0.00085*(rb?1:1.5);
      mesh.visible=true; mesh.position.copy(a); mesh.quaternion.setFromUnitVectors(UP,dir); mesh.scale.set(th,Math.max(L*g,1e-4),th); mat.opacity=al*0.95;
      for(var j=0;j<dots.length;j++){
        var dd=dots[j], on=fx.pulso!==false && g>=1; dd.visible=on; if(!on) continue;
        var u=(((t-t0)*(rb?0.8:0.35)+j/dots.length)%1+1)%1, Lu=rb?L:Math.min(L,14);
        dd.position.copy(a).addScaledVector(dir,Lu*u); dd.scale.setScalar(th*2.7); dd.material.opacity=al*Math.sin(PI*u);
      } } };
}
function fxPin(M,rt,ref,t0,t1,color,fx){
  var m=E.mat(color,{emissive:color, emissiveIntensity:0.45}), g=new THREE.Group(), p=new V3();
  G.sph(0.34,m,0,1.0,0,g,12,8); G.cone(0.21,0.66,m,0,0.36,0,g,10).rotation.x=PI;
  var c=E.mat(0x0b1018); G.sph(0.13,c,0,1.0,0.26,g,8,6); G.sph(0.13,c,0,1.0,-0.26,g,8,6);
  E.fusionar(g,false); g.visible=false; rt.grupo.add(g);
  return { t0:t0, t1:t1, off:function(){ g.visible=false; },
    upd:function(t,a){ posRef(ref,p); var R=radioRef(ref), s=clamp(R*0.45,0.1,2.5)*clamp(num(fx.tam,1),0.2,5), top=ref.obj && !ref.ancla ? ref.obj.hh*ref.obj.sc : R;
      g.visible=true; g.position.set(p.x, p.y+top+s*0.18+Math.sin(t*2.2)*s*0.06, p.z);
      g.rotation.y=Math.atan2(M.camera.position.x-p.x, M.camera.position.z-p.z);
      g.scale.setScalar(Math.max(s*pop(seg(t,t0,t0+0.4))*a,1e-4)); } };
}
function fxParticulas(M,rt,ra,rb,t0,t1,color,fx){
  var n=22, mat=E.mat(color,{emissive:color, emissiveIntensity:0.4}), im=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),mat,n);
  im.frustumCulled=false; im.visible=false; rt.grupo.add(im);
  var R=E.rng(77+rt.fx.length*31), seeds=[], i; for(i=0;i<n;i++) seeds.push([i/n+R()*0.03,R()-0.5,R()-0.5,R()*6]);
  var a=new V3(), b=new V3(), c=new V3(), dm=new THREE.Object3D();
  return { t0:t0, t1:t1, off:function(){ im.visible=false; },
    upd:function(t,al){
      posRef(ra,a); posRef(rb,b); var L=a.distanceTo(b); c.addVectors(a,b).multiplyScalar(0.5); c.y+=L*0.28;
      var size=clamp(L*0.024,0.012,0.6)*clamp(num(fx.tam,1),0.2,5), vel=(t-t0)*0.45;
      im.visible=true;
      for(var j=0;j<n;j++){
        var sd=seeds[j], raw=vel-sd[0], u=((raw%1)+1)%1, e=smooth(u), q=1-e, w=Math.sin(PI*u)*L*0.07;
        dm.position.set(q*q*a.x+2*q*e*c.x+e*e*b.x+sd[1]*w, q*q*a.y+2*q*e*c.y+e*e*b.y+sd[2]*w, q*q*a.z+2*q*e*c.z+e*e*b.z+sd[1]*w);
        dm.scale.setScalar(raw<0 ? 1e-4 : Math.max(1e-4, size*al*Math.min(1,u*6)*Math.min(1,(1-u)*7)));
        dm.rotation.set(t*2+sd[3], t*1.6+sd[3]*2, 0); dm.updateMatrix(); im.setMatrixAt(j,dm.matrix);
      }
      im.instanceMatrix.needsUpdate=true; } };
}

/* ---------- cámara ---------- */
function poseDe(rt,c,avisos){
  c=c||{}; var pl=PLANOS[c.plano]||PLANOS.medio, ref=null;
  if(c.objetivo!=null && c.objetivo!=='escena'){ ref=resolver(rt,c.objetivo); if(!ref) avisos.push('Escena '+(rt.i+1)+': la cámara apunta a "'+c.objetivo+'", que no existe. Enfoqué la escena completa.'); }
  var az = typeof c.angulo==='number' ? c.angulo : (ANGULOS[c.angulo]!=null ? ANGULOS[c.angulo] : 26);
  return { ref:ref, k:pl.k, ke:pl.ke, az:az*PI/180, el:(typeof c.altura==='number'?c.altura:pl.el)*PI/180, zoom:clamp(num(c.zoom,1),0.3,4) };
}
function compilarCamara(rt,s,avisos){
  var keys=[{ t:s.corte, p:poseDe(rt, s.camara||{plano:'general'}, avisos) }];
  s.lineas.forEach(function(l){
    var c=l.camara; (l.efectos||[]).forEach(function(f){ if(f.tipo==='camara') c=f; });
    if(c) keys.push({ desde:l.t0, t:l.t0+clamp(num(c.segundos,1.6),0.2,10), p:poseDe(rt,c,avisos) });
  });
  if(s.camara_fin) keys.push({ desde:Math.min(keys[keys.length-1].t, s.fin-0.5), t:s.fin, p:poseDe(rt,s.camara_fin,avisos) });
  return keys;
}
function evalPose(rt,p,out){
  if(p.ref){
    posRef(p.ref,out.c); var o=p.ref.obj;
    var fit = p.ref.punto ? 3 : (p.ref.ancla ? 0.9*o.esc0 : Math.max(o.hw/TAN_H, o.hh/TAN_V)*o.esc0);
    out.dist=fit*p.k/p.zoom;
  } else { out.c.copy(rt.centro); out.dist=rt.fit*p.ke/p.zoom; }
  out.az=p.az; out.el=p.el;
}
var PA={c:new V3()}, PB={c:new V3()}, camP=new V3();
function camara(M,rt,t){
  var keys=rt.cam, s=rt.def, i;
  evalPose(rt,keys[0].p,PA);
  for(i=1;i<keys.length;i++){
    var k=keys[i], st=k.desde!=null?k.desde:keys[i-1].t; if(t<=st) break;
    evalPose(rt,k.p,PB); var u=smoother(seg(t,st,k.t));
    PA.c.lerp(PB.c,u); PA.dist=Math.exp(lerp(Math.log(PA.dist),Math.log(PB.dist),u)); PA.az=lerp(PA.az,PB.az,u); PA.el=lerp(PA.el,PB.el,u);
  }
  PA.az += (rt.i%2?-1:1)*Math.min(0.3,(t-s.corte)*0.02);              // deriva lenta: la cámara nunca se queda quieta
  PA.dist *= 1-0.05*smooth(seg(t,s.corte,s.fin));
  if(rt.meta.interior) PA.az=clamp(PA.az,-0.45,1.25);
  PA.el=clamp(PA.el,0.03,1.45); PA.dist=clamp(PA.dist,0.3,rt.meta.maxDist||90);
  var ce=Math.cos(PA.el);
  camP.set(PA.c.x+PA.dist*Math.sin(PA.az)*ce, PA.c.y+PA.dist*Math.sin(PA.el), PA.c.z+PA.dist*Math.cos(PA.az)*ce);
  var d=PA.dist*0.012; camP.x+=Math.sin(t*0.53)*d; camP.y+=Math.sin(t*0.41+1)*d*0.7; camP.z+=Math.cos(t*0.47)*d;
  if(!rt.meta.sinSuelo && camP.y<0.22) camP.y=0.22;
  M.camera.position.copy(camP); M.camera.lookAt(PA.c); M.camera.updateMatrixWorld();
  if(rt.meta.niebla===false){ M.scene.fog.near=1e5; M.scene.fog.far=1e6; }
  else { M.scene.fog.near=PA.dist*0.75+3; M.scene.fog.far=PA.dist*2.8+18; }
}

/* =====================================================================
   Dibujo
   ===================================================================== */
Motor.prototype.pintar=function(t){
  if(!this.guion || !this.ctx) return;
  t=clamp(t,0,this.dur);
  var M=this, idx=0, i;
  for(i=0;i<this.rts.length;i++) if(t>=this.rts[i].def.corte) idx=i;
  for(i=0;i<this.rts.length;i++) this.rts[i].grupo.visible=(i===idx);
  var rt=this.rts[idx];
  for(i=0;i<rt.lista.length;i++) evalObj(rt.lista[i],t);
  this.scene.updateMatrixWorld();
  camara(this,rt,t);
  for(i=0;i<rt.fx.length;i++){ var f=rt.fx[i], a=fade(t,f.t0,f.t1,0.3); if(a<=0.001) f.off(); else f.upd(t,a); }
  this.renderer.render(this.scene,this.camera);
  this.interfaz(rt,t);
};

function rr(ctx,x,y,w,h,r){ ctx.beginPath(); ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r); ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath(); }
Motor.prototype.ancho=function(font,txt){ var k=font+'|'+txt, c=this.anchos; if(c[k]==null){ this.ctx.font=font; c[k]=this.ctx.measureText(txt).width; } return c[k]; };
Motor.prototype.anchoEsp=function(font,txt,sp){ var w=0; for(var i=0;i<txt.length;i++) w+=this.ancho(font,txt[i])+sp; return Math.max(0,w-sp); };
Motor.prototype.textoEsp=function(font,txt,x,y,sp){ var c=this.ctx; c.font=font; for(var i=0;i<txt.length;i++){ c.fillText(txt[i],x,y); x+=this.ancho(font,txt[i])+sp; } };

var vP=new V3();
Motor.prototype.interfaz=function(rt,t){
  var M=this, c=this.ctx, g=this.guion, i;
  c.setTransform(1,0,0,1,0,0); c.globalAlpha=1;
  c.drawImage(this.gl,0,0,this.out.width,this.out.height);
  var k=this.out.width/W; c.setTransform(k,0,0,k,0,0);
  c.textBaseline='alphabetic'; c.textAlign='left'; c.lineCap='round';

  // viñeta
  if(!this.vig){ this.vig=c.createRadialGradient(W/2,H*0.42,H*0.38,W/2,H*0.42,H*0.8); this.vig.addColorStop(0,'rgba(4,6,10,0)'); this.vig.addColorStop(1,'rgba(4,6,10,0.55)'); }
  c.fillStyle=this.vig; c.fillRect(0,0,W,H);

  // marca de agua: el usuario visible durante todo el video (modo "lado", "centro" o "mueve"; "final" = solo al cierre)
  var modo=g.marcaModo||'lado';
  if(g.marca && modo!=='final'){
    var mtx=String(g.marca), ma=0.5, mp=MARCA_POS[modo]||MARCA_POS.lado;
    if(modo==='mueve'){                                  // cambia de sitio cada 7 s para que no se pueda recortar ni tapar con un parche fijo
      var ciclo=7, fase=t%ciclo; mp=MARCA_RUTA[Math.floor(t/ciclo)%MARCA_RUTA.length];
      ma*=Math.min(1,fase/0.5,(ciclo-fase)/0.5);
    } else if(modo==='lado') ma*=1-seg(t,this.dur-2.7,this.dur-2.4);   // al final la releva la píldora, que queda justo debajo
    if(ma>0.004){
      c.save(); c.font=FUENTE.marca; c.textAlign=mp[2]; c.globalAlpha=ma;
      c.shadowColor='rgba(0,0,0,0.75)'; c.shadowBlur=8; c.fillStyle=TXT; c.fillText(mtx,mp[0],mp[1]);
      c.restore();
    }
  }

  // etiquetas
  var vis=0;
  for(i=0;i<rt.etiquetas.length;i++){
    var L=rt.etiquetas[i], a=fade(t,L.t0,L.t1,0.28);
    if(a<=0.001){ L._lado=null; continue; }
    posRef(L.ref,vP).project(this.camera); var orden=vis++; if(vP.z>1) continue;
    var ax=(vP.x+1)/2*W, ay=(1-vP.y)/2*H;
    var tw=this.ancho(FUENTE.lab,L.titulo), sw=L.sub?this.anchoEsp(FUENTE.sub,L.sub,2.9):0, w=Math.max(tw,sw)+44, h=L.sub?98:70;
    if(!L._lado) L._lado={ sx:ax>W/2?-1:1, sy:orden%2===0?-1:1 };
    var lx=L._lado.sx<0 ? ax-80-w : ax+80, ly=L._lado.sy<0 ? ay-210-h : ay+150;
    lx=clamp(lx,48,W-48-w); ly=clamp(ly,150,1180-h)+(1-smooth(seg(t,L.t0,L.t0+0.28)))*14;
    var px=clamp(ax,lx,lx+w), py=clamp(ay,ly,ly+h);
    c.globalAlpha=a; c.strokeStyle=L.color; c.lineWidth=2.5;
    c.beginPath(); c.moveTo(ax,ay); c.lineTo(px,py); c.stroke();
    c.fillStyle=PILDORA; c.beginPath(); c.arc(ax,ay,7,0,PI*2); c.fill(); c.stroke();
    rr(c,lx,ly,w,h,12); c.globalAlpha=a*0.92; c.fill(); c.globalAlpha=a; c.stroke();
    c.fillStyle=TXT; c.font=FUENTE.lab; c.fillText(L.titulo,lx+22,ly+46);
    if(L.sub){ c.fillStyle=TENUE; this.textoEsp(FUENTE.sub,L.sub,lx+22,ly+78,2.9); }
  }
  c.globalAlpha=1;

  // dato grande
  for(i=0;i<rt.datos.length;i++){
    var D=rt.datos[i], da=fade(t,D.t0,D.t1,0.3); if(da<=0.001) continue;
    var fs=112, fnt='700 '+fs+'px Inter, system-ui, sans-serif', dw=this.ancho(fnt,D.texto);
    if(dw>820){ fs=Math.max(54,Math.floor(fs*820/dw)); fnt='700 '+fs+'px Inter, system-ui, sans-serif'; dw=this.ancho(fnt,D.texto); }
    var dsw=D.sub?this.anchoEsp(FUENTE.datoSub,D.sub,3.6):0, bw=Math.max(dw,dsw)+96, bh=fs+(D.sub?104:64), bx=(W-bw)/2, by=250+(1-pop(seg(t,D.t0,D.t0+0.35)))*24;
    c.globalAlpha=da*0.92; c.fillStyle=PILDORA; rr(c,bx,by,bw,bh,22); c.fill();
    c.globalAlpha=da; c.strokeStyle=D.color; c.lineWidth=3; c.stroke();
    c.fillStyle=TXT; c.font=fnt; c.fillText(D.texto,(W-dw)/2,by+fs*0.9+22);
    if(D.sub){ c.fillStyle=TENUE; this.textoEsp(FUENTE.datoSub,D.sub,(W-dsw)/2,by+fs+72,3.6); }
  }
  c.globalAlpha=1;

  // iconos
  for(i=0;i<rt.iconos.length;i++){
    var I=rt.iconos[i], ia=fade(t,I.t0,I.t1,0.25); if(ia<=0.001) continue;
    var sc=0.8+0.2*pop(seg(t,I.t0,I.t0+0.3)), lado=116*sc, ix=W-64-58, iy=400+I.slot*136+58, lit=I.color && t>=I.t0+0.25;
    c.globalAlpha=ia*0.92; c.fillStyle=PILDORA; rr(c,ix-lado/2,iy-lado/2,lado,lado,24*sc); c.fill();
    c.globalAlpha=ia; c.strokeStyle=lit?I.color:'rgba(255,255,255,0.16)'; c.lineWidth=2.5; c.stroke();
    E.dibujarIcono(c,I.icono,ix,iy,64*sc,lit?I.color:(I.tachado?TENUE:TXT), I.tachado?smooth(seg(t,I.t0+0.45,I.t0+0.75)):0, TXT);
  }
  c.globalAlpha=1;

  // píldora de estado
  var si=0; for(i=0;i<this.estados.length;i++) if(t>=this.estados[i].t) si=i;
  var es=this.estados[si], etxt=es.texto, ecol=E.nombreColor(es.color)==='gris'||!E.nombreColor(es.color) ? TENUE : E.color(es.color);
  if(g.marca && t>this.dur-2.4){ etxt=String(g.marca); ecol=TENUE; }
  if(etxt){
    var ew=this.anchoEsp(FUENTE.pil,etxt,3.8), pw=14+30+12+9+13+ew+26, pulso=1+0.08*(1-seg(t,es.t,es.t+0.35))*(si>0?1:0);
    c.save(); c.translate(64,1262+31); c.scale(pulso,pulso); c.translate(0,-31);
    c.fillStyle=PILDORA; rr(c,0,0,pw,62,31); c.fill(); c.strokeStyle='rgba(255,255,255,0.08)'; c.lineWidth=2; c.stroke();
    c.fillStyle=TXT; c.beginPath(); c.arc(29,31,15,0,PI*2); c.fill();
    c.fillStyle=ecol; c.beginPath(); c.arc(60.5,31,4.5,0,PI*2); c.fill();
    c.fillStyle=TXT; this.textoEsp(FUENTE.pil,etxt,78,39.5,3.8);
    c.restore();
  }

  // subtítulo: la palabra dicha en blanco, las que faltan en gris
  var ls=this.lineas, ci=-1;
  for(i=0;i<ls.length;i++){ var nx=ls[i+1], fin=(nx && nx.t0-ls[i].t1<0.7) ? nx.t0 : ls[i].t1+0.3; if(t>=ls[i].t0 && t<fin){ ci=i; break; } }
  if(ci>=0){
    var l=ls[ci], ws=l.palabras, n=ws.length, esp=this.ancho(FUENTE.cap,' '), anchos=[], total=0, j;
    for(j=0;j<n;j++){ anchos.push(this.ancho(FUENTE.cap,ws[j])); total+=anchos[j]+(j?esp:0); }
    var filas=[[0,n]];
    if(total>940 && n>1){ var mejor=1, dif=1e9, acc=0; for(j=0;j<n-1;j++){ acc+=anchos[j]+(j?esp:0); var df=Math.abs(total-2*acc); if(df<dif){ dif=df; mejor=j+1; } } filas=[[0,mejor],[mejor,n]]; }
    var paso=(l.t1-l.t0-0.1)/n, fh=62, wmax=0, fw=[];
    filas.forEach(function(f){ var w0=0; for(var q=f[0];q<f[1];q++) w0+=anchos[q]+(q>f[0]?esp:0); fw.push(w0); wmax=Math.max(wmax,w0); });
    var bh2=filas.length*fh+26, by2=1408-(filas.length-1)*fh/2, bx2=(W-wmax)/2-28;
    c.fillStyle=PILDORA; rr(c,bx2,by2,wmax+56,bh2,18); c.fill();
    c.font=FUENTE.cap;
    filas.forEach(function(f,fi){ var x=(W-fw[fi])/2, y=by2+52+fi*fh; for(var q=f[0];q<f[1];q++){ c.fillStyle = t>=l.t0+q*paso ? TXT : TENUE; c.fillText(ws[q],x,y); x+=anchos[q]+esp; } });
  }

  // fundido entre escenas
  var dip=Math.max(0,1-t/0.4);
  for(i=1;i<this.rts.length;i++) dip=Math.max(dip,1-Math.abs(t-this.rts[i].def.corte)/0.32);
  if(dip>0.001){ c.globalAlpha=clamp(dip); c.fillStyle=E.paleta.fondo; c.fillRect(0,0,W,H); c.globalAlpha=1; }
};

/* texto de la narración con marcas de tiempo, agrupado por frases */
Motor.prototype.narracion=function(){
  var out=[], buf='', ini=null;
  function mmss(s){ var m=Math.floor(s/60), r=Math.floor(s%60); return m+':'+(r<10?'0':'')+r; }
  this.lineas.forEach(function(l){ if(ini==null) ini=l.t0; buf+=(buf?' ':'')+l.texto; if(/[.?!…]$/.test(l.texto)){ out.push(mmss(ini)+'  '+buf); buf=''; ini=null; } });
  if(buf) out.push(mmss(ini)+'  '+buf);
  return out.join('\n');
};

E.Motor=Motor;
})();
