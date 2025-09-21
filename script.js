const $ = id => document.getElementById(id);

/* ===========================
   Stichwort-Liste (dynamisch)
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

function saveStichwortOptions(list){
  localStorage.setItem(STW_KEY, JSON.stringify(list));
}

function renderStichwortDatalist(){
  const list = loadStichwortOptions();
  const dl = $('stichwort-list');
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
  const kraefte = $('kraefte').value || '—';
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
    `Kräfte vor Ort: ${kraefte}`,
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
    $('beschreibung').value =
`Bei Eintreffen bestätigte sich die Lage. Ein Trupp unter PA erkundete die betroffene Einheit und führte erste Maßnahmen durch. Die Einsatzstelle wurde abgesichert und der betroffene Bereich stromlos geschaltet. Nach Abschluss der Maßnahmen wurde die Einsatzstelle an die Polizei übergeben.`;
  }
  if(!$('kraefte').value){
    $('kraefte').value = `FF Meyenfeld, weitere Ortsfeuerwehren nach Alarmplan, Rüstwagen Garbsen, Rettungsdienst, Polizei`;
  }
  updatePreview();
}

function updatePreview(){
  $('preview').value = buildText();
}

/* ===========================
   Draft speichern/laden
   =========================== */
function saveDraft(){
  const fields = ['datum','uhrzeit','ort','stichwort','lage','beschreibung','kraefte','kontaktName','kontakt','foto'];
  const data = {};
  fields.forEach(f => data[f] = $(f).value);
  localStorage.setItem('presseEntwurf', JSON.stringify(data));
  alert('Entwurf gespeichert (lokal).');
}

function loadDraft(){
  const raw = localStorage.getItem('presseEntwurf');
  if(!raw) return alert('Kein Entwurf gefunden.');
  const data = JSON.parse(raw)
