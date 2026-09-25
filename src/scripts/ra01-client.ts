type PaymentMethod = 'flow' | 'transfer';
type SafeEvent = { event: string; edition: 'RA01'; method?: string; variant?: string; status?: string };
declare global { interface Window { ra01Events?: SafeEvent[]; gtag?: (...args: unknown[]) => void; } }
const BASE='/formacion/ra01';
const allowedEvents=new Set(['ra01_landing_view','ra01_demo_view','ra01_registration_start','ra01_registration_submit','ra01_flow_click','ra01_transfer_select','ra01_transfer_copy','ra01_payment_help','ra01_waitlist','ra01_professional_profile_click','ra01_materials_open','ra01_technical_check_complete']);
const sources=new Set(['instagram','linkedin','whatsapp','recomendacion','red_academica','magister_uvm','otro']);
const media=new Set(['organic_social','paid_social','referral','email']);
const contents=new Set(['demo_01','demo_perfil','post_metodo','invitacion_profesional','enlace_recomendacion','convocatoria','continuidad','bio','otro']);
const safeStore={get(key:string){try{return sessionStorage.getItem(key)}catch{return null}},set(key:string,value:string){try{sessionStorage.setItem(key,value)}catch{/* The flow must work without browser storage. */}}};
const params=new URLSearchParams(location.search);
const touch:Record<string,string>={};
if(sources.has(params.get('utm_source')??''))touch.utm_source=params.get('utm_source')!;
if(media.has(params.get('utm_medium')??''))touch.utm_medium=params.get('utm_medium')!;
if(params.get('utm_campaign')==='ra01_2026_10')touch.utm_campaign='ra01_2026_10';
if(contents.has(params.get('utm_content')??''))touch.utm_content=params.get('utm_content')!;
if(Object.keys(touch).length)safeStore.set('ra01.touch',JSON.stringify(touch));
function track(event:string,detail:Partial<SafeEvent>={}){
 if(!allowedEvents.has(event))return;
 const payload:SafeEvent={event,edition:'RA01'};
 if(['flow','transfer'].includes(detail.method??''))payload.method=detail.method;
 if(['casa','rehabilitacion','comunidad','base'].includes(detail.variant??''))payload.variant=detail.variant;
 if(['preview','submitted','complete','unavailable','help'].includes(detail.status??''))payload.status=detail.status;
 window.ra01Events=[...(window.ra01Events??[]).slice(-99),payload];
 window.dispatchEvent(new CustomEvent('ra01:event',{detail:payload}));
 // No analytics provider is loaded by RA01. Existing configured analytics may receive only allowlisted fields, after consent.
 if(safeStore.get('ra01.measurement')==='allow' && document.body.dataset.ra01Analytics==='enabled')window.gtag?.('event',event,payload);
}
document.querySelectorAll<HTMLAnchorElement>('[data-ra-event]').forEach(a=>a.addEventListener('click',()=>track(a.dataset.raEvent!,{variant:a.dataset.variant,method:a.dataset.method})));
if(document.querySelector('[data-ra-landing]'))track('ra01_landing_view');
const demoView=document.querySelector<HTMLElement>('[data-demo-view]');if(demoView)track('ra01_demo_view',{variant:demoView.dataset.demoView});
const privacy=document.querySelector<HTMLDialogElement>('#ra-privacy-dialog');
document.querySelectorAll('[data-privacy-settings]').forEach(b=>b.addEventListener('click',()=>privacy?.showModal()));
privacy?.addEventListener('close',()=>{if(['accept','deny'].includes(privacy.returnValue))safeStore.set('ra01.measurement',privacy.returnValue==='accept'?'allow':'deny')});
const previewForm=document.querySelector<HTMLFormElement>('[data-preview-registration]');
if(previewForm){let busy=false;let started=false;
 previewForm.addEventListener('focusin',()=>{if(!started){track('ra01_registration_start');started=true}});
 previewForm.addEventListener('submit',event=>{event.preventDefault();if(busy)return;
 const name=previewForm.querySelector<HTMLInputElement>('[name="name"]')!;
 const email=previewForm.querySelector<HTMLInputElement>('[name="email"]')!;
 const terms=previewForm.querySelector<HTMLInputElement>('[name="terms"]')!;
 const method=previewForm.querySelector<HTMLSelectElement>('[name="payment_method"]')!;
 const errors:[HTMLInputElement,string][]=[[name,name.value.trim().length<2?'Escribe tu nombre y apellido.':''],[email,!email.value.trim()||!email.validity.valid?'Escribe un correo válido.':''],[terms,!terms.checked?'Debes leer y aceptar las condiciones para continuar.':'']];
 let first:HTMLInputElement|undefined;
 for(const [field,message] of errors){field.setAttribute('aria-invalid',String(Boolean(message)));document.getElementById(`${field.id}-error`)!.textContent=message;if(message&&!first)first=field;}
 if(first){first.focus();return;}busy=true;
 const existing=safeStore.get('ra01.preview.registration');let id='';try{id=JSON.parse(existing??'{}').id??''}catch{/* corrupted session */}
 if(!/^preview-[a-f0-9-]{36}$/.test(id))id=`preview-${crypto.randomUUID()}`;
 // Never persist name or email, even in a preview. No network request is made.
 safeStore.set('ra01.preview.registration',JSON.stringify({id,method:method.value==='transfer'?'transfer':'flow',termsVersion:previewForm.dataset.termsVersion,acceptedAt:new Date().toISOString()}));
 track('ra01_registration_submit',{method:method.value,status:'preview'});
 name.value='';email.value='';location.assign(`${BASE}/pago?preview=1`);
 });
 previewForm.querySelector<HTMLSelectElement>('[name="payment_method"]')?.addEventListener('change',e=>{if((e.target as HTMLSelectElement).value==='transfer')track('ra01_transfer_select',{method:'transfer'})});
}
const payment=document.querySelector<HTMLElement>('[data-ra-payment]');
if(payment){let method:PaymentMethod='flow';try{const r=JSON.parse(safeStore.get('ra01.preview.registration')??'{}');if(r.method==='transfer')method='transfer';const ref=document.querySelector('[data-preview-reference]');if(ref&&/^preview-[a-f0-9-]{36}$/.test(r.id??''))ref.textContent=r.id;}catch{/* keep safe default */}
 const renderMethod=(value:PaymentMethod)=>{method=value;document.querySelectorAll<HTMLElement>('[data-payment-panel]').forEach(el=>el.hidden=el.dataset.paymentPanel!==method);document.querySelectorAll<HTMLButtonElement>('[data-select-method]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.selectMethod===method)));};
 renderMethod(method);document.querySelectorAll<HTMLButtonElement>('[data-select-method]').forEach(b=>b.addEventListener('click',()=>{renderMethod(b.dataset.selectMethod==='transfer'?'transfer':'flow');if(method==='transfer')track('ra01_transfer_select',{method})}));
 document.querySelectorAll<HTMLButtonElement>('[data-preview-availability]').forEach(b=>b.addEventListener('click',()=>{
  const state=b.dataset.previewAvailability;
  payment.querySelectorAll<HTMLElement>('[data-transfer-state]').forEach(p=>p.hidden=p.dataset.transferState!==state);
  payment.querySelector<HTMLElement>('[data-transfer-details]')!.hidden=state!=='normal';
  payment.querySelectorAll('[data-preview-availability]').forEach(el=>el.setAttribute('aria-pressed',String(el===b)));
 }));
 document.querySelectorAll<HTMLButtonElement>('[data-preview-outcome]').forEach(b=>b.addEventListener('click',()=>{const out=document.querySelector<HTMLElement>('[data-payment-status]')!;const key=b.dataset.previewOutcome;out.textContent=key==='approved'?'Simulación: Flow informa un pago. La inscripción sigue pendiente de verificación; esta prueba no reserva un cupo.':key==='rejected'?'Simulación: pago rechazado. Puedes revisar tus datos o elegir transferencia. Si ves un cargo, no repitas el pago hasta consultar.':'Simulación: pago cancelado. No se ha confirmado ninguna inscripción.';out.focus();}));
 document.querySelectorAll<HTMLButtonElement>('[data-bank-copy]').forEach(b=>b.addEventListener('click',async()=>{const value=b.dataset.copyValue;const status=document.querySelector<HTMLElement>('[data-copy-status]')!;if(!value){status.textContent='Los datos bancarios aún no están habilitados.';return;}try{await navigator.clipboard.writeText(value);status.textContent='Datos copiados';track('ra01_transfer_copy',{method:'transfer'})}catch{status.textContent='No se pudo copiar. Selecciona el dato y cópialo manualmente.'}}));
}
document.querySelectorAll<HTMLElement>('[data-local-checklist]').forEach(container=>{const button=container.querySelector('button');button?.addEventListener('click',()=>{const inputs=[...container.querySelectorAll<HTMLInputElement>('input[type="checkbox"]')];const complete=inputs.every(i=>i.checked);const status=container.querySelector<HTMLElement>('[role="status"]')!;status.textContent=complete?'Prueba local completada. En producción el checkpoint se registra mediante el formulario privado de preparación.':'Revisa los pasos pendientes. Puedes solicitar ayuda por correo.';if(complete)track('ra01_technical_check_complete',{status:'preview'});});});
document.querySelectorAll<HTMLButtonElement>('[data-print-policy]').forEach(b=>b.addEventListener('click',()=>print()));
// A production embed is configured only after external integration and release checks pass.
const tallyFrame=document.querySelector<HTMLIFrameElement>('[data-tally-registration]');
if(tallyFrame&&tallyFrame.dataset.src){const url=new URL(tallyFrame.dataset.src);let stored:Record<string,string>={};try{stored=JSON.parse(safeStore.get('ra01.touch')??'{}')}catch{/* missing attribution */}for(const [k,v] of Object.entries(stored))if((k==='utm_source'&&sources.has(v))||(k==='utm_medium'&&media.has(v))||(k==='utm_campaign'&&v==='ra01_2026_10')||(k==='utm_content'&&contents.has(v)))url.searchParams.set(k,v);tallyFrame.src=url.toString();const seen=new Set<string>();window.addEventListener('message',e=>{if(e.origin!=='https://tally.so'||e.source!==tallyFrame.contentWindow)return;let data;try{data=typeof e.data==='string'?JSON.parse(e.data):e.data}catch{return}if(data?.event!=='Tally.FormSubmitted'||data?.payload?.formId!==tallyFrame.dataset.formId)return;const id=String(data.payload.submissionId??'');if(!/^[a-zA-Z0-9_-]{6,100}$/.test(id)||seen.has(id))return;seen.add(id);track('ra01_registration_submit',{status:'submitted'});});}
export {};
