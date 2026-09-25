import {contractFinal, privateBuild} from './ra01-private-build.mjs';
/** Public, non-secret edition configuration. Never put Zoom, Drive grants or credentials here. */
export const ra01 = {
  edition: 'RA01', productName: 'Rehabilitación Aumentada 01',
  labName: 'Laboratorio de Rehabilitación Clínica Aumentada',
  instructor: 'Ítalo Campos Montenegro',
  descriptor: 'Diseña y personaliza software asistivo de Comunicación Aumentativa y Alternativa con Inteligencia Artificial, sin requerir conocimientos previos de programación.',
  date: '2026-10-31', timezone: 'America/Santiago', startTime: '09:00', endTime: '13:30',
  price: 39000, currency: 'CLP', platform: 'Zoom',
  registrationClose: '2026-10-26T18:00:00-03:00',
  supportEmail: 'italo.campos.montenegro@gmail.com',
  supportUntil: '2027-01-31', materialsAccessUntil: '2027-01-31', recordingAccessUntil: '2027-01-31',
  certificateEnabled: true, certificateAttendanceThreshold: 80, teachingMinutes: 250,
  recordingEnabled: true, canonicalPath: '/formacion/ra01',
  professionalSite: 'https://italocampos.cl/',
  instagram: 'https://www.instagram.com/italo_campos_montenegro/',
  orcid: 'https://orcid.org/0009-0007-0325-3344',
  linkedin: 'https://cl.linkedin.com/in/italo-campos-montenegro-789534376',
  termsVersion: '2026-09-24.2', privacyVersion: '2026-09-24.2', formVersion: 'ra01-v3',
  mode: 'production' as 'preview' | 'production',
  tally: { registrationUrl: 'https://tally.so/r/7RGv6a' as string | null, technicalCheckUrl: 'https://tally.so/r/pbaWj8' as string | null, waitlistUrl: null as string | null },
  // Operator-controlled availability. Update after checking Sheets and payment channels; no live stock is implied.
  transferAvailability: 'normal' as 'normal' | 'limited' | 'closed',
  onlinePaymentProvider: 'flow',
  onlinePaymentType: 'payment_button',
  onlinePaymentUrl: privateBuild.onlinePaymentUrl,
  onlinePaymentLabel: 'Pagar online con Flow',
  bankAccountHolder: privateBuild.bank?.holder ?? null, bankRut: privateBuild.bank?.rut ?? null,
  bankName: privateBuild.bank?.bankName ?? null, bankAccountType: privateBuild.bank?.accountType ?? null,
  bankAccountNumber: privateBuild.bank?.accountNumber ?? null, bankEmail: privateBuild.bank?.notificationEmail ?? null,
  seller: { legalName: privateBuild.seller.legalName, rut: privateBuild.seller.rut, address: privateBuild.seller.address, taxDocument: privateBuild.seller.taxDocument },
  analytics: { measurementId: null as string | null },
  release: { legalApproved: contractFinal, transferFlowReviewed: true, rightsVerified: true, freeRouteVerified: true, hostingCommercialApproved: true, tallyIntegrationVerified: true, onlinePaymentVerified: true, privateDeliveryVerified: true },
} as const;

export const ra01Price = new Intl.NumberFormat('es-CL', {style:'currency',currency:'CLP',maximumFractionDigits:0}).format(ra01.price);
export const policyPath = (slug: string) => `${ra01.canonicalPath}/legal/${ra01.termsVersion}/${slug}`;
export const isOfficialOnlinePayment = (provider: string, type: string, value: string | null) => {
  if (!value) return false;
  try {
    const u = new URL(value);
    return provider === 'flow' && type === 'payment_button' && u.protocol === 'https:' && u.hostname === 'www.flow.cl' && u.pathname === '/btn.php' && /^\?token=[a-f0-9]{40}$/.test(u.search) && !u.username && !u.password && !u.hash;
  } catch { return false; }
};
export function productionBlockers() {
  const blocks: string[] = [];
  if (ra01.mode !== 'production') blocks.push('preview');
  for (const [key, value] of Object.entries(ra01.release)) if (!value) blocks.push(key);
  if (!isOfficialOnlinePayment(ra01.onlinePaymentProvider, ra01.onlinePaymentType, ra01.onlinePaymentUrl)) blocks.push('onlinePaymentUrl');
  for (const key of ['bankAccountHolder','bankRut','bankName','bankAccountType','bankAccountNumber'] as const) if (!ra01[key]) blocks.push(key);
  for (const [key, value] of Object.entries(ra01.seller)) if (!value) blocks.push(`seller.${key}`);
  if (!ra01.tally.registrationUrl?.startsWith('https://tally.so/')) blocks.push('tally.registrationUrl');
  return blocks;
}
export const paymentsEnabled = productionBlockers().length === 0;
export const registrationEnabled = paymentsEnabled;
export const onlinePaymentEnabled = paymentsEnabled && isOfficialOnlinePayment(ra01.onlinePaymentProvider, ra01.onlinePaymentType, ra01.onlinePaymentUrl);
export const agenda = [
  ['09:00–09:25', 'El punto de partida', 'Demostración, propósito y funciones que conservaremos.'],
  ['09:25–09:50', 'La necesidad primero', 'Usuario ficticio, contexto de participación y requerimientos.'],
  ['09:50–10:25', 'Primera personalización', 'Nombre, mensajes, categorías y decisiones visuales.'],
  ['10:25–10:35', 'Pausa', 'Diez minutos para descansar.'],
  ['10:35–11:20', 'Modificar y revisar', 'Cambios acotados y primer checkpoint del proyecto.'],
  ['11:20–11:30', 'Pausa', 'Diez minutos para descansar.'],
  ['11:30–12:15', 'Probar el resultado', 'Teclado, legibilidad, funcionamiento y privacidad.'],
  ['12:15–12:55', 'Preparar la publicación', 'Archivo personalizado y revisión del enlace en un entorno limpio.'],
  ['12:55–13:30', 'Revisión y próximos pasos', 'Retroalimentación entre pares y cierre del proceso.'],
] as const;
export const demos = [
  {id:'casa',name:'Mi voz en casa',context:'Vida cotidiana',need:'Expresar preferencias y pedir apoyo en una rutina domiciliaria.',changes:'Vocabulario cotidiano, decisiones y necesidades.',image:'/ra01/demos/casa.png'},
  {id:'rehabilitacion',name:'Participar en rehabilitación',context:'Rehabilitación',need:'Pedir una pausa, solicitar una explicación y expresar cómo continuar.',changes:'Ritmo de la actividad, comprensión y participación.',image:'/ra01/demos/rehabilitacion.png'},
  {id:'comunidad',name:'Encuentro comunitario',context:'Participación comunitaria',need:'Tomar un turno, proponer una actividad y pedir que repitan una instrucción.',changes:'Turnos, acuerdos y participación en grupo.',image:'/ra01/demos/comunidad.png'},
] as const;
