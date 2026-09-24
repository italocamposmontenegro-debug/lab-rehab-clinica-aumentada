// Content is present before JS and never waits for animation.
const reduceMotion=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
function feedback(el:Element){if(!reduceMotion())el.animate([{opacity:.65},{opacity:1}],{duration:160,easing:'ease-out'});}
function arrowNavigation(buttons:HTMLButtonElement[]){buttons.forEach((button,i)=>button.addEventListener('keydown',event=>{let next=i;if(event.key==='ArrowRight'||event.key==='ArrowDown')next=(i+1)%buttons.length;else if(event.key==='ArrowLeft'||event.key==='ArrowUp')next=(i-1+buttons.length)%buttons.length;else if(event.key==='Home')next=0;else if(event.key==='End')next=buttons.length-1;else return;event.preventDefault();buttons[next].focus();buttons[next].click();}));}
const explorer=document.querySelector<HTMLElement>('[data-ra-explorer]');
if(explorer){
 const buttons=[...explorer.querySelectorAll<HTMLButtonElement>('[data-variant-choice]')];
 const img=explorer.querySelector<HTMLImageElement>('[data-variant-image]')!;let request=0;
 buttons.forEach(b=>b.disabled=false);
 buttons.forEach(button=>button.addEventListener('click',async()=>{
  const token=++request,id=button.dataset.variantChoice!;const next=new Image();next.sizes=img.sizes;next.srcset=`/ra01/demos/hero-${id}-sm.webp 640w, /ra01/demos/hero-${id}.webp 1088w`;next.src=`/ra01/demos/hero-${id}.webp`;explorer.setAttribute('aria-busy','true');
  try{await next.decode();if(token!==request)return;img.srcset=next.srcset;img.src=next.src;img.alt=`Detalle real de ${button.dataset.title}: las dos primeras filas del tablero de un caso ficticio.`;
   buttons.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
   explorer.querySelector('[data-variant-title]')!.textContent=button.dataset.title!;
   explorer.querySelector('[data-variant-description]')!.textContent=button.dataset.description!;
   const link=explorer.querySelector<HTMLAnchorElement>('[data-variant-link]')!;link.href=button.dataset.link!;link.textContent=button.dataset.cta+' →';feedback(img);
  }catch{if(token===request)explorer.querySelector('[data-variant-description]')!.textContent='No se pudo cargar esta vista. Puedes abrir las demostraciones en la sección siguiente.';}
  finally{if(token===request)explorer.removeAttribute('aria-busy');}
 }));arrowNavigation(buttons);
}
const method=document.querySelector<HTMLElement>('[data-ra-method]');
if(method){const buttons=[...method.querySelectorAll<HTMLButtonElement>('[data-method-step]')];const details=document.querySelector<HTMLElement>('[data-method-detail]')!;method.classList.add('is-enhanced');details.hidden=false;
 buttons.forEach(button=>button.addEventListener('click',()=>{buttons.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));details.querySelectorAll<HTMLElement>('[data-step-detail]').forEach(p=>p.hidden=p.dataset.stepDetail!==button.dataset.methodStep);feedback(details);}));arrowNavigation(buttons);
}
const kit=document.querySelector<HTMLElement>('[data-ra-toolkit]');
if(kit){const buttons=[...kit.querySelectorAll<HTMLButtonElement>('[data-kit-piece]')];const panels=[...kit.querySelectorAll<HTMLElement>('[data-kit-panel]')];const select=(button:HTMLButtonElement)=>{buttons.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));panels.forEach(p=>{p.hidden=p.dataset.kitPanel!==button.dataset.kitPiece;if(!p.hidden)feedback(p);});};buttons.forEach(b=>b.addEventListener('click',()=>select(b)));select(buttons[0]);arrowNavigation(buttons);}
export {};
