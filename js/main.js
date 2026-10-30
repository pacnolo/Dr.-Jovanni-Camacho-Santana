/*
 * Dr. Jovanni Camacho Santana — interfaz pública.
 * Datos editables en js/datos.js. El sitio no guarda datos del paciente.
 * La agenda es informativa: la cita se solicita por WhatsApp y requiere confirmación.
 */
(() => {
  'use strict';
  const DATOS = window.DATOS_SITIO;
  if (!DATOS) { console.error('Falta js/datos.js'); return; }
  const $ = (id) => document.getElementById(id);
  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
  const icon = (name, klass = '') => `<svg class="${klass}" aria-hidden="true"><use href="#i-${name}"></use></svg>`;
  const modal = $('contentModal');
  const content = $('modalContent');
  const title = $('modalTitle');
  const eyebrow = $('modalEyebrow');
  let modalOpen = false, previousFocus = null, lastView = '', lastVenue = null;
  let serviceFilter = 'Todos', selectedService = '', weekOffset = 0, selectedDate = '', selectedTime = '';
  const formatDay = new Intl.DateTimeFormat('es-MX', { weekday: 'short' });
  const formatMonth = new Intl.DateTimeFormat('es-MX', { month: 'short' });
  const formatFull = new Intl.DateTimeFormat('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  let toastTimer;

  function announce(msg) {
    $('toast').textContent = msg;
    $('toast').classList.add('active');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => $('toast').classList.remove('active'), 4300);
  }
  function isoLocal(date) {
    return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
  }
  function parseLocal(iso) {
    const [y,m,d] = iso.split('-').map(Number);
    return new Date(y,m-1,d);
  }
  function today() { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
  function plusDays(base, n) { const d = new Date(base); d.setDate(d.getDate()+n); return d; }
  function shortDay(date) { return formatDay.format(date).replace('.', '').replace(/^./, c=>c.toUpperCase()); }
  function prettyDate(date) { return formatFull.format(date).replace(/^./, c=>c.toUpperCase()); }
  function whDigits() { return String(DATOS.medico.whatsapp || '').replace(/\D/g, ''); }
  function phoneDigits() { return String(DATOS.medico.telefono || '').replace(/[^\d+]/g, ''); }
  function mapsUrl(sede) { return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(`${sede.nombre}, ${sede.direccion}`); }
  function setHeader(kicker, heading) { eyebrow.textContent = kicker; title.textContent = heading; }
  function openModal(view, venueId = null) {
    if (!modalOpen) previousFocus = document.activeElement;
    modalOpen = true;
    modal.classList.add('open'); modal.setAttribute('aria-hidden', 'false'); document.body.classList.add('no-scroll');
    $('menuButton').setAttribute('aria-expanded', 'false'); $('mobileNavigation').hidden = true;
    if (view === 'about') showAbout();
    if (view === 'services') showServices();
    if (view === 'choose') showChoose();
    if (view === 'agenda') showAgenda(venueId);
    $('modalClose').focus({preventScroll: true});
  }
  function closeModal() {
    if (!modalOpen) return;
    modalOpen = false; modal.classList.remove('open'); modal.setAttribute('aria-hidden', 'true'); document.body.classList.remove('no-scroll');
    if (previousFocus && typeof previousFocus.focus === 'function') previousFocus.focus({preventScroll: true});
  }
  function showAbout() {
    lastView = 'about'; setHeader('TRAYECTORIA · FILOSOFÍA DE ATENCIÓN', 'Sobre mí');
    content.innerHTML = `<div class="about-top"><span class="about-symbol">${icon('kidney')}</span><div><b>${esc(DATOS.medico.nombre)}</b><small>${esc(DATOS.medico.titulo)}</small></div></div>
      <div class="about-paragraphs">${DATOS.medico.biografia.map(p => `<p>${esc(p)}</p>`).join('')}</div>
      <div class="focus-panel"><small>ENFOCADO EN</small>${DATOS.medico.especialidades.map(e => `<span>${icon('check')}${esc(e)}</span>`).join('')}</div>
      <div class="modal-bottom-action"><button class="btn btn-dark" type="button" data-go="choose">Consultar sedes y horarios ${icon('arrow')}</button></div>`;
  }
  function showServices() {
    lastView = 'services'; setHeader('SERVICIOS Y PROCEDIMIENTOS', 'Atención especializada');
    content.innerHTML = `<p class="modal-lead">Explora las áreas de atención. Selecciona un servicio para conocer más; los precios se informarán directamente en el consultorio.</p>
    <label class="search-wrap">${icon('search')}<input id="serviceSearch" type="search" placeholder="Buscar entre los 17 servicios" aria-label="Buscar servicios"></label>
    <div class="filters" id="serviceFilters"></div><div class="service-list" id="serviceList"></div>`;
    serviceFilter = 'Todos';
    const filters = ['Todos', ...new Set(DATOS.servicios.map(s => s.categoria))];
    const wrapper = $('serviceFilters');
    filters.forEach(f => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'filter-pill'; b.textContent = f; b.dataset.filter = f;
      b.setAttribute('aria-pressed', String(f === serviceFilter)); wrapper.append(b);
    });
    $('serviceSearch').addEventListener('input', renderServiceList);
    wrapper.addEventListener('click', (e) => { const b = e.target.closest('[data-filter]'); if (!b) return; serviceFilter = b.dataset.filter; wrapper.querySelectorAll('[data-filter]').forEach(p => p.setAttribute('aria-pressed', String(p === serviceFilter))); renderServiceList(); });
    renderServiceList();
  }
  function renderServiceList() {
    const query = ($('serviceSearch')?.value || '').trim().toLocaleLowerCase('es');
    const list = $('serviceList'); if (!list) return;
    const matches = DATOS.servicios.filter(s => (serviceFilter === 'Todos' || s.categoria === serviceFilter) && (`${s.titulo} ${s.detalle} ${s.categoria}`).toLocaleLowerCase('es').includes(query));
    list.innerHTML = matches.length ? matches.map(s => `<button class="service-row" type="button" data-service="${esc(s.id)}"><span class="small-icon">${icon('steth')}</span><span class="service-row-copy"><strong>${esc(s.titulo)}</strong><small>${esc(s.categoria)}</small></span><span class="circle-arrow">${icon('arrow')}</span></button>`).join('') : `<p class="empty-state">No encontramos servicios con esa búsqueda.</p>`;
    list.querySelectorAll('[data-service]').forEach(b => b.addEventListener('click', () => showServiceDetail(b.dataset.service)));
  }
  function showServiceDetail(id) {
    const s = DATOS.servicios.find(x => x.id === id); if (!s) return;
    lastView = 'service-detail'; selectedService = s.titulo;
    setHeader(s.categoria.toUpperCase(), s.titulo);
    content.innerHTML = `<button class="back-inline" type="button" data-go="services">${icon('back')} Ver todos los servicios</button>
      <div class="detail-hero"><span class="detail-icon">${icon('steth')}</span><div><small>ATENCIÓN MÉDICA ESPECIALIZADA</small><h3>${esc(s.titulo)}</h3></div></div>
      <p class="detail-copy">${esc(s.detalle)}</p>
      <div class="info-note">${icon('doc')} La pertinencia de cada procedimiento, sus indicaciones y su costo se determinan directamente durante la atención médica. No se publican precios en esta página.</div>
      <div class="modal-bottom-action"><button class="btn btn-dark" type="button" data-go="choose">Consultar disponibilidad ${icon('arrow')}</button></div>`;
  }
  function showChoose() {
    lastView = 'choose'; setHeader('SELECCIONA DÓNDE ATENDERTE', 'Elige una sede');
    content.innerHTML = `<p class="modal-lead">Cada sede tiene su propia agenda. Selecciona una ubicación para revisar únicamente los horarios publicados para ese lugar.</p><div class="choice-list">${DATOS.sedes.map(s => venueButton(s)).join('')}</div>`;
  }
  function venueButton(s) {
    return `<button type="button" class="venue-choice" data-venue="${esc(s.id)}"><span class="small-icon">${icon('pin')}</span><span><strong>${esc(s.nombre)}</strong><small>${esc(s.zona)} · ${esc(s.direccion)}</small></span>${icon('arrow', 'venue-choice-arrow')}</button>`;
  }
  function showAgenda(id) {
    const sede = DATOS.sedes.find(v => v.id === id); if (!sede) { showChoose(); return; }
    if (lastVenue !== id) { selectedDate = ''; selectedTime = ''; weekOffset = 0; }
    lastVenue = id; lastView = 'agenda'; setHeader('AGENDA POR SEDE', sede.nombre);
    content.innerHTML = `<button class="back-inline" type="button" data-go="choose">${icon('back')} Cambiar de hospital o consultorio</button>
      <div class="agenda-location"><span class="detail-icon">${icon('pin')}</span><div><strong>${esc(sede.nombre)}</strong><p>${esc(sede.direccion)}</p><a href="${mapsUrl(sede)}" target="_blank" rel="noopener noreferrer">Ver ubicación en Google Maps ↗</a></div></div>
      <div class="agenda-header"><div><span class="step-number">01</span><strong>Selecciona el día</strong></div><small>Horarios de esta sede</small></div>
      <div class="calendar-nav"><button id="weekPrev" type="button" aria-label="Semana anterior" class="week-arrow">‹</button><span id="weekRange"></span><button id="weekNext" type="button" aria-label="Semana siguiente" class="week-arrow">›</button></div>
      <div class="day-strip" id="dayStrip" role="group" aria-label="Fechas disponibles"></div>
      <div class="agenda-header agenda-header-second"><div><span class="step-number">02</span><strong>Selecciona el horario</strong></div></div>
      <div id="timeChoices" class="time-choices"></div>
      <label class="patient-label" for="patientName">Tu nombre <span>(opcional)</span></label><input class="patient-input" id="patientName" maxlength="80" autocomplete="name" placeholder="¿Cómo te llamas?">
      <div class="info-note">${icon('calendar')} Los horarios publicados son orientativos. Enviar el mensaje no confirma ni bloquea una cita; recibirás confirmación directamente del consultorio.</div>
      <button id="sendAppointment" class="btn btn-dark send-appointment" type="button" disabled>${icon('whatsapp')} Solicitar cita por WhatsApp ${icon('arrow')}</button>${phoneDigits() ? `<a class="agenda-call" href="tel:${esc(phoneDigits())}">${icon('phone')} Llamar al consultorio</a>` : ''}<p class="agenda-help" id="agendaHelp"></p>`;
    $('weekPrev').addEventListener('click', () => { if (weekOffset >= 7) { weekOffset -= 7; selectedDate = ''; selectedTime = ''; renderCalendar(sede); }});
    $('weekNext').addEventListener('click', () => { if (weekOffset < 84) { weekOffset += 7; selectedDate = ''; selectedTime = ''; renderCalendar(sede); }});
    $('sendAppointment').addEventListener('click', () => sendAppointment(sede));
    renderCalendar(sede);
  }
  function slotsFor(sede, dateIso) {
    const slotValues = Array.isArray(sede.agenda?.[dateIso]) ? sede.agenda[dateIso] : [];
    // Descartar horarios pasados de hoy en la hora local del navegador.
    const isToday = dateIso === isoLocal(today());
    const now = new Date(); const minutesNow = now.getHours() * 60 + now.getMinutes();
    return [...new Set(slotValues)].filter(t => /^([01]\d|2[0-3]):[0-5]\d$/.test(t))
      .filter(t => !isToday || (Number(t.slice(0,2))*60+Number(t.slice(3))) > minutesNow)
      .sort();
  }
  function renderCalendar(sede) {
    const from = plusDays(today(), weekOffset), through = plusDays(from, 6);
    $('weekRange').textContent = `${from.getDate()} ${formatMonth.format(from)} — ${through.getDate()} ${formatMonth.format(through)}`;
    $('weekPrev').disabled = weekOffset === 0; $('weekNext').disabled = weekOffset >= 84;
    const days = $('dayStrip'); days.replaceChildren();
    const available = [];
    for (let i=0;i<7;i++) {
      const day = plusDays(from, i); const dayIso = isoLocal(day); const count = slotsFor(sede, dayIso).length;
      if (count) available.push(dayIso);
      const button = document.createElement('button'); button.type = 'button'; button.className = 'day-button';
      if (dayIso === selectedDate) button.classList.add('selected');
      button.disabled = count === 0; button.setAttribute('aria-pressed', String(dayIso === selectedDate));
      button.innerHTML = `<small>${shortDay(day)}</small><b>${day.getDate()}</b><span>${count ? count + (count === 1 ? ' horario' : ' horarios') : '—'}</span>`;
      if (count) button.addEventListener('click', () => { selectedDate = dayIso; selectedTime = ''; renderCalendar(sede); });
      days.append(button);
    }
    if (!available.includes(selectedDate)) selectedDate = available[0] || '';
    days.querySelectorAll('button').forEach((b,i) => { const dayIso = isoLocal(plusDays(from,i)); b.classList.toggle('selected', dayIso === selectedDate); b.setAttribute('aria-pressed',String(dayIso === selectedDate)); });
    const times = $('timeChoices'); times.replaceChildren();
    if (!selectedDate) {
      const futureCount = Object.keys(sede.agenda || {}).filter(d => d >= isoLocal(today()) && Array.isArray(sede.agenda[d]) && sede.agenda[d].length).length;
      times.innerHTML = `<div class="empty-calendar">${icon('calendar')}<p>${futureCount ? 'No hay horarios publicados para los días mostrados. Puedes consultar la siguiente semana.' : 'Esta sede todavía no tiene horarios publicados. Consulta más adelante o comunícate directamente con el consultorio.'}</p></div>`;
    } else {
      const caption = document.createElement('p'); caption.className = 'selected-caption'; caption.textContent = prettyDate(parseLocal(selectedDate)); times.append(caption);
      const group = document.createElement('div'); group.className = 'time-grid';
      slotsFor(sede, selectedDate).forEach(t => {
        const b = document.createElement('button'); b.type = 'button'; b.className = 'time-btn'; b.textContent = t; b.setAttribute('aria-pressed', String(t === selectedTime));
        if (t === selectedTime) b.classList.add('selected');
        b.addEventListener('click', () => { selectedTime = t; renderCalendar(sede); }); group.append(b);
      }); times.append(group);
    }
    const valid = selectedDate && selectedTime && slotsFor(sede, selectedDate).includes(selectedTime);
    $('sendAppointment').disabled = !(valid && whDigits().length >= 10);
    $('agendaHelp').textContent = !whDigits() ? 'WhatsApp aún no está configurado por el administrador.' : valid ? 'Se abrirá WhatsApp con los datos de la cita solicitada.' : 'Selecciona un día y un horario publicado para continuar.';
  }
  function sendAppointment(sede) {
    if (!selectedDate || !selectedTime || !slotsFor(sede, selectedDate).includes(selectedTime)) return;
    const digits = whDigits(); if (digits.length < 10 || digits.length > 15) { announce('El WhatsApp del consultorio aún no está configurado.'); return; }
    const patient = $('patientName').value.trim();
    const msg = `Hola, buen día. Me gustaría solicitar una cita con el ${DATOS.medico.nombre}.\n\nSede: ${sede.nombre}\nFecha: ${prettyDate(parseLocal(selectedDate))}\nHorario solicitado: ${selectedTime}${patient ? '\nNombre: ' + patient : ''}${selectedService ? '\nServicio de interés: ' + selectedService : ''}\n\n¿Podrían confirmarme si está disponible? Gracias.`;
    window.open(`https://wa.me/${digits}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer');
  }
  function renderVenues() {
    $('venuesList').innerHTML = DATOS.sedes.map(s => `<button type="button" class="venue-card" data-venue="${esc(s.id)}"><span class="venue-heading"><b>${esc(s.nombre)}</b><span class="venue-symbol">${icon('pin')}</span></span><span class="venue-text"><small>${esc(s.zona)}</small></span><span class="venue-bottom"><span>Ver agenda</span><span class="circle-arrow">${icon('arrow')}</span></span></button>`).join('');
  }
  function openFromTarget(target) {
    const b = target.closest('[data-modal], [data-venue], [data-go]'); if (!b) return false;
    if (b.dataset.venue) { if (!modalOpen) selectedService = ''; openModal('agenda', b.dataset.venue); return true; }
    if (b.dataset.go) { if (b.dataset.go === 'services') showServices(); else if (b.dataset.go === 'choose') showChoose(); return true; }
    if (b.dataset.modal) { selectedService = ''; openModal(b.dataset.modal); return true; }
    return false;
  }
  function escapeVCard(value) { return String(value ?? '').replace(/\\/g,'\\\\').replace(/\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;'); }
  function saveContact() {
    const med = DATOS.medico;
    const lines = ['BEGIN:VCARD','VERSION:3.0', `FN:${escapeVCard(med.nombre)}`, `TITLE:${escapeVCard(med.titulo)}`];
    if (med.telefono) lines.push(`TEL;TYPE=WORK:${escapeVCard(med.telefono)}`);
    if (med.email) lines.push(`EMAIL:${escapeVCard(med.email)}`);
    lines.push('END:VCARD');
    const blob = new Blob([lines.join('\r\n')+'\r\n'], {type:'text/vcard;charset=utf-8'});
    const url = URL.createObjectURL(blob), a = document.createElement('a'); a.href = url; a.download = 'Dr_Jovanni_Camacho_Santana.vcf';
    document.body.append(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(url),1000);
    announce(med.telefono ? 'Contacto preparado para guardar.' : 'Contacto guardado sin teléfono; aún falta configurarlo.');
  }
  async function sharePage() {
    const payload = {title: DATOS.medico.nombre, text: DATOS.medico.titulo, url: location.href};
    if (navigator.share) { try {await navigator.share(payload);} catch(e) {if (e.name !== 'AbortError') announce('No fue posible compartir.'); } }
    else if (navigator.clipboard && window.isSecureContext) { try { await navigator.clipboard.writeText(location.href); announce('Enlace copiado.'); } catch {announce('Copia el enlace desde la barra de direcciones.');} }
    else announce('Copia el enlace desde la barra de direcciones.');
  }
  document.addEventListener('DOMContentLoaded', () => {
    renderVenues();
    document.body.addEventListener('click', e => { const btn = e.target.closest('[data-modal],[data-venue],[data-go]'); if (btn) openFromTarget(btn); });
    $('modalClose').addEventListener('click',closeModal);
    modal.querySelector('.modal-shade').addEventListener('click',closeModal);
    document.addEventListener('keydown', e => {
      if (!modalOpen) return;
      if (e.key === 'Escape') { closeModal(); return; }
      if (e.key === 'Tab') {
        const nodes = [...modal.querySelectorAll('button:not(:disabled), a[href], input:not(:disabled)')].filter(el => el.getClientRects().length > 0);
        if (!nodes.length) return;
        const first = nodes[0], last = nodes[nodes.length-1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    $('menuButton').addEventListener('click',()=>{
      const btn = $('menuButton'), nav = $('mobileNavigation'), expand = btn.getAttribute('aria-expanded') !== 'true';
      nav.hidden = !expand; btn.setAttribute('aria-expanded',String(expand)); btn.setAttribute('aria-label',expand ? 'Cerrar menú':'Abrir menú');
    });
    $('mobileNavigation').querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{ $('mobileNavigation').hidden = true; $('menuButton').setAttribute('aria-expanded','false'); }));
    $('saveContact').addEventListener('click',saveContact);
    $('sharePage').addEventListener('click',sharePage);
  });
})();
