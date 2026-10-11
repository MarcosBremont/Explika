/* Explika · exportar a MP4 (1080x1920) cuadro a cuadro con WebCodecs + mp4-muxer.
   No graba la pantalla: pinta cada cuadro exacto y lo codifica, así el video sale fluido aunque el equipo sea lento. */
(function(){
'use strict';
var E=window.E3D, W=1080, H=1920;

E.puedeExportar=function(){ return typeof window.VideoEncoder==='function' && typeof window.VideoFrame==='function' && !!window.Mp4Muxer; };

function elegirCodec(fps,bitrate){
  var lista=[ {codec:'avc1.640028',mux:'avc'}, {codec:'avc1.4d0028',mux:'avc'}, {codec:'avc1.42e028',mux:'avc'}, {codec:'avc1.64002a',mux:'avc'}, {codec:'avc1.640033',mux:'avc'},
              {codec:'vp09.00.40.08',mux:'vp9'}, {codec:'av01.0.08M.08',mux:'av1'} ];
  if(fps>30) lista.unshift({codec:'avc1.64002a',mux:'avc'});
  var i=0;
  function sig(){
    if(i>=lista.length) return Promise.resolve(null);
    var c=lista[i++], cfg={ codec:c.codec, width:W, height:H, bitrate:bitrate, framerate:fps };
    if(c.mux==='avc') cfg.avc={ format:'avc' };
    return VideoEncoder.isConfigSupported(cfg).then(function(s){ return s && s.supported ? { cfg:cfg, mux:c.mux } : sig(); }, sig);
  }
  return sig();
}
function espera(ms){ return new Promise(function(r){ setTimeout(r,ms); }); }

/* opts: { fps, desde, hasta }. progreso(0..1). senal = { cancelar:false }. Devuelve { blob, codec, cuadros }. */
E.exportar=function(motor, opts, progreso, senal){
  opts=opts||{}; senal=senal||{};
  var fps=opts.fps===60?60:30, bitrate=fps===60?16e6:12e6;
  if(!E.puedeExportar()) return Promise.reject(new Error('Este navegador no puede codificar video. Usa Chrome o Edge actualizados.'));
  return elegirCodec(fps,bitrate).then(function(sel){
    if(!sel) throw new Error('Este dispositivo no ofrece un codificador de video compatible.');
    var muxer=new Mp4Muxer.Muxer({ target:new Mp4Muxer.ArrayBufferTarget(), video:{ codec:sel.mux, width:W, height:H, frameRate:fps }, fastStart:'in-memory' });
    var fallo=null, enc=new VideoEncoder({ output:function(chunk,meta){ muxer.addVideoChunk(chunk,meta); }, error:function(e){ fallo=e; } });
    enc.configure(sel.cfg);
    var kPrev=motor.k, t0=Math.max(0,opts.desde||0), t1=Math.min(motor.dur, opts.hasta||motor.dur), n=Math.max(1,Math.ceil((t1-t0)*fps)), i=0, us=1e6/fps;
    motor.calidad(1); motor.reiniciar();
    function limpiar(){ try{ if(enc.state!=='closed') enc.close(); }catch(e){} motor.calidad(kPrev); motor.reiniciar(); }
    function paso(){
      if(fallo) throw fallo;
      if(senal.cancelar){ var c=new Error('Exportación cancelada.'); c.cancelada=true; throw c; }
      var tope=Math.min(n,i+2);
      for(;i<tope;i++){
        motor.pintar(t0+i/fps);
        var vf=new VideoFrame(motor.out,{ timestamp:Math.round(i*us), duration:Math.round(us) });
        enc.encode(vf,{ keyFrame:i%(fps*2)===0 }); vf.close();
      }
      if(progreso) progreso(i/n);
      if(i>=n) return null;
      return espera(enc.encodeQueueSize>6 ? 12 : 0).then(paso);
    }
    return Promise.resolve().then(paso).then(function(){ return enc.flush(); }).then(function(){
      if(fallo) throw fallo;
      muxer.finalize();
      var blob=new Blob([muxer.target.buffer],{ type:'video/mp4' });
      limpiar();
      return { blob:blob, codec:sel.cfg.codec, cuadros:n };
    }, function(e){ limpiar(); throw e; });
  });
};
})();
