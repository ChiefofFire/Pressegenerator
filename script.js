const $ = id => document.getElementById(id);

/* ===========================
   Stichwort-Liste (persistent)
   =========================== */
const STW_KEY = 'stichwortOptions_v1';
const defaultStichwoerter = [
  "B1 Kleinbrand",
  "B2 Mittelbrand",
  "B3 Großbrand",
  "BMA ausgelöst",
  "VU PKW",
  "VU eingeklemmt",
  "Gasgeruch",
  "Ölspur",
  "Wasser im Keller",
  "Tierrettung",
  "TH klein",
  "TH mittel",
  "TH groß"
];

function loadStichwortOptions(){
  try {
    const raw = localStorage.getItem(STW_KEY);
    const arr = raw ? JSON.parse(raw) : defaultStichwoerter;
    return Array.isArray(arr) && arr.length ? arr : defaultStichwoerter;
  } catch {
    return defaultStichwoerter;
  }
}
function saveStichwortOptions(list){ localStorage.setItem(STW_KEY, JSON.stringify(list)); }
function renderStichwortDatalist(){
  const list = loadStichwortOptions();
  const dl = $('stichwort-list');
  if(!dl) return;
  dl.innerHTML = '';
  list.forEach(opt=>{
    const o = document.createElement('option');
    o.value = opt;
    dl.appendChild(o);
  });
}
function addCurrentStichwort(){
  const val = ($('stichwort').value || '').trim();
  if(!val) return alert('Bitte zuerst ein Stichwort eingeben.');
  let list = loadStichwortOptions();
  const exists = list.some(x => x.toLowerCase() === val.toLowerCase());
  if(exists) { alert('Dieses Stichwort ist bereits in der Liste.'); return; }
  list.push(val);
  list = [...new Set(list)].sort((a,b)=>a.localeCompare(b,'de'));
  saveStichwortOptions(list);
  renderStichwortDatalist();
  alert('Stichwort gespeichert.');
}
function resetStichwoerter(){
  if(!confirm('Liste auf Standard zurücksetzen? (Nur dieses Gerät)')) return;
  saveStichwortOptions(defaultStichwoerter);
  renderStichwortDatalist();
  alert('Liste zurückgesetzt.');
}

/* ==========================================
   Eigene Vorschlagsliste (mobil-sicher)
   ========================================== */
const suggestEl = document.getElementById('stw-suggest');
let currentItems = [];
let activeIndex = -1;

function filterStichwoerter(q){
  const list = loadStichwortOptions();
  if(!q) return list.slice(0, 10);
  const needle = q.toLowerCase();
  return list.filter(v => v.toLowerCase().includes(needle)).slice(0, 20);
}
function openSuggest(items){
  currentItems = items; activeIndex = -1;
  suggestEl.innerHTML = items.map((v,i)=>`<li data-i="${i}" data-v="${v}">${v}</li>`).join('');
  suggestEl.hidden = items.length === 0;
}
function closeSuggest(){ suggestEl.hidden = true; currentItems = []; activeIndex = -1; }
function pickValue(v){ $('stichwort').value = v; closeSuggest(); updatePreview(); }

$('stichwort').addEventListener('input', (e)=>{
  const q = e.target.value;
  openSuggest(filterStichwoerter(q));
});
$('stichwort').addEventListener('focus', (e)=>{
  openSuggest(filterStichwoerter(e.target.value));
});
$('stichwort').addEventListener('blur', ()=>{
  setTimeout(closeSuggest, 120);
});
suggestEl.addEventListener('mousedown', (e)=>{
  const li = e.target.closest('li'); if(!li) return;
  pickValue(li.dataset.v);
});
$('stichwort').addEventListener('keydown', (e)=>{
  if(suggestEl.hidden) return;
  if(e.key === 'ArrowDown'){
    e.preventDefault(); activeIndex = Math.min(activeIndex + 1, currentItems.length - 1);
  } else if(e.key === 'ArrowUp'){
    e.preventDefault(); activeIndex = Math.max(activeIndex - 1, 0);
  } else if(e.key === 'Enter'){
    if(activeIndex >= 0 && currentItems[activeIndex]){ e.preventDefault(); pickValue(currentItems[activeIndex]); }
  } else if(e.key === 'Escape'){ closeSuggest(); return; } else { return; }
  [...suggestEl.children].forEach((li,i)=>{ li.classList.toggle('active', i===activeIndex); });
});

/* ==========================================
   Mehrfach-Auswahl "Kräfte vor Ort"
   ========================================== */
const UNITS_KEY = 'unitsOptions_v1';
const UNITS_SEL_KEY = 'unitsSelected_v1';

const defaultUnits = [
  "FF Meyenfeld",
  "FF Horst",
  "FF Berenbostel",
  "FF Heitlingen",
  "FF Stelingen",
  "RW Garbsen",
  "Stadtbrandmeister / ELW",
  "Rettungsdienst",
  "Polizei",
  "Stadtwerke / Energieversorger"
];

function loadUnitsOptions(){
  try {
    const raw = localStorage.getItem(UNITS_KEY);
    const arr = raw ? JSON.parse(raw) : defaultUnits;
    return Array.isArray(arr) && arr.length ? arr : defaultUnits;
  } catch { return defaultUnits; }
}
function saveUnitsOptions(list){ localStorage.setItem(UNITS_KEY, JSON.stringify(list)); }

function loadUnitsSelected(){
  try {
    const raw = localStorage.getItem(UNITS_SEL_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch { return []; }
}
function saveUnitsSelected(list){
  localStorage.setItem(UNITS_SEL_KEY, JSON.stringify(list));
  $('kraefte').value = list.join(', ');
  updatePreview();
}

function renderUnitsMenu(filter=''){
  let all = loadUnitsOptions();
  if (!Array.isArray(all) || all.length === 0) all = defaultUnits.slice(); // Fallback

  const needle = filter.trim().toLowerCase();
  const items = needle ? all.filter(v => v.toLowerCase().includes(needle)) : all.slice(0, 50);

  const selected = new Set(loadUnitsSelected());
  const html = items.map(v => `
    <li>
      <label>
        <input type="checkbox" value="${v.replace(/"/g,'&quot;')}" ${selected.has(v)?'checked':''}>
        <span>${v}</span>
      </label>
    </li>`).join('');

  const menu = $('units-menu');
  menu.innerHTML = html || `<li><label><span>Keine Treffer – mit ➕ neu anlegen</span></label></li>`;
  menu.hidden = false; // immer sichtbar machen
}


function renderUnitsChips(){
  const sel = loadUnitsSelected();
  $('units-chips').innerHTML = sel.map(v => `
    <span class="chip">
      ${v}
      <button type="button" data-unit="${v}" aria-label="${v} entfernen">×</button>
    </span>`).join('');
}

function addUnitOptionAndSelect(name){
  const val = (name || $('units-filter').value || '').trim();
  if(!val) return alert('Bitte eine Bezeichnung eingeben.');
  let opts = loadUnitsOptions();
  if(!opts.some(x => x.toLowerCase() === val.toLowerCase())){
    opts.push(val);
    opts = [...new Set(opts)].sort((a,b)=>a.localeCompare(b,'de'));
    saveUnitsOptions(opts);
  }
  let sel = loadUnitsSelected();
  if(!sel.includes(val)){
    sel.push(val);
    sel = [...new Set(sel)];
    saveUnitsSelected(sel);
  }
  $('units-filter').value = '';
  renderUnitsChips();
  renderUnitsMenu('');
}

function resetUnits(){
  if(!confirm('Einheiten-Liste auf Standard zurücksetzen?')) return;
  saveUnitsOptions(defaultUnits);
  saveUnitsSelected([]);
  renderUnitsChips();
  $('units-menu').hidden = true;
  $('kraefte').value = '';
  updatePreview();
}

$('units-chips').addEventListener('click', e=>{
  $('units-menu').hidden = false;
  $('units-filter').addEventListener('focus', ()=>{
  // kleiner Delay, weil manche Browser das DOM erst nach Fokus korrekt messen
  setTimeout(()=> renderUnitsMenu($('units-filter').value || ''), 0);
});

});
$('units-chips').addEventListener('click', e=>{
  const btn = e.target.closest('button[data-unit]');
  if(!btn) return;
  const unit = btn.getAttribute('data-unit');
  let sel = loadUnitsSelected().filter(v => v !== unit);
  saveUnitsSelected(sel);
  renderUnitsChips();
  const cb = [...$('units-menu').querySelectorAll('input[type="checkbox"]')].find(i => i.value === unit);
  if(cb) cb.checked = false;
});

$('units-filter').addEventListener('input', e=>{ renderUnitsMenu(e.target.value); });
$('units-filter').addEventListener('focus', ()=>{ renderUnitsMenu($('units-filter').value); });
$('units-filter').addEventListener('keydown', e=>{
  if(e.key === 'Enter'){ e.preventDefault(); addUnitOptionAndSelect(); }
  else if(e.key === 'Escape'){ $('units-menu').hidden = true; }
});
$('units-menu').addEventListener('change', e=>{
  const cb = e.target.closest('input[type="checkbox"]');
  if(!cb) return;
  let sel = loadUnitsSelected();
  if(cb.checked){ if(!sel.includes(cb.value)) sel.push(cb.value); }
  else { sel = sel.filter(v => v !== cb.value); }
  saveUnitsSelected(sel);
  renderUnitsChips();
});

// Initial render
renderUnitsChips();

/* ===========================
   Presse-Text Generator
   =========================== */
function buildText() {
  const d = $('datum').value || '—';
  const t = $('uhrzeit').value || '—';
  const ort = $('ort').value || '—';
  const stw = $('stichwort').value || '—';
  const lage = $('lage').value || '—';
  const beschr = $('beschreibung').value || '—';
  const selectedUnits = loadUnitsSelected();
  const kraefteText = selectedUnits.length ? selectedUnits.join(', ') : ($('kraefte').value || '—');
  const kname = $('kontaktName').value || '—';
  const kontakt = $('kontakt').value || '—';
  const foto = $('foto').value || '';

  return [
    `Pressemitteilung der Feuerwehr Meyenfeld`,
    ``,
    `Einsatz: ${stw}`,
    `Datum/Zeit: ${d} – ${t}`,
    `Einsatzort: ${ort}`,
    ``,
    `Gemeldete Lage: ${lage}`,
    ``,
    `Lage vor Ort & Maßnahmen:`,
    `${beschr}`,
    ``,
    `Kräfte vor Ort: ${kraefteText}`,
    foto ? `Fotohinweis: ${foto}` : ``,
    ``,
    `Ansprechpartner: ${kname} • ${kontakt}`
  ].filter(Boolean).join('\n');
}
function fillAutoText(){
  const jetzt = new Date();
  $('datum').value ||= jetzt.toISOString().slice(0,10);
  $('uhrzeit').value ||= jetzt.toTimeString().slice(0,5);
  if(!$('beschreibung').value){
    $('beschreibung').value = `Bei Eintreffen bestätigte sich die Lage...`;
  }
  if(!$('kraefte').value){
    $('kraefte').value = `FF Meyenfeld, weitere Ortsfeuerwehren, RW Garbsen, Rettungsdienst, Polizei`;
  }
  updatePreview();
}
function updatePreview(){ $('preview').value = buildText(); }

/* ===========================
   Draft speichern/laden
   =========================== */
function saveDraft(){
  const fields = ['datum','uhrzeit','ort','stichwort','lage','beschreibung','kraefte','kontaktName','kontakt','foto'];
  const data = {};
  fields.forEach(f => data[f] = $(f).value);
  localStorage.setItem('presseEntwurf', JSON.stringify(data));
  alert('Entwurf gespeichert.');
}
function loadDraft(){
  const raw = localStorage.getItem('presseEntwurf');
  if(!raw) return alert('Kein Entwurf gefunden.');
  const data = JSON.parse(raw);
  Object.entries(data).forEach(([k,v])=>{ if($(k)) $(k).value = v; });
  updatePreview();
}
function clearForm(){
  ['datum','uhrzeit','ort','stichwort','lage','beschreibung','kraefte','kontaktName','kontakt','foto'].forEach(id=>$(id).value='');
  localStorage.setItem(UNITS_SEL_KEY, JSON.stringify([]));
  renderUnitsChips();
  updatePreview();
}

/* ===========================
   PDF & Mail
   =========================== */
async function exportPDF(){
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit:'pt', format:'a4' });
  doc.setFont('helvetica','bold'); doc.setFontSize(16);
  doc.text('Pressemitteilung – Feuerwehr Meyenfeld', 40, 50);
  doc.setFont('helvetica','normal'); doc.setFontSize(11);
  const lines = doc.splitTextToSize(buildText(), 515);
  doc.text(lines, 40, 80);
  doc.save('Pressemitteilung.pdf');
}
function openMail(){
  const subject = encodeURIComponent('Pressemitteilung Feuerwehr Meyenfeld');
  const body = encodeURIComponent(buildText());
  window.location.href = `mailto:?subject=${subject}&body=${body}`;
}

/* ===========================
   Events
   =========================== */
['datum','uhrzeit','ort','stichwort','lage','beschreibung','kraefte','kontaktName','kontakt','foto']
  .forEach(id => $(id).addEventListener('input', updatePreview));
$('btn-vorschau').addEventListener('click', updatePreview);
$('btn-autotext').addEventListener('click', fillAutoText);
$('btn-save').addEventListener('click', saveDraft);
$('btn-load').addEventListener('click', loadDraft);
$('btn-clear').addEventListener('click', clearForm);
$('btn-pdf').addEventListener('click', exportPDF);
$('btn-mail').addEventListener('click', openMail);
$('btn-stichwort-add').addEventListener('click', addCurrentStichwort);
$('btn-stichwort-reset').addEventListener('click', resetStichwoerter);
renderStichwortDatalist();
updatePreview();
// --- Sicherstellen, dass das Menü initial Inhalt zeigt ---
renderUnitsMenu('');
$('units-menu').hidden = false;        // sichtbar
setTimeout(()=>{ $('units-menu').hidden = true; }, 0); // danach wieder zu – Nutzer öffnet dann selbst
