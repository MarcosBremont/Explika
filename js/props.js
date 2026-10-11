/* Explika · biblioteca de objetos 3D
   Cada objeto se construye con su base en y=0, centrado en x/z y mirando hacia +z (salvo frente:'x').
   Campos: desc (para el prompt), tam (tamaño natural), opciones (texto para el prompt), build(o, M, R).
   M = materiales del objeto (M.main es el cuerpo), R = aleatorio con semilla. */
(function(){
'use strict';
var E=window.E3D, G=E.G, P=E.PROPS={}, PI=Math.PI;
function grp(){ return new THREE.Group(); }
function num(v,d){ return typeof v==='number' && isFinite(v) ? v : d; }
function tam(o,i,d){ return o.tam && typeof o.tam[i]==='number' ? o.tam[i] : (typeof o.tam==='number' && i===0 ? o.tam : d); }

/* ====================== PERSONA ====================== */
function figura(m){
  var g=grp(), rig={legs:[],arms:{}};
  var hip=grp(); hip.position.y=0.87; g.add(hip); rig.hip=hip;
  [-1,1].forEach(function(sx){
    var th=grp(); th.position.set(sx*0.1,0,0); hip.add(th);
    var tm=G.cap(0.078,0.29,m,0,-0.215,0,th);
    var kn=grp(); kn.position.y=-0.43; th.add(kn);
    G.cap(0.066,0.3,m,0,-0.215,0,kn);
    rig.legs.push({th:th,kn:kn,mesh:tm,sx:sx});
  });
  rig.torso=G.cap(0.17,0.36,m,0,0.3,0,hip,10); rig.torso.scale.z=0.75;
  rig.head=G.sph(0.125,m,0,0.83,0,hip,10,8);
  [-1,1].forEach(function(sx){
    var sh=grp(); sh.position.set(sx*0.27,0.55,0); sh.rotation.z=sx*0.2; hip.add(sh);
    var up=G.cap(0.055,0.2,m,0,-0.15,0,sh);
    var el=grp(); el.position.y=-0.30; sh.add(el);
    G.cap(0.048,0.2,m,0,-0.14,0,el);
    var hand=grp(); hand.position.y=-0.30; el.add(hand);
    rig.arms[sx>0?'der':'izq']={sh:sh,el:el,hand:hand,up:up,sx:sx};
  });
  g.userData.rig=rig;
  return g;
}
function posePersona(o, anim, tt, t){
  var r=o.inner.userData.rig, a=r.arms, L=r.legs, inn=o.inner, i, curl=0;
  inn.rotation.set(0,0,0); inn.position.set(0,0,0);
  r.hip.position.y=0.87; r.hip.rotation.set(0,0,0);
  for(i=0;i<2;i++){ L[i].th.rotation.x=0; L[i].kn.rotation.x=0; }
  ['der','izq'].forEach(function(k){ a[k].sh.rotation.set(0,0,a[k].sx*0.2); a[k].el.rotation.set(0,0,0); });
  var br=Math.sin(t*1.6);
  r.torso.scale.set(1+0.012*br, 1, 0.75*(1+0.03*br));
  switch(anim){
    case 'caminar': case 'correr':
      var corre=anim==='correr', f=corre?9.5:5.4, A=corre?0.85:0.5, ph=tt*f;
      for(i=0;i<2;i++){ var s=(i?1:-1)*Math.sin(ph); L[i].th.rotation.x=-s*A; L[i].kn.rotation.x=Math.max(0,-s)*A*1.3+0.05; }
      a.der.sh.rotation.x= Math.sin(ph)*A*0.7; a.izq.sh.rotation.x=-Math.sin(ph)*A*0.7;
      a.der.el.rotation.x=a.izq.el.rotation.x=-0.35-(corre?0.9:0);
      r.hip.position.y=0.87+Math.abs(Math.cos(ph))*0.025; if(corre) r.hip.rotation.x=0.18;
      break;
    case 'sentado': case 'sentado_teclear':
      r.hip.position.y=0.47;
      for(i=0;i<2;i++){ L[i].th.rotation.x=-PI/2; L[i].kn.rotation.x=PI/2; }
      ['der','izq'].forEach(function(k,j){ a[k].sh.rotation.x=-0.35; a[k].el.rotation.x = anim==='sentado' ? -1.0 : -1.25+Math.sin(t*13+j*2)*0.07; });
      break;
    case 'acostado': case 'dormir':
      inn.rotation.x=-PI/2; inn.position.set(0,0.135,0.9);
      break;
    case 'curl':
      curl=0.5-0.5*Math.cos(2*PI*tt/2.7);
      a.der.el.rotation.x=-curl*2.25+Math.sin(t*38)*0.012*curl; a.der.sh.rotation.x=-0.2*curl;
      break;
    case 'saludar':
      a.der.sh.rotation.z=2.45; a.der.el.rotation.z=0.3+Math.sin(t*7)*0.45;
      break;
    case 'celebrar':
      a.der.sh.rotation.z=2.75; a.izq.sh.rotation.z=-2.75; r.hip.position.y=0.87+Math.abs(Math.sin(t*6))*0.06;
      break;
    case 'telefono':
      a.der.sh.rotation.x=-0.45; a.der.el.rotation.x=-1.75;
      break;
    case 'senalar': case 'señalar':
      a.der.sh.rotation.x=-1.45;
      break;
  }
  if(r.bulto && r.bultoTipo==='biceps'){ var b=1+0.32*curl; r.bulto.scale.set(b, 1.55*(1-0.06*curl), 1.05*b); }
}
P.persona={ desc:'Maniquí sin rostro', tam:'1.8 m de alto', rig:true, orienta:true, pose:posePersona,
  opciones:'anim: quieto | caminar | correr | sentado | sentado_teclear | acostado | curl | saludar | celebrar | telefono | senalar. parte_heroe: biceps | pecho | abdomen | cabeza | pierna (resalta esa parte en crema). Anclas: .cabeza .pecho .abdomen .biceps .mano_der .mano_izq',
  build:function(o,M){
    var g=figura(M.main), r=g.userData.rig, A={};
    function ancla(parent,x,y,z){ var n=grp(); n.position.set(x,y,z); parent.add(n); return n; }
    A.cabeza=r.head; A.pecho=ancla(r.hip,0,0.4,0.135); A.abdomen=ancla(r.hip,0,0.16,0.135);
    A.biceps=ancla(r.arms.der.sh,0,-0.17,0.034); A.mano_der=r.arms.der.hand; A.mano_izq=r.arms.izq.hand;
    var ph=o.parte_heroe;
    if(ph==='biceps'){ r.bulto=G.sph(0.052,M.crema,0,0,0,A.biceps,10,8); r.bulto.scale.set(1,1.55,1.05); r.bultoTipo='biceps'; }
    else if(ph==='pecho'){ r.bulto=G.sph(0.075,M.crema,0,0,0,A.pecho,10,8); r.bulto.scale.set(1.1,1,0.5); }
    else if(ph==='abdomen'){ r.bulto=G.sph(0.08,M.crema,0,0,0,A.abdomen,10,8); r.bulto.scale.set(1.1,1,0.5); }
    else if(ph==='cabeza'){ r.head.material=M.crema; }
    else if(ph==='pierna'){ r.legs[1].mesh.material=M.crema; }
    g.userData.anclas=A;
    return g;
  } };
P.multitud={ desc:'Grupo de personas quietas repartidas alrededor', tam:'n personas en un radio', tono:0.5,
  opciones:'n (por defecto 8), radio (por defecto 4)',
  build:function(o,M,R){
    var g=grp(), n=E.clamp(num(o.n,8),1,30)|0, rad=num(o.radio,4), i;
    for(i=0;i<n;i++){
      var f=figura(M.main), a=R()*PI*2, d=1.2+R()*(rad-1.2);
      f.position.set(Math.cos(a)*d,0,Math.sin(a)*d); f.rotation.y=R()*PI*2;
      var r=f.userData.rig; r.arms.der.sh.rotation.x=(R()-0.5)*0.5; r.arms.izq.sh.rotation.x=(R()-0.5)*0.5;
      g.add(f);
    }
    return g;
  } };

/* ====================== PRIMITIVAS ====================== */
P.cubo={ desc:'Caja', tam:'tam [ancho, alto, fondo], por defecto [1,1,1]', build:function(o,M){ var g=grp(), h=tam(o,1,1); G.box(tam(o,0,1),h,tam(o,2,1),M.main,0,h/2,0,g); return g; } };
P.esfera={ desc:'Esfera', tam:'tam [diametro], por defecto [1]', build:function(o,M){ var g=grp(), r=tam(o,0,1)/2; G.ico(r,M.main,0,r,0,g,1); return g; } };
P.cilindro={ desc:'Cilindro vertical', tam:'tam [diametro, alto], por defecto [1,1]', build:function(o,M){ var g=grp(), r=tam(o,0,1)/2, h=tam(o,1,1); G.cyl(r,r,h,M.main,0,h/2,0,g,14); return g; } };
P.cono={ desc:'Cono', tam:'tam [diametro, alto]', build:function(o,M){ var g=grp(), r=tam(o,0,1)/2, h=tam(o,1,1); G.cone(r,h,M.main,0,h/2,0,g,12); return g; } };
P.capsula={ desc:'Cápsula vertical', tam:'tam [diametro, alto]', build:function(o,M){ var g=grp(), r=tam(o,0,0.5)/2, h=Math.max(tam(o,1,1.5),r*2.01); G.cap(r,h-2*r,M.main,0,h/2,0,g,10); return g; } };
P.anillo={ desc:'Aro vertical', tam:'tam [diametro, grosor]', build:function(o,M){ var g=grp(), R0=tam(o,0,1)/2, r=tam(o,1,0.08)/2; G.tor(R0,r,M.main,0,R0+r,0,g); return g; } };
P.placa={ desc:'Placa plana en el suelo', tam:'tam [ancho, fondo]', build:function(o,M){ var g=grp(); G.box(tam(o,0,2),0.04,tam(o,1,2),M.main,0,0.02,0,g); return g; } };
P.flecha={ desc:'Flecha 3D que apunta a +x', tam:'largo (por defecto 1.5)', frente:'x', build:function(o,M){
  var g=grp(), L=num(o.largo,1.5), s=G.cyl(0.05,0.05,L-0.3,M.main,(L-0.3)/2-L/2,0.2,0,g,8); s.rotation.z=PI/2;
  var c=G.cone(0.14,0.3,M.main,L/2-0.15,0.2,0,g,8); c.rotation.z=-PI/2; return g; } };
P.grupo={ desc:'Varias piezas como un solo objeto', tam:'partes: lista de objetos con pos relativa', build:function(o,M,R,mats){
  var g=grp();
  (o.partes||[]).forEach(function(p,i){
    var pr=P[p.tipo]||P.cubo, def=Object.assign({}, p); if(!def.color && !def.heroe && (o.color||o.heroe)){ def.color=o.color; def.heroe=o.heroe; }
    var inner=pr.build(def, mats.paraObjeto(def,pr), R, mats), s=num(p.escala,1), pos=p.pos||[0,0,0];
    inner.position.set(num(pos[0],0),num(pos[1],0),num(pos[2],0)); inner.scale.setScalar(s); inner.rotation.y=num(p.rot,0)*PI/180; g.add(inner);
  });
  return g; } };

/* ====================== TECNOLOGÍA ====================== */
P.telefono={ desc:'Teléfono de pie (con en_mano la persona lo sostiene inclinado hacia sí)', tam:'0.16 m de alto', mano:[-0.9,0,0], build:function(o,M){ var g=grp(); G.box(0.078,0.158,0.011,M.main,0,0.079,0,g); G.box(0.068,0.144,0.003,M.pantalla,0,0.079,0.0056,g); return g; } };
P.laptop={ desc:'Laptop abierta', tam:'0.34 m de ancho', build:function(o,M){ var g=grp(); G.box(0.34,0.018,0.24,M.main,0,0.009,0,g);
  var h=grp(); h.position.set(0,0.018,-0.115); h.rotation.x=-0.3; g.add(h); G.box(0.34,0.22,0.012,M.main,0,0.11,0,h); G.box(0.31,0.19,0.003,M.pantalla,0,0.11,0.007,h); return g; } };
P.monitor={ desc:'Pantalla de escritorio', tam:'0.6 m de ancho', build:function(o,M){ var g=grp(); G.box(0.24,0.015,0.16,M.med,0,0.008,0,g); G.box(0.04,0.2,0.03,M.med,0,0.115,0,g);
  G.box(0.6,0.36,0.03,M.main,0,0.4,0,g); G.box(0.56,0.32,0.003,M.pantalla,0,0.4,0.0165,g); return g; } };
P.servidor={ desc:'Rack de servidores', tam:'1.9 m de alto', tono:0.42, build:function(o,M,R){ var g=grp(), i; G.box(0.6,1.9,0.8,M.main,0,0.95,0,g);
  for(i=0;i<8;i++){ var y=0.25+i*0.2; G.box(0.54,0.02,0.012,M.osc,0,y,0.402,g); G.box(0.03,0.03,0.012,M.acento(R()<0.75?'verde':'ambar',0.8),-0.2+R()*0.1,y+0.07,0.402,g); G.box(0.03,0.03,0.012,M.acento('verde',0.8),-0.08,y+0.07,0.402,g); }
  return g; } };
P.router={ desc:'Router wifi', tam:'0.26 m de ancho', build:function(o,M){ var g=grp(); G.box(0.26,0.05,0.17,M.main,0,0.025,0,g);
  [-1,1].forEach(function(s){ var a=G.cyl(0.008,0.008,0.17,M.med,s*0.1,0.13,-0.06,g,6); a.rotation.z=-s*0.15; });
  G.box(0.025,0.01,0.004,M.acento('verde',0.9),0.08,0.03,0.086,g); return g; } };
P.antena={ desc:'Torre de telefonía', tam:'10 m de alto', tono:0.45, build:function(o,M){ var g=grp(), i; G.cyl(0.12,0.45,10,M.main,0,5,0,g,4); G.cyl(0.55,0.55,0.1,M.med,0,8.6,0,g,8);
  for(i=0;i<3;i++){ var a=i/3*PI*2, p=G.box(0.26,1.25,0.1,M.cla,Math.sin(a)*0.6,9.1,Math.cos(a)*0.6,g); p.rotation.y=a; }
  G.sph(0.13,M.acento('rojo',1),0,10.15,0,g,8,6); return g; } };
P.satelite={ desc:'Satélite (ponlo alto con pos y)', tam:'5 m de ancho', build:function(o,M){ var g=grp(), panel=M.lit('#24365c'); G.box(1,1,1.4,M.main,0,0.5,0,g);
  [-1,1].forEach(function(s){ G.box(0.5,0.06,0.06,M.med,s*0.75,0.5,0,g); G.box(1.6,0.04,0.95,panel,s*1.8,0.5,0,g); G.box(0.02,0.045,0.95,M.med,s*1.8,0.5,0,g); });
  var d=G.cone(0.42,0.3,M.cla,0,-0.1,0.3,g,10); d.rotation.x=PI; G.cyl(0.02,0.02,0.4,M.med,0,1.2,0,g,6); return g; } };
P.nube={ desc:'Nube (internet, la nube; ponla alta con pos y)', tam:'3 m de ancho', tono:0.62, build:function(o,M){ var g=grp();
  G.ico(0.9,M.main,0,0.9,0,g,1); G.ico(0.68,M.main,-0.95,0.68,0.05,g,1); G.ico(0.74,M.main,0.98,0.74,-0.05,g,1); G.ico(0.55,M.main,-0.4,1.4,-0.1,g,1); G.ico(0.5,M.main,0.5,1.3,0.1,g,1); return g; } };
P.bateria={ desc:'Batería', tam:'0.26 m de alto', build:function(o,M){ var g=grp(); G.cyl(0.07,0.07,0.24,M.main,0,0.12,0,g,12); G.cyl(0.03,0.03,0.02,M.cla,0,0.25,0,g,8); G.cyl(0.072,0.072,0.07,M.acento('verde',0.5),0,0.05,0,g,12); return g; } };
P.bombilla={ desc:'Bombilla encendida', tam:'0.25 m de alto', build:function(o,M){ var g=grp(); G.cyl(0.045,0.04,0.07,M.med,0,0.035,0,g,8); G.ico(0.09,o.apagada?M.cla:M.luz,0,0.15,0,g,1); return g; } };
P.chip={ desc:'Procesador', tam:'0.5 m de ancho', build:function(o,M){ var g=grp(), i; G.box(0.4,0.05,0.4,M.main,0,0.045,0,g); G.box(0.2,0.008,0.2,M.cla2,0,0.074,0,g);
  for(i=0;i<5;i++){ var p=-0.16+i*0.08; G.box(0.03,0.016,0.5,M.cla,p,0.02,0,g); G.box(0.5,0.016,0.03,M.cla,0,0.02,p,g); } return g; } };
P.tarjeta={ desc:'Tarjeta bancaria de pie', tam:'0.09 m de ancho', build:function(o,M){ var g=grp(); G.box(0.0856,0.054,0.002,M.main,0,0.027,0,g); G.box(0.0856,0.008,0.0025,M.osc,0,0.04,0,g); G.box(0.012,0.01,0.0025,M.acento('ambar',0.4),-0.025,0.022,0.0002,g); return g; } };
P.candado={ desc:'Candado', tam:'0.28 m de alto', build:function(o,M){ var g=grp(); G.box(0.2,0.16,0.07,M.main,0,0.08,0,g); G.tor(0.065,0.017,M.med,0,0.16,0,g,PI); G.cyl(0.018,0.018,0.072,M.osc,0,0.09,0,g,8).rotation.x=PI/2; return g; } };
P.engranaje={ desc:'Engranaje vertical', tam:'0.6 m de diametro', eje:'z', build:function(o,M){ var g=grp(), i; var c=G.cyl(0.22,0.22,0.07,M.main,0,0.3,0,g,16); c.rotation.x=PI/2;
  for(i=0;i<8;i++){ var a=i/8*PI*2, t=G.box(0.09,0.1,0.07,M.main,Math.cos(a)*0.25,0.3+Math.sin(a)*0.25,0,g); t.rotation.z=a+PI/2; }
  G.cyl(0.07,0.07,0.075,M.osc,0,0.3,0,g,10).rotation.x=PI/2; return g; } };
P.panel_solar={ desc:'Panel solar', tam:'1.6 m de ancho', build:function(o,M){ var g=grp(), i; G.cyl(0.04,0.04,0.7,M.med,0,0.35,0,g,6); var h=grp(); h.position.y=0.75; h.rotation.x=-0.5; g.add(h);
  G.box(1.6,0.05,1,M.lit('#24365c'),0,0,0,h); for(i=1;i<4;i++) G.box(0.015,0.055,1,M.med,-0.8+i*0.4,0,0,h); G.box(1.6,0.055,0.015,M.med,0,0,0,h); return g; } };
P.pizarra={ desc:'Pizarra con patas', tam:'2.4 m de ancho', tono:0.3, build:function(o,M){ var g=grp(); G.box(2.4,1.3,0.06,M.osc,0,1.55,0,g); G.box(2.5,0.06,0.08,M.cla,0,2.22,0,g); G.box(2.5,0.06,0.08,M.cla,0,0.88,0,g);
  [-1,1].forEach(function(s){ G.box(0.06,2.2,0.06,M.cla,s*1.2,1.1,0,g); G.box(0.06,0.05,0.6,M.cla,s*1.2,0.025,0,g); }); return g; } };
P.grafica={ desc:'Gráfica de barras 3D (la última barra va en color)', tam:'1.6 m de ancho', opciones:'valores: alturas, por ejemplo [0.4,0.7,1,1.4]',
  build:function(o,M){ var g=grp(), v=(o.valores&&o.valores.length?o.valores:[0.4,0.7,1,1.4]).slice(0,8), n=v.length, w=1.6/n;
  v.forEach(function(h,i){ h=E.clamp(num(h,0.5),0.05,4); G.box(w*0.7,h,w*0.7,i===n-1?M.main:M.cla,-0.8+w*(i+0.5),h/2,0,g); }); G.box(1.8,0.03,0.5,M.med,0,0.015,0,g); return g; } };

/* ====================== LUGARES Y VEHÍCULOS ====================== */
P.casa={ desc:'Casa', tam:'5 m de ancho, 4.8 m de alto', tono:0.5, build:function(o,M){ var g=grp(); G.box(5,3,4.4,M.main,0,1.5,0,g);
  var r=G.cone(3.9,1.8,M.med,0,3.9,0,g,4); r.rotation.y=PI/4; r.scale.z=0.86; G.box(0.9,1.9,0.06,M.osc,0,0.95,2.21,g);
  [-1,1].forEach(function(s){ G.box(0.9,0.8,0.06,M.luz,s*1.55,1.75,2.21,g); }); return g; } };
P.edificio={ desc:'Edificio con ventanas', tam:'6 m de ancho; alto = pisos x 2.2 m', tono:0.3, opciones:'pisos (por defecto 8)',
  build:function(o,M,R){ var g=grp(), n=E.clamp(num(o.pisos,8),1,40)|0, h=n*2.2, i, k; G.box(6,h,6,M.main,0,h/2,0,g); G.box(2,0.5,2,M.med,0.8,h+0.25,-0.6,g);
  for(i=0;i<n;i++) for(k=0;k<5;k++){ if(R()<0.42) G.box(0.5,0.7,0.04,M.luz,-2.2+k*1.1,1.2+i*2.2,3.01,g); if(R()<0.3) G.box(0.04,0.7,0.5,M.luz,3.01,1.2+i*2.2,-2.2+k*1.1,g); }
  return g; } };
P.auto={ desc:'Auto (mira hacia +x)', tam:'4.2 m de largo', frente:'x', orienta:true, build:function(o,M){ var g=grp(); G.box(4.2,0.62,1.75,M.main,0,0.6,0,g); G.box(2.2,0.55,1.58,M.vidrio,-0.2,1.18,0,g); G.box(2.26,0.06,1.62,M.main,-0.2,1.48,0,g);
  [-1,1].forEach(function(sx){ [-1,1].forEach(function(sz){ var w=G.cyl(0.34,0.34,0.24,M.osc,sx*1.35,0.34,sz*0.82,g,12); w.rotation.x=PI/2; }); });
  [-1,1].forEach(function(sz){ G.box(0.05,0.14,0.32,M.luz,2.11,0.66,sz*0.6,g); G.box(0.05,0.12,0.3,M.acento('rojo',0.8),-2.11,0.68,sz*0.6,g); }); return g; } };
P.camion={ desc:'Camión de reparto (mira hacia +x)', tam:'6.8 m de largo', frente:'x', orienta:true, build:function(o,M){ var g=grp(); G.box(1.7,1.7,2.1,M.main,2.5,1.3,0,g); G.box(0.05,0.7,1.8,M.vidrio,3.36,1.6,0,g); G.box(4.7,2.5,2.3,M.cla,-0.75,1.75,0,g);
  [2.5,-0.2,-2.2].forEach(function(x){ [-1,1].forEach(function(sz){ var w=G.cyl(0.45,0.45,0.3,M.osc,x,0.45,sz*1.0,g,12); w.rotation.x=PI/2; }); });
  [-1,1].forEach(function(sz){ G.box(0.05,0.16,0.3,M.luz,3.36,0.8,sz*0.7,g); }); return g; } };
P.avion={ desc:'Avión (mira hacia +x; ponlo alto con pos y)', tam:'8 m de largo', frente:'x', orienta:true, build:function(o,M){ var g=grp(); var f=G.cap(0.55,6.9,M.main,0,1.2,0,g,10); f.rotation.z=PI/2;
  G.box(1.6,0.09,8,M.main,0.2,1.1,0,g); G.box(1.0,0.08,3,M.main,-3.5,1.35,0,g); G.box(1.2,1.3,0.09,M.main,-3.5,1.95,0,g);
  [-1,1].forEach(function(s){ var e=G.cyl(0.24,0.24,0.9,M.med,0.5,0.82,s*1.9,g,10); e.rotation.z=PI/2; }); return g; } };
P.cohete={ desc:'Cohete vertical', tam:'3 m de alto', build:function(o,M){ var g=grp(), i; G.cyl(0.4,0.4,2,M.main,0,1.3,0,g,12); G.cone(0.4,0.8,M.main,0,2.7,0,g,12); G.cyl(0.42,0.42,0.12,M.med,0,1.9,0,g,12);
  for(i=0;i<3;i++){ var a=i/3*PI*2, f=G.box(0.06,0.7,0.5,M.med,Math.cos(a)*0.5,0.5,Math.sin(a)*0.5,g); f.rotation.y=-a+PI/2; }
  G.cone(0.28,0.5,M.acento('ambar',1),0,0.05,0,g,8).rotation.x=PI; return g; } };
P.semaforo={ desc:'Semáforo', tam:'3.2 m de alto', tono:0.4, build:function(o,M){ var g=grp(); G.cyl(0.06,0.08,2.4,M.main,0,1.2,0,g,8); G.box(0.34,0.86,0.26,M.osc,0,2.8,0,g);
  G.sph(0.09,M.acento('rojo',1),0,3.06,0.12,g,8,6); G.sph(0.09,M.acento('ambar',0.3),0,2.8,0.12,g,8,6); G.sph(0.09,M.acento('verde',0.25),0,2.54,0.12,g,8,6); return g; } };
P.arbol={ desc:'Árbol', tam:'3.8 m de alto', build:function(o,M){ var g=grp(), hoja=M.coloreado?M.main:M.lit('#22382f'); G.cyl(0.12,0.17,1.4,M.osc,0,0.7,0,g,6); G.ico(1.15,hoja,0,2.2,0,g,0); G.ico(0.8,hoja,0.1,3.1,0.05,g,0); return g; } };
P.montana={ desc:'Montaña', tam:'10 m de ancho, 7 m de alto', tono:0.3, build:function(o,M){ var g=grp(); G.cone(5,7,M.main,0,3.5,0,g,5); G.cone(1.3,1.82,M.cla2,0,6.1,0,g,5); G.cone(3.2,4,M.main,3.6,2,1,g,5); return g; } };
P.maleta={ desc:'Maleta con ruedas', tam:'0.9 m de alto', build:function(o,M){ var g=grp(), i; G.box(0.45,0.62,0.24,M.main,0,0.37,0,g);
  for(i=0;i<4;i++) G.box(0.025,0.56,0.012,M.cla2,-0.15+i*0.1,0.37,0.123,g);
  [-1,1].forEach(function(s){ G.cyl(0.035,0.035,0.04,M.osc,s*0.17,0.035,0,g,8).rotation.z=PI/2; G.cyl(0.01,0.01,0.2,M.cla,s*0.1,0.78,-0.06,g,6); }); G.box(0.24,0.03,0.03,M.osc,0,0.89,-0.06,g); return g; } };
P.caja={ desc:'Paquete de cartón', tam:'0.5 m de ancho', tono:0.6, build:function(o,M){ var g=grp(); G.box(0.5,0.4,0.4,M.main,0,0.2,0,g); G.box(0.09,0.404,0.404,M.cla,0,0.2,0,g); return g; } };
P.mesa={ desc:'Mesa', tam:'1.4 m de ancho, 0.78 m de alto', tono:0.5, apoyo:0.78, build:function(o,M){ var g=grp(); G.box(1.4,0.05,0.7,M.main,0,0.755,0,g);
  [-1,1].forEach(function(sx){ [-1,1].forEach(function(sz){ G.box(0.06,0.73,0.06,M.med,sx*0.62,0.365,sz*0.28,g); }); }); return g; } };
P.silla={ desc:'Silla', tam:'1 m de alto', tono:0.5, apoyo:0.47, build:function(o,M){ var g=grp(); G.box(0.45,0.05,0.45,M.main,0,0.445,0,g); G.box(0.45,0.5,0.05,M.main,0,0.75,-0.2,g);
  [-1,1].forEach(function(sx){ [-1,1].forEach(function(sz){ G.box(0.04,0.42,0.04,M.med,sx*0.19,0.21,sz*0.19,g); }); }); return g; } };
P.cama={ desc:'Cama (la almohada queda hacia -z). Para acostar a alguien: persona con anim "acostado" y sobre: id de la cama', tam:'1.25 x 2.3 m', tono:0.36, apoyo:0.46,
  build:function(o,M){ var g=grp(); G.box(1.25,0.34,2.3,M.main,0,0.17,0,g); G.box(1.15,0.12,2.2,M.lit('#56637b'),0,0.4,0,g); G.box(0.72,0.1,0.42,M.lit('#8d99ab'),0,0.51,-0.82,g); G.box(1.14,0.26,0.92,M.lit('#34405a'),0,0.59,0.62,g); return g; } };
P.libro={ desc:'Libro de pie', tam:'0.28 m de alto', build:function(o,M){ var g=grp(); G.box(0.2,0.28,0.05,M.main,0,0.14,0,g); G.box(0.19,0.26,0.04,M.cla2,0.008,0.14,0,g); return g; } };
P.moneda={ desc:'Moneda de pie', tam:'0.32 m de diametro', color:'ambar', build:function(o,M){ var g=grp(); G.cyl(0.16,0.16,0.03,M.main,0,0.16,0,g,18).rotation.x=PI/2; G.tor(0.115,0.01,M.osc,0,0.16,0.016,g); return g; } };
P.billete={ desc:'Billete de pie', tam:'0.32 m de ancho', color:'verde', build:function(o,M){ var g=grp(); G.box(0.32,0.15,0.006,M.main,0,0.075,0,g); G.cyl(0.04,0.04,0.008,M.osc,0,0.075,0,g,12).rotation.x=PI/2; return g; } };
P.reloj={ desc:'Reloj de pared de pie', tam:'0.5 m de diametro', build:function(o,M){ var g=grp(); G.cyl(0.25,0.25,0.04,M.main,0,0.25,0,g,20).rotation.x=PI/2; G.box(0.02,0.16,0.01,M.osc,0,0.32,0.025,g); var h=G.box(0.02,0.11,0.01,M.osc,0.045,0.27,0.025,g); h.rotation.z=-1.2; return g; } };
P.botella={ desc:'Botella', tam:'0.25 m de alto', build:function(o,M){ var g=grp(); G.cyl(0.045,0.045,0.18,M.main,0,0.09,0,g,10); G.cyl(0.018,0.04,0.05,M.main,0,0.205,0,g,10); G.cyl(0.021,0.021,0.02,M.cla2,0,0.24,0,g,8); return g; } };
P.plato={ desc:'Plato con comida', tam:'0.4 m de diametro', tono:0.6, build:function(o,M){ var g=grp(); G.cyl(0.2,0.14,0.025,M.main,0,0.0125,0,g,16); G.ico(0.06,M.acento('verde',0.3),-0.06,0.07,0.03,g,0); G.box(0.1,0.05,0.07,M.acento('ambar',0.3),0.06,0.05,0.04,g); G.sph(0.05,M.crema,0.01,0.06,-0.07,g,8,6); return g; } };
P.matraz={ desc:'Matraz de laboratorio con líquido', tam:'0.35 m de alto', build:function(o,M){ var g=grp(), v=E.mat(E.tono(0.7),{transparent:true, opacity:0.28, depthWrite:false}); G.cone(0.13,0.22,v,0,0.11,0,g,12); G.cyl(0.035,0.035,0.14,v,0,0.28,0,g,10);
  G.cone(0.1,0.1,M.coloreado?M.main:M.acento('verde',0.5),0,0.05,0,g,12); return g; } };
P.mancuerna={ desc:'Mancuerna (para sostenerla: en_mano)', tam:'0.34 m de ancho', build:function(o,M){ var g=grp(); G.cyl(0.02,0.02,0.3,M.main,0,0.085,0,g,8).rotation.z=PI/2;
  [-1,1].forEach(function(s){ G.cyl(0.085,0.085,0.085,M.main,s*0.125,0.085,0,g,6).rotation.z=PI/2; }); return g; }, centrado:true };

/* ====================== CIENCIA Y CUERPO ====================== */
P.cerebro={ desc:'Cerebro visto de lado (la frente hacia +x)', tam:'1.5 m de largo (escala abstracta)', frente:'x', build:function(o,M,R){ var g=grp();
  [-1,1].forEach(function(s){ var h=G.ico(0.5,M.main,0.05,0.74,s*0.23,g,2); G.lumpy(h,0.07,R); h.scale.set(1.42,0.92,0.6); });
  var c=G.ico(0.26,M.coloreado?M.main:M.cla2,-0.48,0.36,0,g,1); G.lumpy(c,0.08,R); c.scale.set(1.2,0.75,1.5);
  G.cyl(0.08,0.055,0.38,M.cla,-0.22,0.17,0,g,6).rotation.z=-0.35; return g; } };
P.corazon={ desc:'Corazón', tam:'1.3 m de alto (escala abstracta)', color:'rojo', build:function(o,M){ var g=grp();
  [-1,1].forEach(function(s){ G.ico(0.36,M.main,s*0.25,0.92,0,g,1); }); var c=G.cone(0.585,0.92,M.main,0,0.42,0,g,10); c.rotation.x=PI; c.scale.z=0.7;
  G.cyl(0.09,0.1,0.32,M.cla2,0.1,1.34,0,g,8).rotation.z=-0.3; return g; } };
P.pulmones={ desc:'Pulmones', tam:'1.6 m de alto (escala abstracta)', build:function(o,M,R){ var g=grp();
  [-1,1].forEach(function(s){ var l=G.ico(0.5,M.main,s*0.43,0.7,0,g,1); G.lumpy(l,0.07,R); l.scale.set(0.68,1.25,0.6); var b=G.cyl(0.04,0.05,0.4,M.cla2,s*0.17,1.22,0,g,6); b.rotation.z=s*0.9; });
  G.cyl(0.07,0.07,0.5,M.cla2,0,1.55,0,g,8); return g; } };
P.estomago={ desc:'Estómago', tam:'1.2 m de ancho (escala abstracta)', build:function(o,M,R){ var g=grp(); var s=G.ico(0.5,M.main,0,0.55,0,g,1); G.lumpy(s,0.06,R); s.scale.set(1.15,0.8,0.7); s.rotation.z=0.45;
  G.cyl(0.08,0.08,0.5,M.cla2,-0.38,1.05,0,g,8).rotation.z=0.15; G.cyl(0.07,0.07,0.4,M.cla2,0.55,0.25,0,g,8).rotation.z=1.2; return g; } };
P.musculo={ desc:'Músculo en forma de huso con tendones, a lo largo de x', tam:'2.8 m de largo (escala abstracta)', frente:'x', build:function(o,M){ var g=grp(); var m=G.ico(0.5,M.main,0,0.42,0,g,1); m.scale.set(2.1,0.78,0.78);
  [-1,1].forEach(function(s){ var t=G.cyl(0.06,0.12,0.5,M.cla2,s*1.2,0.42,0,g,8); t.rotation.z=s*PI/2; }); return g; } };
P.fibra={ desc:'Tubo o fibra a lo largo de x', tam:'largo (6) y radio (0.3)', frente:'x', build:function(o,M){ var g=grp(), L=num(o.largo,6), r=num(o.radio,0.3); G.cyl(r,r,L,M.main,0,r,0,g,10).rotation.z=PI/2; return g; } };
P.hueso={ desc:'Hueso', tam:'0.7 m de largo (escala abstracta)', frente:'x', build:function(o,M){ var g=grp(); G.cyl(0.055,0.055,0.5,M.main,0,0.1,0,g,8).rotation.z=PI/2;
  [-1,1].forEach(function(s){ G.sph(0.085,M.main,s*0.27,0.1,0.05,g,8,6); G.sph(0.085,M.main,s*0.27,0.1,-0.05,g,8,6); }); return g; } };
P.ojo={ desc:'Ojo', tam:'0.5 m de diametro (escala abstracta)', build:function(o,M){ var g=grp(); G.sph(0.25,M.coloreado?M.main:M.crema,0,0.25,0,g,14,10); G.cyl(0.12,0.12,0.02,M.acento('azul',0.4),0,0.25,0.232,g,14).rotation.x=PI/2; G.cyl(0.055,0.055,0.022,M.vidrio,0,0.25,0.24,g,10).rotation.x=PI/2; return g; } };
P.celula={ desc:'Célula con núcleo', tam:'2 m de diametro (escala abstracta)', build:function(o,M,R){ var g=grp(), i, piel=M.main.clone(); piel.transparent=true; piel.opacity=0.24; piel.depthWrite=false;
  G.ico(1,piel,0,1,0,g,1); G.ico(0.36,M.main,0.12,1,0,g,1);
  for(i=0;i<6;i++){ var a=R()*PI*2, b=(R()-0.5)*1.6, c=G.cap(0.06,0.14,M.cla2,Math.cos(a)*0.62,1+b*0.4,Math.sin(a)*0.62,g,6); c.rotation.set(R()*3,R()*3,R()*3); } return g; } };
P.neurona={ desc:'Neurona con axón hacia +x', tam:'3.4 m de largo (escala abstracta)', frente:'x', build:function(o,M,R){ var g=grp(), i; G.ico(0.36,M.main,0,0.9,0,g,1);
  for(i=0;i<6;i++){ var a=PI*0.55+i/5*PI*0.9, e=(R()-0.5)*1.2, d=G.cyl(0.015,0.06,0.75,M.main,Math.cos(a)*0.62,0.9+Math.sin(a)*0.62*Math.cos(e),Math.sin(e)*0.5,g,5); d.rotation.set(Math.sin(e)*0.8,0,a-PI/2); }
  G.cyl(0.05,0.05,2.4,M.main,1.5,0.9,0,g,6).rotation.z=PI/2;
  [-1,0,1].forEach(function(s){ var t=G.cyl(0.02,0.04,0.45,M.main,2.86,0.9+s*0.16,0,g,5); t.rotation.z=PI/2-s*0.7; G.sph(0.06,M.cla2,3.06,0.9+s*0.31,0,g,6,5); }); return g; } };
P.adn={ desc:'Hélice de ADN', tam:'3 m de alto (escala abstracta)', build:function(o,M){ var g=grp(), i;
  for(i=0;i<15;i++){ var a=i*0.5, y=0.1+i*0.2, c=Math.cos(a)*0.4, s=Math.sin(a)*0.4; G.sph(0.09,M.main,c,y,s,g,8,6); G.sph(0.09,M.cla2,-c,y,-s,g,8,6); var r=G.box(0.8,0.03,0.03,M.cla,0,y,0,g); r.rotation.y=-a; } return g; } };
P.molecula={ desc:'Molécula (átomo central con enlaces)', tam:'1.2 m (escala abstracta)', opciones:'atomos (2 a 4)', build:function(o,M){ var g=grp(), n=E.clamp(num(o.atomos,2),1,4)|0, i; G.ico(0.3,M.main,0,0.6,0,g,1);
  var dirs=[[0.62,0.36,0],[-0.62,0.36,0],[0,-0.3,0.62],[0,0.75,-0.2]];
  for(i=0;i<n;i++){ var d=dirs[i], v=new THREE.Vector3(d[0],d[1],d[2]); G.ico(0.19,M.cla2,v.x,0.6+v.y,v.z,g,1);
    var st=G.cyl(0.04,0.04,v.length(),M.cla,v.x/2,0.6+v.y/2,v.z/2,g,6); st.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0), v.clone().normalize()); } return g; } };
P.virus={ desc:'Virus con espículas', tam:'1.4 m de diametro (escala abstracta)', build:function(o,M){ var g=grp(), i, n=16; G.ico(0.5,M.main,0,0.72,0,g,1);
  for(i=0;i<n;i++){ var y=1-(i+0.5)*2/n, r=Math.sqrt(1-y*y), a=i*2.399963, v=new THREE.Vector3(Math.cos(a)*r,y,Math.sin(a)*r);
    var s=G.cyl(0.03,0.03,0.2,M.cla2,v.x*0.58,0.72+v.y*0.58,v.z*0.58,g,5); s.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v); G.sph(0.06,M.coloreado?M.cla2:M.acento('rojo',0.4),v.x*0.7,0.72+v.y*0.7,v.z*0.7,g,6,5); } return g; } };
P.gota={ desc:'Gota', tam:'0.7 m de alto (escala abstracta)', color:'azul', build:function(o,M){ var g=grp(); G.ico(0.25,M.main,0,0.25,0,g,1); G.cone(0.215,0.4,M.main,0,0.56,0,g,10); return g; } };
P.pastilla={ desc:'Cápsula de medicamento', tam:'0.4 m de largo (escala abstracta)', frente:'x', build:function(o,M){ var g=grp(), b=M.coloreado?M.cla2:M.acento('rojo',0.3);
  G.cyl(0.08,0.08,0.12,M.main,-0.06,0.08,0,g,12).rotation.z=PI/2; G.sph(0.08,M.main,-0.12,0.08,0,g,12,8); G.cyl(0.08,0.08,0.12,b,0.06,0.08,0,g,12).rotation.z=PI/2; G.sph(0.08,b,0.12,0.08,0,g,12,8); return g; } };
P.planeta={ desc:'Planeta Tierra', tam:'6 m de diametro', opciones:'anillo: true para un planeta con anillo', eje:'y', build:function(o,M,R){ var g=grp(), mar=M.coloreado?M.main:M.lit('#274a7d'), tierra=M.lit('#2c6a55'), i; G.ico(3,mar,0,3,0,g,2);
  for(i=0;i<7;i++){ var v=new THREE.Vector3(R()-0.5,R()-0.5,R()-0.5).normalize(), c=G.ico(0.9+R()*0.7,tierra,v.x*2.82,3+v.y*2.82,v.z*2.82,g,1); c.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v); c.scale.set(1,0.24,1); }
  if(o.anillo){ var t=G.tor(4.4,0.05,M.cla2,0,3,0,g); t.rotation.x=PI/2-0.35; t.scale.z=6; } return g; } };
P.sol={ desc:'Sol', tam:'3 m de diametro', build:function(o,M){ var g=grp(), m=M.acento('ambar',0.9), i; G.ico(1.2,m,0,1.5,0,g,1);
  for(i=0;i<8;i++){ var a=i/8*PI*2, c=G.cone(0.14,0.38,m,Math.cos(a)*1.48,1.5+Math.sin(a)*1.48,0,g,5); c.rotation.z=a-PI/2; } return g; } };
P.luna={ desc:'Luna', tam:'2 m de diametro', color:'crema', build:function(o,M){ var g=grp(); G.ico(1,M.main,0,1,0,g,1); return g; } };
})();
