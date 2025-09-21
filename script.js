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
  // Desktop-Fallback (optional)
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
  setTimeout(closeSuggest, 120); // Zeit für Klick
});
suggestEl.addEventListener('mousedown', (e)=>{
  const li = e.target.closest('li'); if(!li) return;
  pickValue(li.dataset.v);
});
$('stichwort').addEventListener('keydown', (e)=>{
  if(suggestEl.hidden) return;
  if(e.key === 'ArrowDown'){
    e.prevent
