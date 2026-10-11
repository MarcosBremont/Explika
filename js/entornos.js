/* Explika · escenarios (entornos)
   Cada uno arma su decorado fijo dentro de un grupo y devuelve datos para la cámara:
   interior (limita ángulos), maxDist (distancia máxima), niebla (false la apaga).
   La zona libre para colocar objetos es más o menos x de -4 a 4 y z de -3 a 4; la cámara mira desde +z. */
(function(){
'use strict';
var E=window.E3D, G=E.G, EN=E.ENTORNOS={}, PI=Math.PI;

function suelo(g,M,k,tam){ var p=new THREE.Mesh(new THREE.PlaneGeometry(tam||160,tam||160), M.tono(k)); p.rotation.x=-PI/2; g.add(p); return p; }
function puntos(R,n,fn,color,size,fog){
  var pos=[], i, v; for(i=0;i<n;i++){ v=fn(R); pos.push(v[0],v[1],v[2]); }
  var bg=new THREE.BufferGeometry(); bg.setAttribute('position', new THREE.Float32BufferAttribute(pos,3));
  return new THREE.Points(bg, new THREE.PointsMaterial({color:color, size:size, transparent:true, opacity:0.85, fog:fog!==false}));
}
function ventanas(g,M,R,n,x0,x1,y0,y1,z){ var luz=M.emis('#e9c98b',1), i; for(i=0;i<n;i++) G.box(0.07,0.07,0.02,luz,x0+R()*(x1-x0),y0+R()*(y1-y0),z,g); }
function ciudadLejana(g,M,R,z,n){ var i; for(i=0;i<n;i++){ var h=3+R()*9, w=2+R()*2, x=-30+i*(60/n)+R()*2; G.box(w,h,w,M.tono(0.1+R()*0.05),x,h/2,z-R()*6,g); ventanas(g,M,R,4,x-w/2,x+w/2,1,h-0.5,z+w/2+0.02); } }

EN.vacio={ desc:'Fondo oscuro neutro con suelo y cuadrícula tenue. Sirve para cualquier tema abstracto.',
  build:function(g,M,R){ var i; suelo(g,M,0.05);
    for(i=-12;i<=12;i++){ G.box(0.02,0.004,48,M.tono(0.13),i*2,0.002,0,g); G.box(48,0.004,0.02,M.tono(0.13),0,0.002,i*2,g); }
    E.fusionar(g,true);
    g.add(puntos(R,160,function(R){ return [(R()-0.5)*50, 0.5+R()*14, (R()-0.5)*50-6]; },0x5b6a84,0.06));
    return {}; } };

EN.ciudad={ desc:'Ciudad de noche vista desde una plaza despejada: edificios con ventanas encendidas alrededor.',
  build:function(g,M,R){ var gx,gz,k; suelo(g,M,0.04,300);
    G.box(17,0.03,17,M.tono(0.1),0,0.015,0,g);
    for(gx=-10;gx<=10;gx++) for(gz=-10;gz<=8;gz++){
      if(Math.abs(gx)<=2 && Math.abs(gz)<=2) continue;
      var cerca = gz>=1 || gx>=3, h = cerca ? 1.2+R()*2.4 : 3+R()*12, w=2.1+R()*0.9, d=2.1+R()*0.9, x=gx*3.8+(R()-0.5)*0.6, z=gz*3.8+(R()-0.5)*0.6;
      G.box(w,h,d,M.tono(0.09+R()*0.07),x,h/2,z,g);
      var n=2+((R()*8)|0);
      for(k=0;k<n;k++){ if(R()<0.5) G.box(0.1,0.1,0.02,M.emis('#e9c98b',1),x+(R()-0.5)*w*0.8,0.5+R()*(h-0.8),z+d/2+0.01,g); else G.box(0.02,0.1,0.1,M.emis('#e9c98b',1),x+w/2+0.01,0.5+R()*(h-0.8),z+(R()-0.5)*d*0.8,g); }
    }
    E.fusionar(g,true); return { maxDist:60 }; } };

EN.calle={ desc:'Calle de noche: calzada que cruza de izquierda a derecha (eje x), edificios y farolas al fondo.',
  build:function(g,M,R){ var i; suelo(g,M,0.09,300); G.box(140,0.02,7,M.tono(0.035),0,0.01,0,g);
    for(i=-17;i<=17;i++) G.box(1.6,0.006,0.12,M.tono(0.5),i*4,0.024,0,g);
    G.box(140,0.03,0.18,M.tono(0.3),0,0.02,3.5,g); G.box(140,0.03,0.18,M.tono(0.3),0,0.02,-3.5,g);
    for(i=-9;i<=9;i++){ var h=5+R()*9, w=5+R()*2.5, x=i*8+(R()-0.5); G.box(w,h,5,M.tono(0.12+R()*0.06),x,h/2,-9.5,g); ventanas(g,M,R,7,x-w/2+0.3,x+w/2-0.3,1.2,h-0.6,-6.98);
      G.box(1.1,2.1,0.06,M.tono(0.05),x,1.05,-6.98,g); }
    for(i=-6;i<=6;i++){ G.cyl(0.05,0.07,4,M.tono(0.3),i*7+3,2,-5.2,g,6); G.box(0.9,0.06,0.08,M.tono(0.3),i*7+3,4,-4.8,g); G.sph(0.11,M.emis('#e9c98b',1),i*7+3,3.92,-4.4,g,8,6); }
    E.fusionar(g,true); return { maxDist:40 }; } };

EN.gimnasio={ desc:'Gimnasio de noche: racks, bancos y espejos al fondo.', interior:true,
  build:function(g,M,R){ var i; suelo(g,M,0.05,70); G.box(2.8,0.05,2.3,M.tono(0.16),0,0.025,0,g); G.box(24,5.4,0.3,M.tono(0.08),0,2.7,-5.4,g);
    for(i=-4;i<=4;i++) G.box(2.15,2.5,0.06,M.tono(0.16),i*2.35,1.55,-5.22,g);
    G.box(24,1.15,0.06,M.lit(0x0b1018),0,4.1,-5.22,g); ventanas(g,M,R,46,-10,10,3.65,4.55,-5.17);
    [-7.5,7.5].forEach(function(x){ G.box(0.5,5.4,0.5,M.tono(0.16),x,2.7,-2.2,g); });
    [-1.6,-3.9].forEach(function(z){ G.box(24,0.22,0.3,M.tono(0.08),0,4.9,z,g); });
    [-4.5,0,4.5].forEach(function(x){ G.box(1.7,0.04,0.1,M.emis('#dfe7f5',0.5),x,4.76,-1.6,g); });
    function rack(x,z){ var m=M.tono(0.24), m3=M.tono(0.36);
      [-1,1].forEach(function(sx){ [-1,1].forEach(function(sz){ G.box(0.09,2.4,0.09,m,x+sx*0.65,1.2,z+sz*0.55,g); }); G.box(0.09,0.09,1.19,m,x+sx*0.65,2.4,z,g); });
      [-1,1].forEach(function(sz){ G.box(1.39,0.09,0.09,m,x,2.4,z+sz*0.55,g); });
      G.cyl(0.025,0.025,2.2,m3,x,1.45,z+0.6,g,6).rotation.z=PI/2;
      [-1,1].forEach(function(sx){ G.cyl(0.24,0.24,0.1,m3,x+sx*0.95,1.45,z+0.6,g,10).rotation.z=PI/2; }); }
    rack(-3.1,-3.7); rack(0.2,-3.9); rack(3.5,-3.7);
    [[-2.6,-1.6,0.3],[3.1,-1.9,-0.4]].forEach(function(b){ var bg=new THREE.Group(); G.box(0.42,0.1,1.3,M.tono(0.24),0,0.46,0,bg); G.box(0.08,0.42,0.08,M.tono(0.24),0,0.21,0.5,bg); G.box(0.08,0.42,0.08,M.tono(0.24),0,0.21,-0.5,bg); bg.position.set(b[0],0,b[1]); bg.rotation.y=b[2]; g.add(bg); });
    [0.55,1.0].forEach(function(y){ G.box(3.4,0.07,0.42,M.tono(0.24),-5.6,y,-4.7,g); for(var k=0;k<7;k++) G.cyl(0.09,0.09,0.3,M.tono(0.36),-7.0+k*0.46,y+0.13,-4.7,g,6).rotation.x=PI/2; });
    for(i=0;i<5;i++) G.cyl(0.3-i*0.03,0.3-i*0.03,0.07,M.tono(0.36),5.2,0.04+i*0.075,-2.6,g,10);
    E.fusionar(g,true); return { interior:true, maxDist:9 }; } };

EN.habitacion={ desc:'Dormitorio de noche: dos paredes, ventana con la ciudad, mesa de noche con lámpara. Añade la cama como objeto.', interior:true,
  build:function(g,M,R){ suelo(g,M,0.035,300); G.box(8.4,0.1,7.4,M.tono(0.16),0,0.0,0.2,g); G.box(8.4,3,0.14,M.tono(0.13),0,1.5,-3.45,g); G.box(0.14,3,7.4,M.tono(0.11),-4.2,1.5,0.2,g);
    G.box(2.2,1.3,0.05,M.lit(0x0b1018),1.6,1.8,-3.37,g); ventanas(g,M,R,14,0.6,2.6,1.25,2.35,-3.34); G.box(2.3,0.06,0.1,M.tono(0.3),1.6,1.12,-3.36,g);
    G.box(3.4,0.02,2.4,M.tono(0.22),0.4,0.06,0.6,g);
    G.box(0.5,0.52,0.46,M.tono(0.36),-2.6,0.31,-2.9,g); G.cyl(0.03,0.05,0.22,M.tono(0.3),-2.6,0.68,-2.9,g,6); G.sph(0.1,M.emis('#e9c98b',1),-2.6,0.86,-2.9,g,8,6);
    G.box(1.3,2.1,0.5,M.tono(0.2),-3.4,1.05,1.9,g);
    ciudadLejana(g,M,R,-20,14);
    E.fusionar(g,true); return { interior:true, maxDist:9 }; } };

EN.oficina={ desc:'Oficina de noche: escritorios con pantallas al fondo y ventanal con la ciudad.', interior:true,
  build:function(g,M,R){ var i,k; suelo(g,M,0.07,90); G.box(26,4.2,0.2,M.tono(0.09),0,2.1,-7,g); G.box(22,2.4,0.06,M.lit(0x0b1018),0,2.3,-6.88,g); ventanas(g,M,R,70,-10.5,10.5,1.25,3.35,-6.84);
    for(i=-4;i<=4;i++) G.box(0.1,2.5,0.1,M.tono(0.26),i*2.6,2.3,-6.82,g);
    for(k=0;k<2;k++) for(i=-3;i<=3;i++){ var x=i*2.5+(k?1.2:0), z=-5-k*-1.9+(k?0:0); z=-5.2+k*1.9;
      G.box(1.5,0.05,0.7,M.tono(0.32),x,0.75,z,g); G.box(0.06,0.73,0.6,M.tono(0.22),x-0.7,0.365,z,g); G.box(0.06,0.73,0.6,M.tono(0.22),x+0.7,0.365,z,g);
      G.box(0.55,0.33,0.03,M.tono(0.4),x,1.13,z-0.15,g); G.box(0.5,0.28,0.01,M.emis('#9fb6e0',0.45),x,1.13,z-0.13,g); G.box(0.04,0.2,0.03,M.tono(0.3),x,0.88,z-0.16,g); }
    [-8.5,8.5].forEach(function(x){ G.box(0.6,4.2,0.6,M.tono(0.15),x,2.1,-2.5,g); });
    [-5,0,5].forEach(function(x){ G.box(2,0.04,0.12,M.emis('#dfe7f5',0.5),x,4.1,-3,g); });
    E.fusionar(g,true); return { interior:true, maxDist:10 }; } };

EN.aula={ desc:'Salón de clases: pizarra grande al fondo y pupitres a los lados.', interior:true,
  build:function(g,M,R){ var i,k; suelo(g,M,0.08,90); G.box(20,4,0.2,M.tono(0.11),0,2,-5.6,g); G.box(6.4,2,0.08,M.lit('#17251f'),0,2.1,-5.46,g); G.box(6.6,0.08,0.14,M.tono(0.4),0,1.06,-5.42,g); G.box(6.6,0.08,0.14,M.tono(0.4),0,3.14,-5.42,g);
    G.box(0.14,4,12,M.tono(0.09),-7.2,2,0,g); for(i=0;i<3;i++){ G.box(0.05,1.4,2,M.lit(0x0b1018),-7.1,2.2,-3.2+i*3,g); ventanas(g,M,R,6,-7.06,-7.06,1.7,2.8,-4+i*3+R()*1.6); }
    for(k=0;k<2;k++) for(i=0;i<3;i++){ var x=(k?1:-1)*(4.3+0.0), z=-2.6+i*1.9;
      G.box(1.1,0.05,0.55,M.tono(0.34),x,0.72,z,g); G.box(0.05,0.7,0.5,M.tono(0.22),x-0.5,0.35,z,g); G.box(0.05,0.7,0.5,M.tono(0.22),x+0.5,0.35,z,g); G.box(0.42,0.05,0.42,M.tono(0.3),x,0.44,z+0.65,g); G.box(0.42,0.45,0.05,M.tono(0.3),x,0.7,z+0.86,g); }
    G.box(1.6,0.06,0.7,M.tono(0.34),-3.2,0.78,-4.2,g); G.box(1.5,0.74,0.06,M.tono(0.22),-3.2,0.39,-3.9,g);
    [-4,0,4].forEach(function(x){ G.box(2,0.04,0.12,M.emis('#dfe7f5',0.5),x,3.9,-2.4,g); });
    E.fusionar(g,true); return { interior:true, maxDist:9 }; } };

EN.cocina={ desc:'Cocina de noche: encimera con gabinetes al fondo, nevera y ventana.', interior:true,
  build:function(g,M,R){ var i; suelo(g,M,0.09,80); G.box(14,3.2,0.16,M.tono(0.12),0,1.6,-3.6,g); G.box(0.16,3.2,9,M.tono(0.1),-5.2,1.6,0.8,g);
    G.box(7.4,0.9,0.66,M.tono(0.24),-0.8,0.45,-3.2,g); G.box(7.5,0.06,0.72,M.tono(0.42),-0.8,0.93,-3.2,g);
    for(i=0;i<6;i++) G.box(0.03,0.7,0.02,M.tono(0.36),-4.1+i*1.2,0.47,-2.86,g);
    G.box(4.4,0.85,0.4,M.tono(0.22),-2.3,2.45,-3.34,g); for(i=0;i<3;i++) G.box(0.03,0.7,0.02,M.tono(0.34),-3.5+i*1.2,2.45,-3.13,g);
    G.box(1.5,1.05,0.05,M.lit(0x0b1018),1.4,2.2,-3.5,g); ventanas(g,M,R,10,0.75,2.05,1.75,2.65,-3.46);
    G.box(1.05,2.1,0.8,M.tono(0.34),3.6,1.05,-3.15,g); G.box(0.03,0.6,0.03,M.tono(0.5),3.2,1.5,-2.74,g); G.box(1.05,0.02,0.82,M.tono(0.2),3.6,1.3,-3.15,g);
    [-1,1].forEach(function(s){ G.cyl(0.14,0.14,0.02,M.tono(0.1),-0.2+s*0.25,0.97,-3.2,g,12); });
    G.box(1.2,0.03,0.12,M.emis('#dfe7f5',0.5),-2.3,2.0,-3.2,g);
    E.fusionar(g,true); return { interior:true, maxDist:8 }; } };

EN.micro={ desc:'Interior del cuerpo o mundo microscópico: vacío oscuro con tubos lejanos y partículas flotando. Sin suelo: los objetos flotan.',
  build:function(g,M,R){
    [[-8,-12],[7,-15],[-3,-22],[-14,-6],[12,-24]].forEach(function(p){ G.cyl(3.3,3.3,90,M.tono(0.045),-6,p[0],p[1],g,12).rotation.z=PI/2; });
    E.fusionar(g,true);
    g.add(puntos(R,220,function(R){ return [(R()-0.5)*40, (R()-0.5)*24+2, (R()-0.5)*26-2]; },0x5b6a84,0.07));
    return { sinSuelo:true, maxDist:40 }; } };

EN.espacio={ desc:'Espacio exterior con estrellas. Sin suelo: los objetos flotan. Úsalo con planeta, satelite, sol, luna, cohete.',
  build:function(g,M,R){
    g.add(puntos(R,900,function(R){ var v=new THREE.Vector3(R()-0.5,R()-0.5,R()-0.5).normalize().multiplyScalar(180+R()*60); return [v.x,v.y,v.z]; },0xcfd8ea,0.9,false));
    return { sinSuelo:true, niebla:false, maxDist:120 }; } };

EN.naturaleza={ desc:'Exterior de noche: claro con árboles alrededor, colinas al fondo y luna.',
  build:function(g,M,R){ var i; var s=new THREE.Mesh(new THREE.PlaneGeometry(300,300), M.lit('#121c1a')); s.rotation.x=-PI/2; g.add(s);
    for(i=0;i<34;i++){ var a=R()*PI*2, d=7.5+R()*22, x=Math.cos(a)*d, z=Math.sin(a)*d-4; if(z>1.5 && Math.abs(x)<16) continue; var k=0.8+R()*0.9;
      G.cyl(0.12*k,0.17*k,1.4*k,M.tono(0.14),x,0.7*k,z,g,6); G.ico(1.15*k,M.lit('#1c2f29'),x,2.2*k,z,g,0); G.ico(0.8*k,M.lit('#203730'),x+0.1,3.1*k,z,g,0); }
    for(i=0;i<5;i++){ var h=G.ico(14+R()*8,M.lit('#141e1e'),-48+i*24+R()*6,-6,-52-R()*10,g,1); h.scale.y=0.55; }
    for(i=0;i<40;i++) G.box(0.05,0.18+R()*0.2,0.05,M.lit('#22382f'),(R()-0.5)*14,0.1,(R()-0.5)*12,g);
    E.fusionar(g,true);
    var luna=new THREE.Mesh(new THREE.IcosahedronGeometry(3,2), new THREE.MeshBasicMaterial({color:E.color('crema'), fog:false})); luna.position.set(-24,26,-70); g.add(luna);
    g.add(puntos(R,300,function(R){ var a=R()*PI*2, e=0.15+R()*1.2; return [Math.cos(a)*Math.cos(e)*200, Math.sin(e)*200, Math.sin(a)*Math.cos(e)*200]; },0xcfd8ea,0.8,false));
    return { maxDist:45 }; } };
})();
