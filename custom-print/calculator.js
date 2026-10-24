import { estimatePrint, fitsBuildVolume, measureMeshVolumeMm3 } from './calculator-core.js';

let THREE;
let STLLoader;
let OrbitControls;

let lang = document.documentElement.lang === 'ar' ? 'ar' : 'en';
const phone = '201063870873';
const maxBytes = 15 * 1024 * 1024;
const maxTriangles = 300000;
const baseCopies = {
  en: {
    choose: 'Choose an STL file', pick: 'Choose an STL file to begin', badType: 'Please choose an STL file.', tooLarge: 'This file is over the 15 MB limit.', reading: 'Reading your model locally…', parseFail: 'This STL could not be read. Check that it is a valid, non-empty STL file.', tooMany: 'This STL has too many triangles for a safe browser preview (limit: 300,000).', webglFail: 'Your browser could not create a 3D preview. Try a recent browser with WebGL enabled.', noVolume: 'Could not measure a closed mesh volume. The STL may be open or damaged; no price estimate was made.', loaded: 'Model loaded locally. Drag to rotate; use a wheel or pinch to zoom.', outOfBounds: 'This model is larger than the printer build volume in its current orientation.', ready: 'Estimate ready. Final grams and time need slicer confirmation.', waiting: 'Choose a model to calculate.', grams: 'Estimated filament', hours: 'Estimated print time', materialCost: 'Filament charge', machineCost: 'Machine charge', setup: 'Setup fee', profitMargin: 'Profit margin', total: 'Estimated total', dimensions: 'Size (mm)', volume: 'Mesh volume', triangles: 'Triangles', and: 'and', materialLabel: 'Material', unitLabel: 'Units', orderMessage: 'Hello PRINTFY 3D, I would like a quote for this custom STL print.', file: 'STL file', model: 'Model', build: 'Build volume', infill: 'Infill', estimate: 'Mesh-based estimate', attach: 'I will attach the STL file in this chat.', unitWarning: 'STL files do not contain units. Confirm the correct unit before using this estimate.', meshWarning: 'Estimate assumes a closed, non-self-intersecting mesh. Open or damaged files may be inaccurate.'
  },
  ar: {
    choose: 'اختر ملف STL', pick: 'اختر ملف STL لبدء المعاينة', badType: 'من فضلك اختر ملف STL.', tooLarge: 'حجم الملف أكبر من الحد المسموح، 15 ميجابايت.', reading: 'جارٍ قراءة المجسم على جهازك…', parseFail: 'تعذرت قراءة هذا الملف. تأكد أنه ملف STL صالح وغير فارغ.', tooMany: 'عدد المثلثات كبير جداً لمعاينة آمنة في المتصفح (الحد 300,000).', webglFail: 'تعذر إنشاء المعاينة ثلاثية الأبعاد. استخدم متصفحاً حديثاً مع تفعيل WebGL.', noVolume: 'تعذر قياس حجم مجسم مغلق. ربما الملف مفتوح أو تالف؛ لم يتم حساب سعر.', loaded: 'تم تحميل المجسم على جهازك. اسحب للتدوير واستخدم العجلة أو اللمس للتكبير.', outOfBounds: 'حجم هذا المجسم أكبر من مساحة الطباعة بالاتجاه الحالي.', ready: 'التقدير جاهز. يجب تأكيد الوزن والوقت ببرنامج التقطيع.', waiting: 'اختر مجسماً لحساب السعر.', grams: 'وزن الخامة التقديري', hours: 'وقت الطباعة التقديري', materialCost: 'تكلفة الخامة', machineCost: 'تكلفة تشغيل الطابعة', setup: 'رسوم التجهيز', profitMargin: 'هامش الربح', total: 'الإجمالي التقديري', dimensions: 'الأبعاد (مم)', volume: 'حجم المجسم', triangles: 'المثلثات', and: 'و', materialLabel: 'الخامة', unitLabel: 'الوحدات', orderMessage: 'مرحباً PRINTFY 3D، أريد عرض سعر لطباعة ملف STL مخصص.', file: 'ملف STL', model: 'المجسم', build: 'مساحة الطباعة', infill: 'نسبة الحشو', estimate: 'تقدير حسب حجم المجسم', attach: 'سأرفق ملف STL في هذه المحادثة.', unitWarning: 'ملفات STL لا تتضمن وحدات القياس. تأكد من الوحدة الصحيحة قبل استخدام التقدير.', meshWarning: 'يفترض التقدير أن المجسم مغلق وغير متقاطع. قد لا تكون الملفات المفتوحة أو التالفة دقيقة.'
  }
};
let baseCopy=baseCopies[lang];
let copy=baseCopy;
const UI_COPY = {"heading":{"en":"Upload and preview your STL","ar":"ارفع ملف STL واعرضه"},"lead":{"en":"Preview your model and get a quick EGP estimate. The file stays on your device.","ar":"عاين المجسم واحصل على تقدير سريع بالجنيه. يظل الملف على جهازك."},"chooseLabel":{"en":"Choose an STL file","ar":"اختر ملف STL"},"uploadHint":{"en":"STL only · up to 15 MB · stays on this device","ar":"ملف STL فقط · حتى 15 ميجابايت · يبقى على جهازك"},"initialStatus":{"en":"Your model preview will appear here after you choose a file.","ar":"ستظهر معاينة المجسم هنا بعد اختيار الملف."},"viewerEmpty":{"en":"Choose an STL file to begin","ar":"اختر ملف STL للبدء"},"settingsTitle":{"en":"Print settings","ar":"إعدادات الطباعة"},"materialLabel":{"en":"Material","ar":"الخامة"},"unitsLabel":{"en":"STL dimensions are in","ar":"وحدة أبعاد ملف STL"},"unitMm":{"en":"Millimeters (mm)","ar":"ملليمتر (مم)"},"unitCm":{"en":"Centimeters (cm)","ar":"سنتيمتر (سم)"},"unitIn":{"en":"Inches (in)","ar":"بوصة"},"infillPrefix":{"en":"Infill:","ar":"نسبة الحشو:"},"localHint":{"en":"The file stays in your browser. It is not uploaded to PRINTFY or a third party.","ar":"يبقى الملف في متصفحك ولا يتم رفعه إلى PRINTFY أو أي جهة أخرى."},"estimateEyebrow":{"en":"INSTANT ESTIMATE","ar":"تقدير فوري"},"continueWhatsapp":{"en":"Continue on WhatsApp","ar":"متابعة عبر واتساب"},"estimateFine":{"en":"Estimate only. We confirm the final price after checking your STL and slicer settings. Delivery is charged separately. Attach the STL file in WhatsApp after the chat opens.","ar":"تقدير مبدئي فقط. نؤكد السعر النهائي بعد مراجعة الملف وإعدادات التقطيع. رسوم التوصيل منفصلة. أرفق ملف STL في محادثة واتساب بعد فتحها."},"disclosureTitle":{"en":"How the estimate works","ar":"كيف يتم حساب التقدير"},"disclosureBody":{"en":"This is a mesh-based estimate, not a slicer quote. STL files do not store print settings or units. Choose the correct units and infill; this estimate uses the closed mesh volume and approximate material density. Open or damaged meshes may be inaccurate. Confirm final grams and time in a slicer before printing.","ar":"هذا تقدير مبني على حجم المجسم وليس عرض سعر من برنامج التقطيع. لا يحفظ ملف STL إعدادات الطباعة أو وحدات القياس. اختر الوحدات ونسبة الحشو الصحيحتين؛ يستخدم التقدير حجم المجسم المغلق وكثافة خامة تقريبية. قد لا تكون المجسمات المفتوحة أو التالفة دقيقة. يجب تأكيد الوزن والوقت ببرنامج التقطيع قبل الطباعة."},"supportTitle":{"en":"Need help?","ar":"هل تحتاج إلى مساعدة؟"},"supportBody":{"en":"Send your file and estimate to our team. We will check the model and confirm the price before printing.","ar":"أرسل الملف والتقدير لفريقنا. سنراجع المجسم ونؤكد السعر قبل الطباعة."},"customOrdersLink":{"en":"Read about custom orders","ar":"اقرأ عن الطلبات المخصصة"},"contactWhatsapp":{"en":"Contact PRINTFY 3D on WhatsApp","ar":"تواصل مع PRINTFY 3D عبر واتساب"}};
function applyInlineLanguage(){
  lang=document.documentElement.lang==='ar'?'ar':'en';
  baseCopy=baseCopies[lang];
  copy={...baseCopy,...Object.fromEntries(Object.entries(UI_COPY).map(([key,value])=>[key,value[lang]]))};
  document.querySelectorAll('.stl-calculator-inline [data-calc-copy]').forEach(element=>{const value=copy[element.dataset.calcCopy];if(value)element.textContent=value;});
  document.querySelectorAll('.stl-calculator-inline').forEach(element=>{element.lang=lang;element.dir=lang==='ar'?'rtl':'ltr';});
  if(languageLink) languageLink.href=lang==='ar'?'/custom-print/':'/ar/custom-print/';
  if(measured){showFacts(measured);updateEstimate();say(copy.loaded,'success');} else {say(copy.pick);sayEstimate(copy.waiting);}
}
const $ = (id) => document.getElementById(id);
const fileInput = $('stlFile');
const viewer = $('viewer');
const stateText = $('fileStatus');
const estimateStatus = $('estimateStatus');
const materialSelect = $('material');
const unitsSelect = $('units');
const infill = $('infill');
const button = $('orderButton');
const languageLink = $('languageLink');
if (languageLink) languageLink.href = lang === 'ar' ? '/custom-print/' : '/ar/custom-print/';
document.documentElement.lang = lang === 'ar' ? 'ar' : 'en';
document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
try { localStorage.setItem('printify3d_lang', lang); } catch (_) {}

let config;
let renderer;
let scene;
let camera;
let controls;
let currentMesh;
let originalGeometry;
let currentFile;
let measured;
let animationFrame = 0;
let resizeObserver;

const say = (message, kind = '') => {
  stateText.textContent = message;
  stateText.className = `status ${kind}`.trim();
};
const sayEstimate = (message, kind = '') => {
  estimateStatus.textContent = message;
  estimateStatus.className = `status ${kind}`.trim();
};
const money = value => `${Math.ceil(value).toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-EG')} EGP`;
const fixed = (value, digits = 1) => Number(value).toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-EG', { maximumFractionDigits: digits });
const unitScale = () => ({ mm: 1, cm: 10, in: 25.4 })[unitsSelect.value] || 1;

function initViewer() {
  try {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xfbfaf8);
    camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100000);
    camera.up.set(0, 0, 1);
    camera.position.set(170, 170, 190);
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'low-power' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.setAttribute('aria-label', lang === 'ar' ? 'معاينة تفاعلية ثلاثية الأبعاد، اسحب للتدوير واستخدم العجلة للتكبير' : 'Interactive 3D preview. Drag to rotate and scroll to zoom.');
    renderer.domElement.setAttribute('role', 'application');
    renderer.domElement.tabIndex = 0;
    viewer.replaceChildren(renderer.domElement);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x77675b, 2));
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.4);
    keyLight.position.set(120, 180, 160);
    scene.add(keyLight);
    const grid = new THREE.GridHelper(256, 16, 0xd3c6bb, 0xe9e2dc);
    grid.rotation.x = Math.PI / 2;
    grid.position.z = -0.01;
    scene.add(grid);
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = .08;
    controls.minDistance = 10;
    controls.maxDistance = 5000;
    const resize = () => {
      const width = Math.max(1, viewer.clientWidth);
      const height = Math.max(1, viewer.clientHeight);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(viewer);
    resize();
    let renderPending = false;
    const draw = () => {
      renderPending = false;
      if (!renderer || !controls) return;
      const stillMoving = controls.update();
      renderer.render(scene, camera);
      if (stillMoving) animationFrame = requestAnimationFrame(draw);
    };
    const requestDraw = () => {
      if (renderPending) return;
      renderPending = true;
      animationFrame = requestAnimationFrame(draw);
    };
    controls.addEventListener('change', requestDraw);
    requestDraw();
  } catch (error) {
    viewer.replaceChildren(Object.assign(document.createElement('div'), { className: 'viewer-empty', textContent: copy.webglFail }));
    throw error;
  }
}

function showFacts(info) {
  const box = $('modelFacts');
  box.hidden = false;
  box.innerHTML = '';
  const rows = [
    [copy.dimensions, `${fixed(info.x)} × ${fixed(info.y)} × ${fixed(info.z)}`],
    [copy.volume, `${fixed(info.volumeCm3)} cm³`],
    [copy.triangles, fixed(info.triangles, 0)]
  ];
  for (const [label, value] of rows) {
    const item = document.createElement('div'); item.className = 'fact';
    const span = document.createElement('span'); span.textContent = label;
    const strong = document.createElement('strong'); strong.textContent = value;
    item.append(span, strong); box.append(item);
  }
}

function renderModel() {
  if (!originalGeometry || !config) return;
  if (currentMesh) { scene.remove(currentMesh); currentMesh.geometry.dispose(); currentMesh.material.dispose(); currentMesh = null; }
  const scale = unitScale();
  const geometry = originalGeometry.clone();
  geometry.scale(scale, scale, scale);
  geometry.computeBoundingBox();
  geometry.computeVertexNormals();
  const size = geometry.boundingBox.getSize(new THREE.Vector3());
  let volumeMm3;
  try { volumeMm3 = measureMeshVolumeMm3(originalGeometry.getAttribute('position'), scale); }
  catch { say(copy.noVolume, 'error'); resetEstimate(); return; }
  const boundsVol = size.x * size.y * size.z;
  const volumeCm3 = volumeMm3 / 1000;
  const triangles = geometry.getAttribute('position').count / 3;
  if (![size.x, size.y, size.z, volumeCm3].every(Number.isFinite) || volumeCm3 <= 0 || boundsVol <= 0 || volumeMm3 > boundsVol * 1.02) {
    say(copy.noVolume, 'error');
    resetEstimate();
    return;
  }
  measured = { x: size.x, y: size.y, z: size.z, volumeCm3, triangles };
  const center = geometry.boundingBox.getCenter(new THREE.Vector3());
  geometry.translate(-center.x, -center.y, -center.z);
  const material = new THREE.MeshStandardMaterial({ color: 0xd96b45, roughness: .6, metalness: 0 });
  currentMesh = new THREE.Mesh(geometry, material);
  scene.add(currentMesh);
  const maxDim = Math.max(size.x, size.y, size.z);
  camera.position.set(maxDim * 1.45, maxDim * 1.25, maxDim * 1.55);
  camera.near = Math.max(.1, maxDim / 1000);
  camera.far = maxDim * 100;
  camera.updateProjectionMatrix();
  controls.target.set(0, 0, 0); controls.update();
  showFacts(measured);
  say(copy.loaded, 'success');
  updateEstimate();
}

function resetEstimate() {
  measured = null;
  $('estimatePrice').textContent = '— EGP';
  $('estimateBreakdown').hidden = true;
  button.disabled = true;
}

function updateEstimate() {
  if (!measured || !config) { sayEstimate(copy.waiting); return; }
  const max = config.buildVolumeMm;
  const fits = fitsBuildVolume(measured, max);
  const material = config.materials.find(item => item.id === materialSelect.value) || config.materials[0];
  const estimate = estimatePrint({ volumeCm3: measured.volumeCm3, densityGPerCm3: material.densityGPerCm3, infillPercent: infill.value, shellAllowance: config.estimate.shellAllowance, supportAllowance: config.estimate.supportAllowance, flowMm3PerSecond: config.estimate.effectiveFlowMm3PerSecond, filamentEgpPerGram: config.pricing.filamentEgpPerGram, machineEgpPerHour: config.pricing.machineEgpPerHour, setupFeeEgp: config.pricing.setupFeeEgp, profitMarginPercent: config.pricing.profitMarginPercent });
  $('estimatePrice').textContent = money(estimate.total);
  const lines = [
    [copy.grams, `${fixed(estimate.grams, 1)} g`], [copy.hours, `${fixed(estimate.hours, 2)} h`],
    [copy.materialCost, money(estimate.filamentCharge)], [copy.machineCost, money(estimate.machineCharge)],
    [copy.setup, money(estimate.setupFee)],
    [copy.profitMargin, `${estimate.profitMarginPercent}% · ${money(estimate.profitCharge)}`]
  ];
  const list = $('estimateBreakdown'); list.innerHTML = '';
  for (const [label, value] of lines) { const dt = document.createElement('dt'); dt.textContent = label; const dd = document.createElement('dd'); dd.textContent = value; list.append(dt, dd); }
  list.hidden = false;
  button.disabled = false;
  sayEstimate(fits ? copy.ready : copy.outOfBounds, fits ? 'success' : 'error');
  measured.fits = fits;
  measured.grams = estimate.grams;
  measured.hours = estimate.hours;
  measured.total = estimate.total;
}

function orderOnWhatsApp() {
  if (!measured || !currentFile || !config) return;
  const size = `${fixed(measured.x)} × ${fixed(measured.y)} × ${fixed(measured.z)} mm`;
  const material = materialSelect.options[materialSelect.selectedIndex].text;
  const message = [copy.orderMessage, `${copy.file}: ${currentFile.name}`, `${copy.dimensions}: ${size}`, `${copy.materialLabel}: ${material}`, `${copy.infill}: ${infill.value}%`, `${copy.estimate}: ${money(measured.total)}`, `${copy.profitMargin}: ${config.pricing.profitMarginPercent}%`, `${copy.grams}: ${fixed(measured.grams)} g`, `${copy.hours}: ${fixed(measured.hours, 2)} h`, `${copy.build}: ${config.printer} (${config.buildVolumeMm.x} × ${config.buildVolumeMm.y} × ${config.buildVolumeMm.z} mm)`, copy.attach].join('\n');
  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
}

async function readFile(file) {
  resetEstimate();
  if (!file) return;
  if (!/\.stl$/i.test(file.name)) { say(copy.badType, 'error'); return; }
  if (file.size > maxBytes) { say(copy.tooLarge, 'error'); return; }
  currentFile = file;
  say(copy.reading);
  $('modelFacts').hidden = true;
  if (currentMesh) { scene.remove(currentMesh); currentMesh.geometry.dispose(); currentMesh.material.dispose(); currentMesh = null; }
  try {
    const data = await file.arrayBuffer();
    const geometry = new STLLoader().parse(data);
    const position = geometry.getAttribute('position');
    if (!position || position.count < 3 || position.count % 3 !== 0 || !Number.isFinite(position.count)) throw new Error('invalid triangle data');
    if (position.count / 3 > maxTriangles) { geometry.dispose(); say(copy.tooMany, 'error'); currentFile = null; return; }
    for (let i = 0; i < position.count; i += 256) {
      if (!Number.isFinite(position.getX(i)) || !Number.isFinite(position.getY(i)) || !Number.isFinite(position.getZ(i))) throw new Error('non-finite vertex');
    }
    geometry.computeBoundingBox();
    if (!geometry.boundingBox || !geometry.boundingBox.getSize(new THREE.Vector3()).toArray().every(Number.isFinite)) throw new Error('invalid bounds');
    if (originalGeometry) originalGeometry.dispose();
    originalGeometry = geometry;
    renderModel();
  } catch (error) {
    console.warn('STL could not be parsed:', error);
    currentFile = null;
    say(copy.parseFail, 'error');
    resetEstimate();
  }
}

async function start() {
  try {
    [THREE, { STLLoader }, { OrbitControls }] = await Promise.all([
      import('three'), import('three/addons/loaders/STLLoader.js'), import('three/addons/controls/OrbitControls.js')
    ]);
    const response = await fetch('/assets/print-estimator-config.json', { cache: 'no-cache' });
    if (!response.ok) throw new Error(`Config request failed (${response.status})`);
    config = await response.json();
    infill.value = config.estimate.defaultInfillPercent;
    $('infillValue').value = `${infill.value}%`;
    initViewer();
  } catch (error) {
    console.error(error);
    say(copy.webglFail, 'error');
  }
}

applyInlineLanguage();
$('langToggle')?.addEventListener('click',()=>setTimeout(applyInlineLanguage,0));
fileInput.addEventListener('change',event=>readFile(event.currentTarget.files?.[0]));
materialSelect.addEventListener('change', updateEstimate);
unitsSelect.addEventListener('change', renderModel);
infill.addEventListener('input', () => { $('infillValue').value = `${infill.value}%`; updateEstimate(); });
button.addEventListener('click', orderOnWhatsApp);
window.addEventListener('pagehide', () => {
  cancelAnimationFrame(animationFrame);
  resizeObserver?.disconnect();
  controls?.dispose();
  renderer?.dispose();
  originalGeometry?.dispose();
  currentMesh?.geometry.dispose();
  currentMesh?.material.dispose();
});
start();

