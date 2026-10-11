# Explika

PWA para crear videos explicativos 3D verticales (9:16) de estilo low-poly nocturno: un objeto protagonista en crema, personas como maniquíes grises y los conceptos invisibles dibujados con domos, anillos, líneas, etiquetas e iconos.

Tú pones el tema; una IA escribe el guion en JSON; la app lo convierte en video y lo exporta en MP4 de 1080 × 1920.

## Cómo se usa

1. **Tema.** Escribe el tema y las especificaciones. Si no tienes tema, elige una categoría y pulsa "Generar idea"; "Usar este tema" lo coloca en el campo. Pulsa "Copiar prompt".
2. Pega el prompt en Claude, Gemini o ChatGPT y copia el JSON que devuelva.
3. **Guion.** Pega el JSON y pulsa "Cargar guion". Si algo no se entiende, la app lo avisa y sigue con lo que sí entendió.
4. **Ajustes.** Ritmo de la narración, colores y tu usuario como marca de agua (a un lado, cambiando de sitio, al centro o solo al final).
5. **Exportar.** Genera el MP4 (sin voz) y copia la narración con sus tiempos para grabar la voz.

Si un video no quedó como querías, lo más rápido es pedirle el cambio a la misma IA ("acerca más la cámara en la escena 2", "cambia el entorno a oficina") y volver a pegar el JSON.

## Publicar en GitHub Pages

1. Crea un repositorio y sube el contenido de esta carpeta tal cual (con `index.html` en la raíz).
2. En el repositorio: Settings > Pages > Source: "Deploy from a branch", rama `main`, carpeta `/ (root)`.
3. Abre la dirección que te da GitHub. Desde Chrome o Edge puedes instalarla como app.

Todas las rutas son relativas, así que funciona igual en `usuario.github.io/explika/` que en un dominio propio. No necesita servidor ni claves.

Cada vez que publiques cambios, sube el número de `VERSION` en `sw.js` para que quien ya la tenga instalada reciba la versión nueva.

## Requisitos

- **HTTPS obligatorio.** Los navegadores solo permiten exportar video e instalar la app en páginas https. Si se abre por http, la app intenta pasar sola a https; si el sitio no lo tiene, la vista previa funciona pero el botón de exportar queda desactivado. GitHub Pages ya sirve por https (activa "Enforce HTTPS" en Settings > Pages); en otro hosting, activa el certificado SSL y la redirección a https.

- Vista previa: cualquier navegador moderno con WebGL.
- Exportar MP4: Chrome o Edge (escritorio o Android) y Safari reciente. Usa WebCodecs; no graba la pantalla, pinta y codifica cada cuadro, así que el video sale fluido aunque el equipo sea lento.
- El MP4 sale en H.264. Si el equipo no ofrece ese codificador, la app usa VP9 y lo avisa.

## Archivos

- `index.html`, `css/app.css`, `js/app.js`: interfaz (pasos, vista previa, ajustes, exportar, proyectos guardados).
- `js/motor.js`: motor (tiempos, cámara, efectos, subtítulos e interfaz del video dibujados en lienzo).
- `js/props.js`: biblioteca de objetos 3D.
- `js/entornos.js`: escenarios.
- `js/iconos.js`: iconos de trazo.
- `js/guion.js`: lectura y validación del JSON, y generador del prompt.
- `js/ejemplos.js`: guiones de ejemplo, que sirven de referencia del formato.
- `js/ideas.js`: banco de ideas de temas por categoría. Para ampliarlo, añade líneas a una lista o una categoría nueva; aparece sola en el campo.
- `js/exportar.js`: exportación a MP4.
- `sw.js`, `manifest.webmanifest`, `icons/`: instalación y uso sin conexión.
- `vendor/`, `fonts/`: three.js, mp4-muxer y las tipografías.

## Ampliar la biblioteca

El prompt se arma solo a partir de lo que hay en la biblioteca: al añadir un objeto, un entorno o un icono, la IA ya puede usarlo sin tocar nada más.

**Objeto nuevo** (`js/props.js`). Se construye con la base en y = 0, centrado y mirando a +z. `M.main` es el material del cuerpo (crema si es protagonista).

```js
P.dron={ desc:'Dron con cuatro hélices', tam:'0.6 m de ancho', build:function(o,M){
  var g=grp(); G.box(0.3,0.08,0.3,M.main,0,0.3,0,g);
  [-1,1].forEach(function(x){ [-1,1].forEach(function(z){ G.cyl(0.12,0.12,0.01,M.cla,x*0.25,0.36,z*0.25,g,10); }); });
  return g; } };
```

**Entorno nuevo** (`js/entornos.js`): una función que añade el decorado a un grupo y termina con `E.fusionar(g,true)`.

**Icono nuevo** (`js/iconos.js`): un trazo SVG en un lienzo de 24 × 24.

## Formato del guion

La referencia completa está en el propio prompt ("Ver prompt" en el paso 1) y en `js/ejemplos.js`. En resumen:

```json
{
  "titulo": "…",
  "escenas": [
    {
      "entorno": "calle",
      "estado": { "texto": "SIN SEÑAL", "color": "gris" },
      "objetos": [ { "id": "casa", "tipo": "casa", "pos": [-3, 0, -1.5], "heroe": true } ],
      "camara": { "plano": "general", "objetivo": "escena" },
      "lineas": [
        { "texto": "Pero esas ondas", "efectos": [ { "tipo": "domo", "en": "casa", "radio": 6.5, "color": "azul" } ] }
      ]
    }
  ]
}
```

## Límites conocidos

- El video sale sin audio. La narración se añade en el editor (CapCut, por ejemplo).
- La calidad del video depende del guion que escriba la IA y de las piezas que existan en la biblioteca. Un tema sin piezas adecuadas se verá más genérico hasta que se añadan.
- Los proyectos guardados viven en el navegador de ese dispositivo.

## Créditos

- three.js r128, licencia MIT.
- mp4-muxer 5.2.1 de Vanilagy, licencia MIT.
- Tipografías Inter y JetBrains Mono, licencia SIL Open Font 1.1.
