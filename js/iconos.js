/* Explika · iconos de trazo (lienzo de 24x24). p = trazos, c = círculos [cx,cy,r], d = puntos rellenos [cx,cy,r] */
(function(){
'use strict';
var E=window.E3D;
E.ICONOS = {
  wifi:{ p:'M5 12.5a10 10 0 0 1 14 0M8.2 15.7a5.4 5.4 0 0 1 7.6 0M2 9.2a14.5 14.5 0 0 1 20 0', d:[[12,19,1.1]] },
  gps:{ p:'M12 21s-6.5-5.6-6.5-10.5a6.5 6.5 0 0 1 13 0C18.5 15.4 12 21 12 21z', c:[[12,10.5,2.3]] },
  senal:{ p:'M5 20v-3M10 20v-7M15 20v-11M20 20v-15' },
  bluetooth:{ p:'M7 7.5l10 9-5 4.5V3l5 4.5-10 9' },
  bateria:{ p:'M3 8h15v8H3zM21 11v2M6.5 11v2M9.5 11v2' },
  rayo:{ p:'M13 2.5L4.5 13.5H11l-1 8L19.5 10.5H13z' },
  nube:{ p:'M7 18.5a4.5 4.5 0 0 1-.6-8.96A6 6 0 0 1 18 10.5a4 4 0 0 1-.5 8z' },
  internet:{ p:'M3 12h18M12 3c3.2 3 3.2 15 0 18M12 3c-3.2 3-3.2 15 0 18', c:[[12,12,9]] },
  servidor:{ p:'M4 4.5h16v6H4zM4 13.5h16v6H4z', d:[[7.5,7.5,0.9],[7.5,16.5,0.9]] },
  telefono:{ p:'M7.5 2.5h9v19h-9zM11 18.5h2' },
  chip:{ p:'M7 7h10v10H7zM10 3v4M14 3v4M10 17v4M14 17v4M3 10h4M3 14h4M17 10h4M17 14h4' },
  candado:{ p:'M6 11h12v9H6zM8.5 11V7.5a3.5 3.5 0 0 1 7 0V11' },
  escudo:{ p:'M12 3l7.5 3v5.5c0 4.6-3.2 8-7.5 9.5-4.3-1.5-7.5-4.9-7.5-9.5V6z' },
  llave:{ p:'M11 12l8.5-8.5M16 6.5l2.5 2.5M13.5 9l2 2', c:[[8,15,4]] },
  ojo:{ p:'M2.5 12s3.5-6.5 9.5-6.5 9.5 6.5 9.5 6.5-3.5 6.5-9.5 6.5S2.5 12 2.5 12z', c:[[12,12,2.8]] },
  lupa:{ p:'M15.5 15.5L21 21', c:[[10.5,10.5,6.5]] },
  reloj:{ p:'M12 7v5l3.2 2', c:[[12,12,9]] },
  calendario:{ p:'M4 6h16v14H4zM4 10h16M8 3.5v4M16 3.5v4' },
  dinero:{ p:'M12 2.5v19M16.5 7.2c-.6-1.5-2.3-2.2-4.5-2.2-2.6 0-4.4 1.2-4.4 3.2 0 4.6 9.2 2.2 9.2 7 0 2-1.9 3.3-4.8 3.3-2.5 0-4.3-.9-5-2.6' },
  tarjeta:{ p:'M3 6h18v12H3zM3 10h18M6.5 14.5h4' },
  sube:{ p:'M3 17l6-6 4 4 8-8M15 7h6v6' },
  baja:{ p:'M3 7l6 6 4-4 8 8M15 17h6v-6' },
  check:{ p:'M4.5 12.5l5 5 10-11' },
  x:{ p:'M5.5 5.5l13 13M18.5 5.5l-13 13' },
  alerta:{ p:'M12 3.5L2.5 20h19zM12 10v4.5', d:[[12,17.2,0.9]] },
  info:{ p:'M12 11v5.5', c:[[12,12,9]], d:[[12,7.8,0.9]] },
  arriba:{ p:'M12 20V4.5M5.5 11L12 4.5 18.5 11' },
  abajo:{ p:'M12 4v15.5M5.5 13L12 19.5 18.5 13' },
  corazon:{ p:'M12 20.5s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 2.7c0 5.6-7.5 10.2-7.5 10.2z' },
  cerebro:{ p:'M12 6v13M9 4.5a3 3 0 0 0-3 3 3.2 3.2 0 0 0-1.5 5.5A3.2 3.2 0 0 0 7 18.5a2.6 2.6 0 0 0 5 .5V6a2 2 0 0 0-3-1.5zM15 4.5a3 3 0 0 1 3 3 3.2 3.2 0 0 1 1.5 5.5A3.2 3.2 0 0 1 17 18.5a2.6 2.6 0 0 1-5 .5V6a2 2 0 0 1 3-1.5z' },
  pesa:{ p:'M3 9.5v5M6.2 6.5v11M17.8 6.5v11M21 9.5v5M6.2 12h11.6' },
  comida:{ p:'M3.5 12.5h17a8.5 8.5 0 0 1-17 0zM9 5.2v3.3M12 4v4.5M15 5.2v3.3' },
  luna:{ p:'M20 14.6A8 8 0 0 1 9.4 4a8 8 0 1 0 10.6 10.6z' },
  dormir:{ p:'M5 7h6l-6 7h6M14 12h5l-5 6h5' },
  sol:{ p:'M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8', c:[[12,12,4]] },
  gota:{ p:'M12 3.5s6 6.3 6 10.5a6 6 0 0 1-12 0c0-4.2 6-10.5 6-10.5z' },
  fuego:{ p:'M12 3c1 3.5 5 5.5 5 10.5a5 5 0 0 1-10 0c0-2 1-3.2 2-4.2.3 1.5 1 2.2 2 2.7C10.5 9.5 11 6 12 3z' },
  termometro:{ p:'M12 3a2 2 0 0 0-2 2v9.3a4 4 0 1 0 4 0V5a2 2 0 0 0-2-2z' },
  pastilla:{ p:'M5.2 13.2l8-8a4 4 0 0 1 5.6 5.6l-8 8a4 4 0 0 1-5.6-5.6zM9.2 9.2l5.6 5.6' },
  adn:{ p:'M7 3c0 6 10 6 10 12s-10 3-10 6M17 3c0 6-10 6-10 12s10 3 10 6M8.5 6.5h7M8.5 17.5h7' },
  planta:{ p:'M12 21v-8M12 13c0-4 3-6.5 7.5-6.5 0 4.5-3 6.5-7.5 6.5zM12 15c0-3-2.2-5-6-5 0 3.5 2.3 5 6 5z' },
  usuario:{ p:'M4.5 20.5a7.5 7.5 0 0 1 15 0', c:[[12,8,3.6]] },
  usuarios:{ p:'M2.5 20a6.5 6.5 0 0 1 13 0M16 5.6a3.2 3.2 0 0 1 0 5.8M18 14.3a6.5 6.5 0 0 1 3.5 5.7', c:[[9,8.5,3.2]] },
  casa:{ p:'M3.5 11.5L12 4l8.5 7.5M6 9.8V20h12V9.8M10 20v-5.5h4V20' },
  engranaje:{ p:'M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1', c:[[12,12,6.5],[12,12,2.6]] },
  mensaje:{ p:'M4 5h16v11H9.5L5 20v-4H4z' },
  correo:{ p:'M3 6h18v12H3zM3 7l9 6.5L21 7' },
  libro:{ p:'M4 5.5C6.5 4.5 9.5 4.5 12 6c2.5-1.5 5.5-1.5 8-.5V19c-2.5-1-5.5-1-8 .5-2.5-1.5-5.5-1.5-8-.5zM12 6v13.5' },
  estrella:{ p:'M12 3l2.7 5.6 6.1.8-4.5 4.3 1.1 6.1L12 16.9 6.6 19.8l1.1-6.1L3.2 9.4l6.1-.8z' },
  basura:{ p:'M5 7h14M9 7V4.5h6V7M7 7l1 13h8l1-13' }
};
var cache={};
/* dibuja un icono centrado en (cx,cy) con lado "lado" px; slash 0..1 dibuja la barra de tachado */
E.dibujarIcono = function(ctx, nombre, cx, cy, lado, color, slash, colorSlash){
  var ic=E.ICONOS[nombre] || E.ICONOS.info, k=lado/24, i;
  var path=cache[nombre] || (cache[nombre]=new Path2D(ic.p));
  ctx.save(); ctx.translate(cx-lado/2, cy-lado/2); ctx.scale(k,k);
  ctx.lineWidth=1.7; ctx.lineCap='round'; ctx.lineJoin='round'; ctx.strokeStyle=color; ctx.fillStyle=color;
  ctx.stroke(path);
  if(ic.c) for(i=0;i<ic.c.length;i++){ ctx.beginPath(); ctx.arc(ic.c[i][0],ic.c[i][1],ic.c[i][2],0,Math.PI*2); ctx.stroke(); }
  if(ic.d) for(i=0;i<ic.d.length;i++){ ctx.beginPath(); ctx.arc(ic.d[i][0],ic.d[i][1],ic.d[i][2],0,Math.PI*2); ctx.fill(); }
  if(slash>0){ ctx.strokeStyle=colorSlash||color; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(4,20); ctx.lineTo(4+16*slash,20-16*slash); ctx.stroke(); }
  ctx.restore();
};
})();
