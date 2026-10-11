/* Explika · utilidades: matemática, paleta, materiales y geometría base */
(function(){
'use strict';
var E = window.E3D = window.E3D || {};

/* ---------- matemática ---------- */
E.clamp = function(x,a,b){ if(a===undefined) a=0; if(b===undefined) b=1; return Math.min(b, Math.max(a, x)); };
E.seg = function(t,a,b){ return b<=a ? (t>=a?1:0) : E.clamp((t-a)/(b-a)); };
E.smooth = function(x){ return x*x*(3-2*x); };
E.eio = function(x){ return x<0.5 ? 4*x*x*x : 1-Math.pow(-2*x+2,3)/2; };
E.lerp = function(a,b,u){ return a+(b-a)*u; };
E.pop = function(x){ if(x<=0) return 0; if(x>=1) return 1; var c1=1.70158, c3=c1+1; return 1+c3*Math.pow(x-1,3)+c1*Math.pow(x-1,2); };
E.fade = function(t,a,b,d){ d=d||0.3; return Math.min(E.seg(t,a,a+d), 1-E.seg(t,b-d,b)); };
E.rng = function(seed){ return function(){ seed|=0; seed=seed+0x6D2B79F5|0; var t=Math.imul(seed^seed>>>15,1|seed); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; };
E.hash = function(s){ var h=2166136261; s=String(s); for(var i=0;i<s.length;i++) h=Math.imul(h^s.charCodeAt(i),16777619); return h>>>0; };

/* ---------- paleta ---------- */
E.PALETA_BASE = { fondo:'#0f141c', crema:'#f2eee3', azul:'#3b82f6', verde:'#34d399', ambar:'#f5a623', rojo:'#ef5350', gris:'#687281' };
E.paleta = Object.assign({}, E.PALETA_BASE);
var ALIAS = { amarillo:'ambar', naranja:'ambar', 'ámbar':'ambar', amber:'ambar', orange:'ambar', yellow:'ambar',
  blanco:'crema', white:'crema', heroe:'crema', 'héroe':'crema', celeste:'azul', blue:'azul', green:'verde',
  red:'rojo', gray:'gris', grey:'gris', neutro:'gris' };
/* nombre canónico ("azul") o el propio hex si viene "#rrggbb"; null si no se reconoce */
E.nombreColor = function(n){
  if(n==null) return null;
  n = String(n).toLowerCase().trim();
  if(/^#[0-9a-f]{6}$/.test(n)) return n;
  n = ALIAS[n] || n;
  return E.paleta[n] && n!=='fondo' ? n : null;
};
E.color = function(n, def){
  var c = E.nombreColor(n);
  if(!c) return E.paleta[def||'azul'];
  return c[0]==='#' ? c : E.paleta[c];
};
/* tonos del escenario derivados del fondo: 0 = fondo, 1 = gris claro */
E.tono = function(k){ return new THREE.Color(E.paleta.fondo).lerp(new THREE.Color(0x8090a8), k); };

/* ---------- materiales ---------- */
E.mat = function(color,o){ var p={color:color, roughness:1, metalness:0, flatShading:true}; if(o) for(var k in o) p[k]=o[k]; return new THREE.MeshStandardMaterial(p); };
E.glow = function(color,o){ var p={color:color, transparent:true, opacity:1, depthWrite:false}; if(o) for(var k in o) p[k]=o[k]; return new THREE.MeshBasicMaterial(p); };

function Mats(){ this.c = {}; }
Mats.prototype.lit = function(color){ var k='l'+new THREE.Color(color).getHexString(); return this.c[k] || (this.c[k]=E.mat(color)); };
Mats.prototype.tono = function(k){ return this.lit(E.tono(k)); };
Mats.prototype.emis = function(color,i){ var k='e'+new THREE.Color(color).getHexString()+'_'+i; return this.c[k] || (this.c[k]=E.mat(color,{emissive:color, emissiveIntensity:i})); };
/* juego de materiales para un objeto: "main" es el cuerpo (crema si es héroe, color si se pidió, gris si no) */
Mats.prototype.paraObjeto = function(def, prop){
  var self=this, nombre = def.color ? E.nombreColor(def.color) : (def.heroe ? 'crema' : (prop && prop.color) || null), main;
  if(nombre){ var c=E.color(nombre), hero=(nombre==='crema'); main=E.mat(c,{emissive:c, emissiveIntensity:hero?0.12:0.2}); }
  else main=E.mat(E.tono(prop && prop.tono!=null ? prop.tono : 0.78));
  return {
    main:main, coloreado:!!nombre,
    osc:self.tono(0.16), med:self.tono(0.26), cla:self.tono(0.4), cla2:self.tono(0.6), cuerpo:self.tono(0.78),
    vidrio:self.lit(0x0b1018), luz:self.emis('#e9c98b',1), pantalla:self.emis('#9fb6e0',0.5), crema:self.emis(E.color('crema'),0.12),
    acento:function(n,i){ return self.emis(E.color(n), i==null?0.3:i); },
    lit:function(c){ return self.lit(c); }
  };
};
E.Mats = Mats;

/* ---------- geometría base (todo con sombreado plano) ---------- */
function add(o,x,y,z,p){ o.position.set(x||0,y||0,z||0); if(p) p.add(o); return o; }
function capGeo(r,len,rs){
  var pts=[], n=4, i, a;
  for(i=0;i<=n;i++){ a=-Math.PI/2+(Math.PI/2)*i/n; pts.push(new THREE.Vector2(Math.max(0.0001,Math.cos(a)*r), -len/2+Math.sin(a)*r)); }
  for(i=0;i<=n;i++){ a=(Math.PI/2)*i/n; pts.push(new THREE.Vector2(Math.max(0.0001,Math.cos(a)*r), len/2+Math.sin(a)*r)); }
  return new THREE.LatheGeometry(pts, rs||9);
}
E.G = {
  box:  function(w,h,d,m,x,y,z,p){ return add(new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m),x,y,z,p); },
  cyl:  function(rt,rb,h,m,x,y,z,p,sg){ return add(new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,sg||10),m),x,y,z,p); },
  cone: function(r,h,m,x,y,z,p,sg){ return add(new THREE.Mesh(new THREE.ConeGeometry(r,h,sg||8),m),x,y,z,p); },
  sph:  function(r,m,x,y,z,p,ws,hs){ return add(new THREE.Mesh(new THREE.SphereGeometry(r,ws||10,hs||8),m),x,y,z,p); },
  ico:  function(r,m,x,y,z,p,det){ return add(new THREE.Mesh(new THREE.IcosahedronGeometry(r,det==null?1:det),m),x,y,z,p); },
  tor:  function(R,r,m,x,y,z,p,arc){ return add(new THREE.Mesh(new THREE.TorusGeometry(R,r,6,28,arc||Math.PI*2),m),x,y,z,p); },
  cap:  function(r,len,m,x,y,z,p,rs){ var o=add(new THREE.Mesh(capGeo(r,len,rs),m),x,y,z,p); m.side=THREE.DoubleSide; return o; },
  /* deforma un poco los vértices para dar aspecto orgánico (cerebro, pulmones...) sin abrir grietas */
  lumpy: function(mesh, amt, R){
    var g=mesh.geometry, P=g.attributes.position, mapa={}, i, k, f;
    for(i=0;i<P.count;i++){
      k=P.getX(i).toFixed(3)+','+P.getY(i).toFixed(3)+','+P.getZ(i).toFixed(3);
      f=mapa[k] || (mapa[k]=1+amt*(R()-0.5)*2);
      P.setXYZ(i, P.getX(i)*f, P.getY(i)*f, P.getZ(i)*f);
    }
    g.computeVertexNormals(); return mesh;
  }
};

/* ---------- une las mallas de un grupo en pocas llamadas de dibujo ----------
   conColores=true: las piezas opacas sin brillo se juntan en UNA malla con color por vértice (escenarios).
   conColores=false: una malla por material (objetos; así se puede recolorear el material "main"). */
E.fusionar = function(g, conColores){
  g.updateMatrixWorld(true);
  var inv=new THREE.Matrix4().copy(g.matrixWorld).invert(), mm=new THREE.Matrix4();
  var lit={pos:[],nor:[],col:[]}, otros={}, orden=[], meshes=[];
  g.traverse(function(o){ if(o.isMesh && !o.isInstancedMesh) meshes.push(o); });
  meshes.forEach(function(o){
    var geo=o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone();
    geo.applyMatrix4(mm.multiplyMatrices(inv,o.matrixWorld));
    if(!geo.attributes.normal) geo.computeVertexNormals();
    var m=o.material, plano = conColores && m.isMeshStandardMaterial && !m.transparent && (m.emissive.r+m.emissive.g+m.emissive.b)===0;
    var b;
    if(plano) b=lit; else { b=otros[m.uuid]; if(!b){ b=otros[m.uuid]={pos:[],nor:[],mat:m}; orden.push(b); } }
    var P=geo.attributes.position.array, N=geo.attributes.normal.array, i;
    for(i=0;i<P.length;i++){ b.pos.push(P[i]); b.nor.push(N[i]); }
    if(plano) for(i=0;i<P.length;i+=3) b.col.push(m.color.r,m.color.g,m.color.b);
    geo.dispose();
  });
  var resto=[]; g.children.slice().forEach(function(c){ if(c.isPoints || c.isInstancedMesh) resto.push(c); g.remove(c); });
  function build(b,material){
    if(!b.pos.length) return;
    var bg=new THREE.BufferGeometry();
    bg.setAttribute('position', new THREE.Float32BufferAttribute(b.pos,3));
    bg.setAttribute('normal', new THREE.Float32BufferAttribute(b.nor,3));
    if(b.col) bg.setAttribute('color', new THREE.Float32BufferAttribute(b.col,3));
    g.add(new THREE.Mesh(bg,material));
  }
  if(conColores){ var mc=E.mat(0xffffff,{vertexColors:true, side:THREE.DoubleSide}); build(lit, mc); }
  orden.forEach(function(b){ build(b, b.mat); });
  resto.forEach(function(c){ g.add(c); });
  return g;
};
})();
