/* Editor LOCAL de fechas por sede. No hace escrituras remotas ni publica cambios. */
(() => {
 'use strict';
 const $ = id => document.getElementById(id);
 const original = window.DATOS_SITIO;
 if (!original) { alert('No se pudo leer ../js/datos.js'); return; }
 const data = JSON.parse(JSON.stringify(original));
 const currentISO = () => {let d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
 const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const selected = () => data.sedes.find(v => v.id === $('venueSelect').value);
 function present() {
  const sede = selected(); if (!sede) return;
  $('venueDetail').textContent = `${sede.nombre} · ${sede.zona}`;
  const entries = Object.entries(sede.agenda || {}).filter(([,v]) => v?.length).sort(([a],[b])=>a.localeCompare(b));
  $('slotList').innerHTML = entries.length ? entries.map(([date,slots]) => `<div><strong style="font-size:12px;display:block;margin:13px 0 7px;">${esc(date)} · ${slots.length} horario(s)</strong>${slots.sort().map(time => `<div class="admin-entry"><span>${esc(time)} hrs</span><button type="button" data-date="${esc(date)}" data-time="${esc(time)}" aria-label="Eliminar ${esc(time)} del ${esc(date)}">Eliminar</button></div>`).join('')}</div>`).join('') : '<p class="input-hint">Todavía no hay horarios cargados para esta sede.</p>';
  $('slotList').querySelectorAll('button[data-time]').forEach(b => b.addEventListener('click',()=>{ const schedule = sede.agenda[b.dataset.date]; sede.agenda[b.dataset.date] = schedule.filter(t=>t!==b.dataset.time); if (!sede.agenda[b.dataset.date].length) delete sede.agenda[b.dataset.date]; present(); $('formStatus').textContent='Horario eliminado del borrador.';}));
 }
 function addSlot() {
  const sede = selected(), date=$('dateInput').value, time=$('timeInput').value;
  if (!sede || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) { $('formStatus').textContent='Selecciona una sede, una fecha y un horario válidos.'; return; }
  if (date < currentISO()) { $('formStatus').textContent='No puedes publicar horarios de fechas pasadas.';return; }
  if (!sede.agenda) sede.agenda={};
  const slots = sede.agenda[date] || [];
  if (slots.includes(time)) { $('formStatus').textContent='Ese horario ya existe para esa fecha.'; return; }
  sede.agenda[date] = [...slots,time].sort();
  $('formStatus').textContent=`Guardado en el borrador: ${sede.nombre}, ${date} a las ${time}.`;
  present();
 }
 function exportData() {
  const wa = $('whatsappInput').value.replace(/\D/g,''), tel = $('phoneInput').value.trim();
  if (wa && (wa.length < 10 || wa.length > 15)) { $('exportStatus').textContent='Corrige el WhatsApp: debe contener entre 10 y 15 dígitos.'; return; }
  if (tel && !/^\+?[\d ()-]{10,22}$/.test(tel)) { $('exportStatus').textContent='Corrige el teléfono: solo números y formato telefónico.'; return; }
  data.medico.whatsapp=wa;data.medico.telefono=tel;
  const generated = `/* Configuración exportada por el editor LOCAL de disponibilidad.\n * Sustituye js/datos.js en el servidor.\n * No publiques admin/. No se confirman citas automáticamente.\n */\nwindow.DATOS_SITIO = ${JSON.stringify(data,null,2)};\n`;
  const blob = new Blob([generated],{type:'text/javascript;charset=utf-8'});
  const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download='datos.js';
  document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1300);
  $('exportStatus').textContent='Archivo descargado. Reemplaza js/datos.js en el sitio publicado y actualiza la página para ver los cambios.';
 }
 document.addEventListener('DOMContentLoaded',()=>{
  const select=$('venueSelect');
  data.sedes.forEach(s => select.add(new Option(`${s.nombre} — ${s.zona}`,s.id)));
  $('dateInput').value=currentISO();$('dateInput').min=currentISO();
  $('whatsappInput').value=data.medico.whatsapp || ''; $('phoneInput').value=data.medico.telefono || '';
  select.addEventListener('change',()=>{$('formStatus').textContent='';present();});
  $('addSlot').addEventListener('click',addSlot);
  $('clearPast').addEventListener('click',()=>{ const sede=selected();let count=0;for(const d of Object.keys(sede.agenda||{})){if(d<currentISO()){delete sede.agenda[d];count++;}} $('formStatus').textContent=count ? `Se eliminaron ${count} fechas pasadas.`:'No hay fechas pasadas que eliminar.';present();});
  $('exportFile').addEventListener('click',exportData);
  present();
 });
})();
