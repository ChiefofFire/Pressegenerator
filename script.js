const $ = id => document.getElementById(id);

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

  // --------- Stichwort-Liste (dynamisch + persistent) ----------
const STW_KEY = 'stichwortOptions_v1';

// sinnvolle Standard-Stichwörter
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
  if(exists) {
    alert('Dieses Stichwort ist bereits in der Liste.');
    return;
  }
  list.push(val);
  // optional: sortieren, eigene Einträge nach oben
  list = [...new Set(list)].sort((a,b)=>a.localeCompare(b,'de'));
  saveStichwortOptions(list);
  renderStichwortDatalist();
  alert('Stichwort gespeichert.');
}

function resetStichwoerter(){
  if(!confirm('Liste auf Standard zurücksetzen? (Nur diese Gerät)')) return;
  saveStichwortOptions(defaultStichwoerter);
  renderStichwortDatalist();
  alert('Liste zurückgesetzt.');
}


  return [
    `Pressemitteilung der Feuerwehr Garbsen`,
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
`Bei Eintreffen bestätigte sich die Lage. Ein Trupp unter PA erkundete die betroffene Einheit und führte erste Maßnahmen durch. Die Einsatzstelle wurde abgesichert und die betroffene Bereich stromlos geschaltet. Nach Abschluss der Maßnahmen wurde die Einsatzstelle an die Polizei übergeben.`;
  }
  if(!$('kraefte').value){
    $('kraefte').value = `FF Meyenfeld, weitere Ortsfeuerwehren nach Alarmplan, Rüstwagen Garbsen, Rettungsdienst, Polizei`;
  }
  updatePreview();
}

function updatePreview(){
  $('preview').value = buildText();
}

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
  const data = JSON.parse(raw);
  Object.entries(data).forEach(([k,v]) => { if($(k)) $(k).value = v; });
  updatePreview();
}

function clearForm(){
  ['datum','uhrzeit','ort','stichwort','lage','beschreibung','kraefte','kontaktName','kontakt','foto']
    .forEach(id => $(id).value = '');
  updatePreview();
}

async function exportPDF(){
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit:'pt', format:'a4' });

  const title = 'Pressemitteilung – Feuerwehr Garbsen';
  doc.setFont('helvetica','bold'); doc.setFontSize(16);
  doc.text(title, 40, 50);

  doc.setFont('helvetica','normal'); doc.setFontSize(11);
  const text = buildText();
  const lines = doc.splitTextToSize(text, 515);
  doc.text(lines, 40, 80);

  // Footer
  const ts = new Date().toLocaleString();
  doc.setFontSize(9);
  doc.text(`Generiert am ${ts}`, 40, 800);

  doc.save(`Pressemitteilung_${new Date().toISOString().slice(0,10)}.pdf`);
}

function openMail(){
  const subject = encodeURIComponent('Pressemitteilung Feuerwehr Garbsen');
  const body = encodeURIComponent(buildText());
  window.location.href = `mailto:?subject=${subject}&body=${body}`;
}

// Event bindings
['datum','uhrzeit','ort','stichwort','lage','beschreibung','kraefte','kontaktName','kontakt','foto']
  .forEach(id => $(id).addEventListener('input', updatePreview));

$('btn-vorschau').addEventListener('click', updatePreview);
$('btn-autotext').addEventListener('click', fillAutoText);
$('btn-save').addEventListener('click', saveDraft);
$('btn-load').addEventListener('click', loadDraft);
$('btn-clear').addEventListener('click', clearForm);
$('btn-pdf').addEventListener('click', exportPDF);
$('btn-mail').addEventListener('click', openMail);

// Init
updatePreview();
