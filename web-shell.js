(function(root,factory) {
  const api=factory();
  if(typeof module==="object" && module.exports) module.exports=api;
  else root.ThrownTogetherWeb=api;
})(typeof window!=="undefined" ? window : globalThis,function() {
  "use strict";
  function fit(width,height,toolbarHeight) {
    // Unity matches its render target to this viewport; the camera refits instead
    // of stretching a fixed-aspect image or reserving a permanent footer.
    return {width:Math.max(1,width),height:Math.max(1,height)};
  }
  function hasFocus(doc,canvas) { return doc.hasFocus() && !doc.hidden && doc.activeElement===canvas; }
  function loadFailure(error,kind) {
    const message=String(error??"");
    if(kind==="network" || /failed to fetch|networkerror|could not download|404|503|net::err_/i.test(message))
      return "The build could not download. Check your connection, then reload to retry. Your saved Careers are kept.";
    if(/webgl (?:is )?not supported|webassembly (?:is )?not supported|no compatible webgl|unsupported browser/i.test(message))
      return "This browser reported an unsupported graphics or WebAssembly feature. Try an updated supported browser. Your saved Careers are kept.";
    return "The game could not initialize. The cause is unknown; reload to retry. If it repeats, keep this error for support. Your saved Careers are kept.";
  }
  function attach(win,doc) {
    const canvas=doc.getElementById("unity-canvas"), frame=doc.getElementById("game-frame");
    const hint=doc.getElementById("focus-hint"), tools=doc.getElementById("web-tools");
    let ready=false,failed=false;
    function resize() {
      const size=fit(win.innerWidth,win.innerHeight,tools.offsetHeight);
      frame.style.width=size.width+"px"; frame.style.height=size.height+"px";
    }
    function updateFocus() {
      if(failed){tools.style.display="none";hint.textContent="";return;}
      hint.textContent=hasFocus(doc,canvas) ? "Game focused · F3 / DEV" : "Click game to focus";
      tools.style.display=hasFocus(doc,canvas)?"none":"flex";
    }
    // Only a normal primary click focuses the canvas. Never capture Menu/right-click,
    // poll controller buttons, lock the pointer, or request fullscreen here.
    canvas.addEventListener("pointerdown",event=>{
      if(event.button===0 && ready && !failed && doc.hasFocus() && !doc.hidden) canvas.focus({preventScroll:true});
    });
    doc.addEventListener("focusin",updateFocus); doc.addEventListener("focusout",updateFocus);
    win.addEventListener("focus",updateFocus); win.addEventListener("blur",updateFocus);
    doc.addEventListener("visibilitychange",updateFocus);
    win.addEventListener("resize",resize);
    resize(); updateFocus();
    return {ready:()=>{if(!failed)ready=true;updateFocus();resize();},fail:()=>{failed=true;ready=false;updateFocus();}};
  }
  return {fit,hasFocus,attach,loadFailure};
});
