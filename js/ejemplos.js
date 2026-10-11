/* Explika · guiones de ejemplo (mismo formato que devuelve la IA) */
(function(){
'use strict';
var E=window.E3D;

var WIFI={
  "titulo":"Cómo funciona el Wi-Fi",
  "escenas":[
    { "entorno":"habitacion", "estado":{"texto":"SIN SEÑAL","color":"gris"},
      "objetos":[
        {"id":"mesa","tipo":"mesa","pos":[-1.2,0,-0.6]},
        {"id":"router","tipo":"router","sobre":"mesa","escala":2.4,"heroe":true},
        {"id":"ana","tipo":"persona","pos":[1.5,0,0.7],"rot":-35,"anim":"telefono"},
        {"id":"tel","tipo":"telefono","en_mano":"ana","escala":1.5}
      ],
      "camara":{"plano":"detalle","objetivo":"router"},
      "lineas":[
        {"texto":"Tu Wi-Fi no viaja"},
        {"texto":"por ningún cable.","efectos":[{"tipo":"icono","icono":"wifi"}]},
        {"texto":"Entonces, ¿cómo llega","camara":{"plano":"general","objetivo":"escena"}},
        {"texto":"el video a tu teléfono?"},
        {"texto":"El router convierte","camara":{"plano":"primer_plano","objetivo":"router"},"efectos":[{"tipo":"estado","texto":"EMITIENDO","color":"azul"}]},
        {"texto":"los datos en ondas","efectos":[{"tipo":"anillos","en":"router","color":"azul"},{"tipo":"etiqueta","en":"router","titulo":"Router","sub":"EMISOR DE RADIO","color":"azul"}]},
        {"texto":"de radio"},
        {"texto":"y las lanza","camara":{"plano":"general","objetivo":"escena"},"efectos":[{"tipo":"domo","en":"router","radio":4.6,"color":"azul"}]},
        {"texto":"en todas direcciones."},
        {"texto":"Tu teléfono las capta","camara":{"plano":"medio","objetivo":"ana","angulo":"frente"},"efectos":[{"tipo":"linea","de":"router","a":"tel","color":"verde"},{"tipo":"estado","texto":"CONECTADO","color":"verde"}]},
        {"texto":"y las convierte"},
        {"texto":"otra vez en datos.","efectos":[{"tipo":"etiqueta","en":"tel","titulo":"Antena del teléfono","sub":"RECEPTOR","color":"verde"}]}
      ] },
    { "entorno":"calle", "estado":{"texto":"ALCANCE LIMITADO","color":"ambar"},
      "objetos":[
        {"id":"casa","tipo":"casa","pos":[-3,0,-1.5],"heroe":true},
        {"id":"leo","tipo":"persona","pos":[0.6,0,2.2],"rot":90},
        {"id":"tel2","tipo":"telefono","en_mano":"leo","escala":1.5}
      ],
      "camara":{"plano":"general","objetivo":"escena"},
      "lineas":[
        {"texto":"Pero esas ondas","efectos":[{"tipo":"domo","en":"casa","radio":6.5,"color":"azul"}]},
        {"texto":"se debilitan"},
        {"texto":"con la distancia","efectos":[{"tipo":"icono","icono":"senal","color":"ambar"}]},
        {"texto":"y con cada pared."},
        {"texto":"Si te alejas demasiado,","camara":{"plano":"medio","objetivo":"leo"},"efectos":[{"tipo":"mover","obj":"leo","a":[10,0,2.2],"segundos":4.5}]},
        {"texto":"la señal no alcanza.","efectos":[{"tipo":"estado","texto":"SIN SEÑAL","color":"rojo"},{"tipo":"icono","icono":"wifi","tachado":true}]}
      ] },
    { "entorno":"ciudad", "estado":{"texto":"BUSCANDO ORIGEN","color":"gris"},
      "objetos":[
        {"id":"hogar","tipo":"casa","pos":[-3.4,0,1.2],"heroe":true},
        {"id":"centro","tipo":"edificio","pos":[3.6,0,-1.6],"pisos":5},
        {"id":"nube","tipo":"nube","pos":[3.6,16,-1.6],"anim":"flotar"}
      ],
      "camara":{"plano":"general","objetivo":"escena"},
      "lineas":[
        {"texto":"Y el router,"},
        {"texto":"¿de dónde saca los datos?"},
        {"texto":"De un cable","efectos":[{"tipo":"linea","de":"hogar","a":"centro","color":"ambar"},{"tipo":"etiqueta","en":"centro","titulo":"Proveedor","sub":"CENTRO DE DATOS","color":"ambar"}]},
        {"texto":"que lo une a internet.","efectos":[{"tipo":"haz","en":"centro","color":"verde"},{"tipo":"estado","texto":"EN LÍNEA","color":"verde"}]},
        {"texto":"Así que el Wi-Fi","camara":{"plano":"aereo","objetivo":"escena"}},
        {"texto":"no es internet.","efectos":[{"tipo":"icono","icono":"internet","tachado":true}]},
        {"texto":"Es solo el último tramo,","camara":{"plano":"medio","objetivo":"hogar"},"efectos":[{"tipo":"anillos","en":"hogar","color":"azul"}]},
        {"texto":"hecho de radio.","efectos":[{"tipo":"icono","icono":"wifi","color":"azul"}]}
      ] }
  ]
};

var MUSCULO={
  "titulo":"Cómo crece el músculo",
  "escenas":[
    { "entorno":"gimnasio", "estado":{"texto":"EN REPOSO","color":"gris"},
      "objetos":[
        {"id":"p","tipo":"persona","pos":[0,0,0],"parte_heroe":"biceps"},
        {"id":"pesa","tipo":"mancuerna","en_mano":"p","heroe":true}
      ],
      "camara":{"plano":"detalle","objetivo":"pesa"},
      "lineas":[
        {"texto":"Tus músculos no crecen","camara":{"plano":"medio","objetivo":"p","segundos":4}},
        {"texto":"en el gimnasio.","efectos":[{"tipo":"icono","icono":"pesa","tachado":true}]},
        {"texto":"Crecen después,","efectos":[{"tipo":"icono","icono":"luna","color":"verde"}]},
        {"texto":"mientras descansas."},
        {"texto":"Entonces, ¿qué hace"},
        {"texto":"realmente una pesa?","camara":{"plano":"primer_plano","objetivo":"pesa"}},
        {"texto":"Imagina que levantas","camara":{"plano":"medio","objetivo":"p"},"efectos":[{"tipo":"estado","texto":"BAJO TENSIÓN","color":"azul"},{"tipo":"animar","obj":"p","anim":"curl"}]},
        {"texto":"una carga pesada,","efectos":[{"tipo":"anillos","en":"p.biceps","color":"azul","tam":3},{"tipo":"etiqueta","en":"p.biceps","titulo":"Bíceps","sub":"NO A ESCALA","color":"azul"}]},
        {"texto":"casi hasta tu límite.","camara":{"plano":"primer_plano","objetivo":"p.biceps","segundos":2.2}}
      ] },
    { "entorno":"micro", "estado":{"texto":"BAJO TENSIÓN","color":"azul"},
      "objetos":[
        {"id":"f","tipo":"fibra","pos":[0,0,0],"largo":7,"radio":0.5,"heroe":true},
        {"id":"f2","tipo":"fibra","pos":[0,1.08,-0.3],"largo":7,"radio":0.5},
        {"id":"f3","tipo":"fibra","pos":[0,-1.08,-0.3],"largo":7,"radio":0.5},
        {"id":"f4","tipo":"fibra","pos":[0,0.54,-1.1],"largo":7,"radio":0.5},
        {"id":"f5","tipo":"fibra","pos":[0,-0.54,-1.1],"largo":7,"radio":0.5},
        {"id":"f6","tipo":"fibra","pos":[0,1.62,-1.3],"largo":7,"radio":0.5},
        {"id":"nucleo","tipo":"esfera","pos":[0,0.6,0.3],"tam":[0.55]},
        {"id":"s1","tipo":"esfera","pos":[-0.8,0.4,0.48],"tam":[0.2],"color":"azul","oculto":true},
        {"id":"s2","tipo":"esfera","pos":[0.8,0.4,0.48],"tam":[0.2],"color":"azul","oculto":true},
        {"id":"s3","tipo":"esfera","pos":[0,0.08,0.42],"tam":[0.2],"color":"azul","oculto":true},
        {"id":"comida","tipo":"plato","pos":[2.6,3.4,1.2],"escala":3,"oculto":true}
      ],
      "camara":{"plano":"primer_plano","objetivo":"f","angulo":"lateral"},
      "lineas":[
        {"texto":"Dentro del músculo,"},
        {"texto":"miles de fibras","efectos":[{"tipo":"etiqueta","en":"f2","titulo":"Fibras musculares","sub":"TENSIÓN MECÁNICA","color":"azul"}]},
        {"texto":"se ponen bajo tensión.","efectos":[{"tipo":"anillos","en":"f","color":"azul","tam":0.5}]},
        {"texto":"Esa tensión","camara":{"plano":"general","objetivo":"nucleo","angulo":"derecha"}},
        {"texto":"es la señal.","efectos":[{"tipo":"estado","texto":"SEÑAL ACTIVADA","color":"ambar"}]},
        {"texto":"Sensores en cada fibra","efectos":[{"tipo":"aparecer","obj":"s1"},{"tipo":"aparecer","obj":"s2","retraso":0.2},{"tipo":"aparecer","obj":"s3","retraso":0.4},{"tipo":"etiqueta","en":"s2","titulo":"Sensores de tensión","sub":"EN LA MEMBRANA","color":"azul"}]},
        {"texto":"la detectan","efectos":[{"tipo":"linea","de":"s1","a":"nucleo","color":"azul"},{"tipo":"linea","de":"s2","a":"nucleo","color":"azul"},{"tipo":"linea","de":"s3","a":"nucleo","color":"azul"}]},
        {"texto":"y envían una orden"},
        {"texto":"al núcleo:","efectos":[{"tipo":"color","obj":"nucleo","color":"ambar"},{"tipo":"etiqueta","en":"nucleo","titulo":"Núcleo","sub":"ORDEN: CONSTRUIR","color":"ambar"}]},
        {"texto":"construir.","efectos":[{"tipo":"resaltar","obj":"nucleo"}]},
        {"texto":"Pero para construir","camara":{"plano":"primer_plano","objetivo":"f","angulo":"derecha"},"efectos":[{"tipo":"estado","texto":"CONSTRUYENDO","color":"verde"}]},
        {"texto":"hacen falta ladrillos:","efectos":[{"tipo":"aparecer","obj":"comida"}]},
        {"texto":"los aminoácidos","efectos":[{"tipo":"particulas","de":"comida","a":"nucleo","color":"verde"},{"tipo":"etiqueta","en":"comida","titulo":"Aminoácidos","sub":"DE LA PROTEÍNA","color":"verde"}]},
        {"texto":"de la proteína que comes."},
        {"texto":"La fibra los ensambla"},
        {"texto":"en filamentos nuevos","efectos":[{"tipo":"escala","obj":"f","factor":1.3,"segundos":3}]},
        {"texto":"y se vuelve más gruesa.","efectos":[{"tipo":"etiqueta","en":"f","titulo":"Fibra más gruesa","sub":"HIPERTROFIA","color":"verde"}]}
      ] },
    { "entorno":"habitacion", "estado":{"texto":"RECUPERANDO","color":"verde"},
      "objetos":[
        {"id":"cama","tipo":"cama","pos":[0,0,-0.6]},
        {"id":"d","tipo":"persona","sobre":"cama","anim":"acostado","parte_heroe":"biceps"}
      ],
      "camara":{"plano":"medio","objetivo":"d","altura":32},
      "lineas":[
        {"texto":"Y eso no pasa"},
        {"texto":"mientras entrenas."},
        {"texto":"Pasa en las siguientes","efectos":[{"tipo":"anillos","en":"d.biceps","color":"verde","tam":3}]},
        {"texto":"24 a 48 horas,","efectos":[{"tipo":"dato","texto":"24–48 h","sub":"SÍNTESIS DE PROTEÍNA","color":"verde"}]},
        {"texto":"sobre todo","camara":{"plano":"general","objetivo":"escena","altura":30}},
        {"texto":"mientras duermes.","efectos":[{"tipo":"icono","icono":"luna","color":"verde"}]}
      ] },
    { "entorno":"gimnasio", "estado":{"texto":"ADAPTADO","color":"gris"},
      "objetos":[
        {"id":"p","tipo":"persona","pos":[0,0,0],"parte_heroe":"biceps","anim":"curl"},
        {"id":"pesa","tipo":"mancuerna","en_mano":"p","heroe":true}
      ],
      "camara":{"plano":"medio","objetivo":"p"},
      "lineas":[
        {"texto":"La próxima vez,"},
        {"texto":"el mismo peso","efectos":[{"tipo":"etiqueta","en":"pesa","titulo":"Mismo peso","sub":"SIN ESTÍMULO","color":"gris"}]},
        {"texto":"ya no es un reto."},
        {"texto":"Sin reto, no hay señal.","efectos":[{"tipo":"icono","icono":"senal","tachado":true,"dura":1}]},
        {"texto":"Por eso hay que subir","camara":{"plano":"primer_plano","objetivo":"p"},"efectos":[{"tipo":"estado","texto":"SOBRECARGA","color":"ambar"},{"tipo":"escala","obj":"pesa","factor":1.5,"segundos":0.6}]},
        {"texto":"la carga poco a poco.","efectos":[{"tipo":"etiqueta","en":"pesa","titulo":"Sobrecarga progresiva","sub":"+ CARGA","color":"ambar"},{"tipo":"anillos","en":"p.biceps","color":"azul","tam":3}]},
        {"texto":"Así que el músculo","camara":{"plano":"medio","objetivo":"p"},"efectos":[{"tipo":"estado","texto":"EN RESUMEN","color":"gris"}]},
        {"texto":"no se construye"},
        {"texto":"levantando pesas."},
        {"texto":"Levantar es la señal.","efectos":[{"tipo":"icono","icono":"pesa","color":"azul"}]},
        {"texto":"Comer y dormir","efectos":[{"tipo":"icono","icono":"comida","color":"verde"},{"tipo":"icono","icono":"luna","color":"verde","retraso":0.5}]},
        {"texto":"es la construcción."}
      ] }
  ]
};

var GPS={
  "titulo":"Cómo funciona el GPS",
  "escenas":[
    { "entorno":"calle", "estado":{"texto":"SIN UBICACIÓN","color":"gris"},
      "objetos":[
        {"id":"eva","tipo":"persona","pos":[0,0,1.5],"anim":"telefono"},
        {"id":"tel","tipo":"telefono","en_mano":"eva","escala":1.6,"heroe":true}
      ],
      "camara":{"plano":"primer_plano","objetivo":"tel","angulo":"derecha"},
      "lineas":[
        {"texto":"Tu teléfono sabe"},
        {"texto":"dónde estás","efectos":[{"tipo":"icono","icono":"gps"}]},
        {"texto":"sin enviar nada","camara":{"plano":"medio","objetivo":"eva"}},
        {"texto":"al espacio.","efectos":[{"tipo":"icono","icono":"arriba","tachado":true}]},
        {"texto":"Entonces, ¿cómo lo hace?","camara":{"plano":"general","objetivo":"eva"}}
      ] },
    { "entorno":"espacio", "estado":{"texto":"EMITIENDO","color":"azul"},
      "objetos":[
        {"id":"tierra","tipo":"planeta","pos":[0,0,0],"anim":"girar"},
        {"id":"s1","tipo":"satelite","pos":[-5.5,8,2],"rot":25,"escala":0.7,"heroe":true,"anim":"flotar"},
        {"id":"s2","tipo":"satelite","pos":[5.5,9.5,-1],"rot":-30,"escala":0.7,"anim":"flotar"},
        {"id":"s3","tipo":"satelite","pos":[0.5,11.5,3],"rot":70,"escala":0.7,"anim":"flotar"},
        {"id":"s4","tipo":"satelite","pos":[7.5,4,4],"rot":10,"escala":0.7,"anim":"flotar"}
      ],
      "camara":{"plano":"general","objetivo":"escena"},
      "lineas":[
        {"texto":"Arriba hay"},
        {"texto":"unos treinta satélites","efectos":[{"tipo":"etiqueta","en":"s1","titulo":"Satélite GPS","sub":"A 20 200 KM","color":"azul"}]},
        {"texto":"que repiten sin parar","efectos":[{"tipo":"anillos","en":"s1","color":"azul","tam":1.6},{"tipo":"anillos","en":"s2","color":"azul","tam":1.6},{"tipo":"anillos","en":"s3","color":"azul","tam":1.6},{"tipo":"anillos","en":"s4","color":"azul","tam":1.6}]},
        {"texto":"una sola cosa:","camara":{"plano":"primer_plano","objetivo":"s1","segundos":2.2}},
        {"texto":"su posición"},
        {"texto":"y la hora exacta.","efectos":[{"tipo":"dato","texto":"12:00:00.000","sub":"HORA DEL SATÉLITE","color":"ambar"}]}
      ] },
    { "entorno":"calle", "estado":{"texto":"ESCUCHANDO","color":"azul"},
      "objetos":[
        {"id":"eva","tipo":"persona","pos":[0,0,1.5],"anim":"telefono"},
        {"id":"tel","tipo":"telefono","en_mano":"eva","escala":1.6,"heroe":true},
        {"id":"a","tipo":"satelite","pos":[-5,9,-3],"escala":0.35,"anim":"flotar"},
        {"id":"b","tipo":"satelite","pos":[4.5,10,-2],"escala":0.35,"anim":"flotar"},
        {"id":"c","tipo":"satelite","pos":[-1,11.5,1],"escala":0.35,"anim":"flotar"},
        {"id":"d","tipo":"satelite","pos":[2,8.5,3.5],"escala":0.35,"anim":"flotar"}
      ],
      "camara":{"plano":"medio","objetivo":"eva"},
      "lineas":[
        {"texto":"Tu teléfono solo escucha.","efectos":[{"tipo":"linea","de":"a","a":"tel","color":"azul"}]},
        {"texto":"Mide cuánto tardó"},
        {"texto":"en llegar cada señal","efectos":[{"tipo":"dato","texto":"0.067 s","sub":"TIEMPO DE VIAJE","color":"azul"}]},
        {"texto":"y lo convierte"},
        {"texto":"en distancia.","efectos":[{"tipo":"estado","texto":"MIDIENDO","color":"ambar"}]},
        {"texto":"Con un satélite","camara":{"plano":"general","objetivo":"escena"}},
        {"texto":"no basta."},
        {"texto":"Con cuatro,","efectos":[{"tipo":"linea","de":"b","a":"tel","color":"verde"},{"tipo":"linea","de":"c","a":"tel","color":"verde","retraso":0.25},{"tipo":"linea","de":"d","a":"tel","color":"verde","retraso":0.5}]},
        {"texto":"las distancias se cruzan"},
        {"texto":"en un solo punto:","efectos":[{"tipo":"pin","en":"eva","color":"verde"},{"tipo":"estado","texto":"UBICADO","color":"verde"}]},
        {"texto":"tú.","camara":{"plano":"medio","objetivo":"eva"}},
        {"texto":"Así que el GPS"},
        {"texto":"no te busca."},
        {"texto":"Tú lo escuchas","efectos":[{"tipo":"icono","icono":"gps","color":"verde"}]},
        {"texto":"y haces la cuenta."}
      ] }
  ]
};

E.EJEMPLOS=[ { id:'wifi', nombre:'Cómo funciona el Wi-Fi', guion:WIFI }, { id:'gps', nombre:'Cómo funciona el GPS', guion:GPS }, { id:'musculo', nombre:'Cómo crece el músculo', guion:MUSCULO } ];
/* versión recortada para incluir en el prompt */
E.EJEMPLO_PROMPT={ titulo:WIFI.titulo, escenas:[ WIFI.escenas[0], WIFI.escenas[1] ] };
})();
