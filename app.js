/* =========================================================================
   GESTIÓN INTEGRAL DEL RIESGO — Ministerio del Deporte
   -------------------------------------------------------------------------
   CONFIGURACIÓN: pega aquí la URL de tu implementación de Google Apps
   Script (ver README.md, Paso 2). Mientras diga "PEGA_AQUI..." la app
   funciona en MODO DEMO: guarda los datos solo en este navegador.
   ========================================================================= */
const API_URL = "PEGA_AQUI_TU_URL_DE_APPS_SCRIPT";
const DEMO_MODE = !API_URL || API_URL.indexOf('PEGA_AQUI') !== -1;

/* ============================
   DATOS FIJOS DE LOS 18 PROCESOS
   (edítalos aquí si cambia un responsable o un nombre de proceso)
   ============================ */
const PROCESOS = [
  {id:1,nombre:"Direccionamiento Estratégico y Aprendizaje Organizacional",responsable:"Luz Karime",cargo:"Jefe de Planeación"},
  {id:2,nombre:"Gestión de Comunicaciones",responsable:"Ginna Ariza",cargo:"Jefe Oficina Jurídica"},
  {id:3,nombre:"Formulación y Adopción de Políticas, Planes y Programas",responsable:"Ferney Serrano",cargo:"Jefe de Comunicaciones"},
  {id:4,nombre:"Altos Logros",responsable:"Diana Rincon",cargo:"Jefe de Talento Humano"},
  {id:5,nombre:"Inspección, Vigilancia y Control",responsable:"Ferney Serrano",cargo:"Jefe Financiero"},
  {id:6,nombre:"Fomento al Desarrollo Humano y Social",responsable:"Ginna Ariza",cargo:"Jefe Gestión Documental"},
  {id:7,nombre:"Apoyo a la Infraestructura Técnica y Científica",responsable:"Diana Rincon",cargo:"Jefe de TI"},
  {id:8,nombre:"Servicio Integral al Ciudadano",responsable:"Luis Arias",cargo:"Jefe Infraestructura"},
  {id:9,nombre:"Gestión de TICs",responsable:"Luz Karime",cargo:"Directora de Fomento"},
  {id:10,nombre:"Gestión Documental",responsable:"Jorge Medina",cargo:"Director de Deporte"},
  {id:11,nombre:"Gestión del Talento Humano",responsable:"Patricia González",cargo:"Directora Alto Rendimiento"},
  {id:12,nombre:"Adquisición de Bienes y Servicios",responsable:"Ricardo Herrera",cargo:"Director Infraestructura"},
  {id:13,nombre:"Gestión Financiera",responsable:"Camila Ortiz",cargo:"Jefe de Control"},
  {id:14,nombre:"Gestión de los Recursos Físicos",responsable:"Julián Arce",cargo:"Jefe de Contratación"},
  {id:15,nombre:"Gestión Jurídica",responsable:"Valentina Ruiz",cargo:"Directora Internacionalización"},
  {id:16,nombre:"Evaluación Independiente y Mejora Continua",responsable:"Sebastián Mora",cargo:"Director Ciencia"},
  {id:17,nombre:"Gestión Proceso Disciplinario",responsable:"Isabel Cruz",cargo:"Directora Inclusión"},
  {id:18,nombre:"Gestión Ambiental",responsable:"Alejandro Ríos",cargo:"Jefe de Cooperación"}
];

const RIESGOS_EJEMPLO = [
  {id:1,procesoId:1,tipo:"Riesgo de Gestión",causa:"ausencia de indicadores de seguimiento",raiz:"debilidad en el sistema de monitoreo institucional",impacto:"Posibilidad de pérdida Reputacional",prob:0.4,imp:0.6,zona:"Moderado",control:"Comité de seguimiento trimestral",ctrlTipo:"Detectivo",tratamiento:"Reducir (mitigar)",kri:"N° de incumplimientos de metas/trimestre",kci:"% de comités realizados vs programados",consecuencias:"Incumplimiento de metas del plan estratégico",registradoPor:"Ejemplo"},
  {id:2,procesoId:5,tipo:"Riesgo Fiscal",causa:"errores en la ejecución presupuestal",raiz:"falta de capacitación en normativa presupuestal",impacto:"Posibilidad de efecto dañoso sobre el recurso público",prob:0.6,imp:0.8,zona:"Alto",control:"Revisión mensual de ejecución presupuestal",ctrlTipo:"Preventivo",tratamiento:"Reducir (mitigar)",kri:"% variación presupuestal no justificada",kci:"N° de revisiones ejecutadas/mes",consecuencias:"Hallazgos fiscales y disciplinarios",registradoPor:"Ejemplo"},
  {id:3,procesoId:7,tipo:"Riesgo de Seguridad Digital",causa:"ausencia de copias de seguridad",raiz:"falta de política de backup y recuperación",impacto:"Posibilidad de pérdida de disponibilidad",prob:0.6,imp:0.6,zona:"Moderado",control:"Protocolo de respaldo semanal",ctrlTipo:"Correctivo",tratamiento:"Reducir (mitigar)",kri:"N° de incidentes de pérdida de datos",kci:"% de backups exitosos/semana",consecuencias:"Pérdida de información crítica",registradoPor:"Ejemplo"},
  {id:4,procesoId:14,tipo:"Riesgo Fiscal",causa:"selección de oferentes sin análisis del mercado",raiz:"debilidad en los estudios previos de contratación",impacto:"Posibilidad de efecto dañoso sobre el recurso público",prob:0.8,imp:0.8,zona:"Extremo",control:"Revisión de estudios previos por comité",ctrlTipo:"Preventivo",tratamiento:"Reducir (mitigar)",kri:"N° de contratos con adiciones injustificadas",kci:"% de procesos con comité de revisión",consecuencias:"Detrimento patrimonial",registradoPor:"Ejemplo"},
  {id:5,procesoId:11,tipo:"Riesgo de Gestión",causa:"incumplimiento de metas de medallero",raiz:"falta de recursos para preparación de atletas",impacto:"Posibilidad de pérdida Reputacional",prob:0.4,imp:0.8,zona:"Alto",control:"Plan cuatrienal de alto rendimiento",ctrlTipo:"Preventivo",tratamiento:"Reducir (mitigar)",kri:"N° de atletas en preparación vs meta",kci:"% de ejecución del plan cuatrienal",consecuencias:"Impacto en imagen del Ministerio",registradoPor:"Ejemplo"}
];

let riesgos = [];
let nextId = 1;
let filterZona = 'todos';

/* ============================
   CONEXIÓN / CARGA DE DATOS
   ============================ */
function setConexionEstado(estado){
  const pill = document.getElementById('conn-pill');
  if(!pill) return;
  pill.classList.remove('conn-ok','conn-demo','conn-error');
  if(estado==='ok'){
    pill.classList.add('conn-ok');
    pill.innerHTML = '<span class="conn-dot"></span> Conectado a Google Sheets — los datos se comparten con todos los referentes';
  }else if(estado==='error'){
    pill.classList.add('conn-error');
    pill.innerHTML = '<span class="conn-dot"></span> No se pudo conectar con Google Sheets. Revisa la URL configurada en app.js';
  }else{
    pill.classList.add('conn-demo');
    pill.innerHTML = '<span class="conn-dot"></span> Modo demostración local — los datos solo se guardan en este navegador (ver README.md)';
  }
}

function normalizarRiesgo(r){
  return {
    id:r.id, procesoId:parseInt(r.procesoId), tipo:r.tipo||'', impacto:r.impacto||'',
    causa:r.causa||'', raiz:r.raiz||'', prob:parseFloat(r.prob), imp:parseFloat(r.imp),
    zona:r.zona||getZona(parseFloat(r.prob),parseFloat(r.imp)),
    control:r.control||'', ctrlTipo:r.ctrlTipo||'', tratamiento:r.tratamiento||'',
    kri:r.kri||'', kci:r.kci||'', consecuencias:r.consecuencias||'',
    registradoPor:r.registradoPor||'', fecha:r.fecha||''
  };
}

async function cargarRiesgos(){
  if(DEMO_MODE){
    setConexionEstado('demo');
    const guardado = localStorage.getItem('riesgos_demo_v1');
    riesgos = guardado ? JSON.parse(guardado) : RIESGOS_EJEMPLO.slice();
    nextId = riesgos.reduce((m,r)=>Math.max(m,r.id),0)+1;
    afterLoad();
    return;
  }
  try{
    const res = await fetch(API_URL);
    if(!res.ok) throw new Error('HTTP '+res.status);
    const data = await res.json();
    riesgos = (data.riesgos||[]).map(normalizarRiesgo);
    setConexionEstado('ok');
  }catch(err){
    console.error(err);
    setConexionEstado('error');
    riesgos = [];
  }
  afterLoad();
}

function afterLoad(){
  renderDashboard();
  populateProcesos();
  populateIdentificacion();
}

/* ============================
   NAVEGACIÓN ENTRE PANTALLAS
   ============================ */
function showScreen(name){
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
  document.getElementById('screen-'+name).classList.add('active');
  document.getElementById('nav-'+name).classList.add('active');

  const titles={
    dashboard:['Dashboard general','Ministerio del Deporte · Vigencia 2026'],
    identificacion:['Identificación del proceso','Información institucional del proceso'],
    procesos:['Procesos','18 procesos configurados'],
    mapa:['Mapa de calor','Análisis de riesgo inherente'],
    formulario:['Registrar riesgo','Guía DAFP V7'],
    riesgos:['Todos los riesgos','Gestión de riesgos identificados'],
    responsables:['Responsables','18 responsables asignados']
  };
  const t=titles[name]||['',''];
  document.getElementById('page-title').textContent=t[0];
  document.getElementById('page-sub').textContent=t[1];

  if(name==='dashboard')renderDashboard();
  if(name==='mapa')renderMapa();
  if(name==='riesgos')renderRiesgos();
  if(name==='procesos')renderProcesos();
  if(name==='responsables')renderResponsables();
  if(name==='formulario')populateProcesos();
}

/* ============================
   UTILIDADES DE RIESGO
   ============================ */
function getZona(p,i){
  const v=p*i;
  if(v>=0.64)return'Extremo';
  if(v>=0.32)return'Alto';
  if(v>=0.12)return'Moderado';
  return'Bajo';
}
function badgeZona(z){
  const map={Extremo:'badge-extremo',Alto:'badge-alto',Moderado:'badge-moderado',Bajo:'badge-bajo'};
  return`<span class="badge ${map[z]||'badge-pendiente'}">${z||'Sin zona'}</span>`;
}

/* ============================
   DASHBOARD
   ============================ */
function renderDashboard(){
  const total=riesgos.length;
  const criticos=riesgos.filter(r=>r.zona==='Extremo'||r.zona==='Alto').length;
  const procs=new Set(riesgos.map(r=>r.procesoId)).size;
  document.getElementById('stat-total').textContent=total;
  document.getElementById('stat-criticos').textContent=criticos;
  document.getElementById('stat-completados').textContent=procs;
  document.getElementById('stat-completados-pct').textContent=Math.round(procs/18*100)+'% del total';
  document.getElementById('stat-promedio').textContent=procs>0?(total/procs).toFixed(1):0;
  const tbody=document.getElementById('dashboard-tbody');
  tbody.innerHTML=PROCESOS.map(p=>{
    const pr=riesgos.filter(r=>r.procesoId===p.id);
    const max=pr.length===0?null:pr.reduce((a,b)=>{const ord=['Bajo','Moderado','Alto','Extremo'];return ord.indexOf(b.zona)>ord.indexOf(a.zona)?b:a}).zona;
    const pct=Math.min(100,pr.length*20);
    return`<tr>
      <td><div style="font-weight:500;font-size:12px">${p.nombre.length>40?p.nombre.slice(0,40)+'…':p.nombre}</div></td>
      <td style="color:var(--text-secondary)">${p.responsable}</td>
      <td><span style="font-weight:500">${pr.length}</span></td>
      <td>${max?badgeZona(max):'<span class="badge badge-pendiente">Sin datos</span>'}</td>
      <td><div style="display:flex;align-items:center;gap:6px"><div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div><span style="font-size:11px;color:var(--text-muted)">${pr.length}</span></div></td>
      <td>${pr.length>0?'<span class="badge badge-completado">Con riesgos</span>':'<span class="badge badge-pendiente">Pendiente</span>'}</td>
      <td><button class="action-btn" onclick="verProceso(${p.id})" title="Ver"><i class="ti ti-eye" style="font-size:15px"></i></button></td>
    </tr>`;
  }).join('');
}

function filterTable(q){
  const rows=document.querySelectorAll('#dashboard-tbody tr');
  rows.forEach(r=>{r.style.display=r.textContent.toLowerCase().includes(q.toLowerCase())?'':'none'});
}

/* ============================
   MAPA DE CALOR
   ============================ */
function renderMapa(){
  const labels_y=['Muy Alta','Alta','Media','Baja','Muy Baja'];
  const labels_x=['Leve','Menor','Moderado','Mayor','Catastrófico'];
  const probs=[1.0,0.8,0.6,0.4,0.2];
  const imps=[0.2,0.4,0.6,0.8,1.0];
  const grid=document.getElementById('heatmap-grid');
  grid.innerHTML='';
  const counts={};
  riesgos.forEach(r=>{
    const key=`${r.prob}_${r.imp}`;
    counts[key]=(counts[key]||[]); counts[key].push(r);
  });
  probs.forEach((p,pi)=>{
    const lbl=document.createElement('div');
    lbl.className='hm-label-y';
    lbl.textContent=labels_y[pi];
    grid.appendChild(lbl);
    imps.forEach((i)=>{
      const z=getZona(p,i);
      const key=`${p}_${i}`;
      const list=counts[key]||[];
      const cls={Extremo:'hm-extremo',Alto:'hm-alto',Moderado:'hm-moderado',Bajo:'hm-bajo'}[z];
      const cell=document.createElement('div');
      cell.className=`hm-cell ${cls}`;
      cell.innerHTML=list.length>0?`<span class="hm-count">${list.length}</span>`:'';
      if(list.length>0)cell.title=list.map(r=>`R${r.id}: ${r.causa}`).join('\n');
      grid.appendChild(cell);
    });
  });
  const empty=document.createElement('div');
  grid.appendChild(empty);
  labels_x.forEach(lx=>{
    const d=document.createElement('div');
    d.className='hm-label-x';
    d.textContent=lx;
    grid.appendChild(d);
  });
  const criticos=riesgos.filter(r=>r.zona==='Extremo'||r.zona==='Alto');
  document.getElementById('criticos-tbody').innerHTML=criticos.length===0?
    '<tr><td colspan="4"><div class="empty-state"><i class="ti ti-shield-check"></i>No hay riesgos críticos registrados aún</div></td></tr>':
    criticos.map(r=>{
      const p=PROCESOS.find(x=>x.id===r.procesoId);
      return`<tr><td>R${r.id}: ${r.causa.slice(0,50)}…</td><td style="color:var(--text-secondary)">${p?p.nombre.slice(0,35)+'…':''}</td><td>${badgeZona(r.zona)}</td><td style="color:var(--text-secondary)">${r.tratamiento}</td></tr>`;
    }).join('');
}

/* ============================
   TODOS LOS RIESGOS
   ============================ */
function renderRiesgos(){
  const list=filterZona==='todos'?riesgos:riesgos.filter(r=>r.zona===filterZona);
  document.getElementById('riesgos-tbody').innerHTML=list.length===0?
    '<tr><td colspan="8"><div class="empty-state"><i class="ti ti-list-check"></i>No hay riesgos en esta categoría aún</div></td></tr>':
    list.map(r=>{
      const p=PROCESOS.find(x=>x.id===r.procesoId);
      const desc=`POSIBILIDAD DE ${r.impacto} DEBIDO A ${r.causa}, ORIGINADO POR ${r.raiz}`;
      return`<tr>
        <td style="font-weight:500;color:var(--text-accent)">R${r.id}</td>
        <td style="color:var(--text-secondary);font-size:11px">${p?p.nombre.slice(0,30)+'…':''}</td>
        <td><span style="font-size:11px;color:var(--text-muted)">${r.tipo.replace('Riesgo de ','').replace('Riesgo ','')}</span></td>
        <td style="font-size:11px;max-width:180px">${desc.slice(0,80)}…</td>
        <td>${badgeZona(r.zona)}</td>
        <td style="font-size:11px">${r.tratamiento}</td>
        <td style="font-size:11px;color:var(--text-secondary)">${r.registradoPor||'—'}</td>
        <td><button class="action-btn" onclick="eliminarRiesgo(${r.id})" title="Eliminar"><i class="ti ti-trash" style="font-size:14px"></i></button></td>
      </tr>`;
    }).join('');
}

function filterRiesgos(zona,btn){
  filterZona=zona;
  document.querySelectorAll('#screen-riesgos .tab').forEach(t=>t.classList.remove('active'));
  btn.classList.add('active');
  renderRiesgos();
}

/* ============================
   PROCESOS
   ============================ */
function renderProcesos(){
  const conRiesgos=new Set(riesgos.map(r=>r.procesoId)).size;
  document.getElementById('stat-con-riesgos').textContent=conRiesgos;
  document.getElementById('stat-sin-riesgos').textContent=18-conRiesgos;
  document.getElementById('proceso-grid').innerHTML=PROCESOS.map(p=>{
    const pr=riesgos.filter(r=>r.procesoId===p.id);
    const max=pr.length?pr.reduce((a,b)=>{const o=['Bajo','Moderado','Alto','Extremo'];return o.indexOf(b.zona)>o.indexOf(a.zona)?b:a}).zona:null;
    return`<div class="proceso-card" onclick="verProceso(${p.id})">
      <div class="proceso-name">${p.nombre.length>45?p.nombre.slice(0,45)+'…':p.nombre}</div>
      <div class="proceso-meta">
        <i class="ti ti-user" style="font-size:12px"></i>${p.responsable}
      </div>
      <div style="margin-top:6px;display:flex;align-items:center;gap:6px">
        <span style="font-size:11px;color:var(--text-muted)">${pr.length} riesgo${pr.length!==1?'s':''}</span>
        ${max?badgeZona(max):''}
      </div>
    </div>`;
  }).join('');
}

function renderResponsables(){
  document.getElementById('resp-tbody').innerHTML=PROCESOS.map(p=>{
    const pr=riesgos.filter(r=>r.procesoId===p.id);
    return`<tr>
      <td style="font-size:12px">${p.nombre.length>45?p.nombre.slice(0,45)+'…':p.nombre}</td>
      <td><div style="font-weight:500;font-size:12px">${p.responsable}</div></td>
      <td style="color:var(--text-secondary);font-size:11px">${p.cargo}</td>
      <td><span style="font-weight:500">${pr.length}</span></td>
      <td>${pr.length>0?'<span class="badge badge-completado">Activo</span>':'<span class="badge badge-pendiente">Pendiente</span>'}</td>
    </tr>`;
  }).join('');
}

/* ============================
   FORMULARIO — REGISTRO DE RIESGO
   ============================ */
function populateProcesos(){
  const sel=document.getElementById('f-proceso');
  if(sel.options.length<=1){
    PROCESOS.forEach(p=>{
      const o=document.createElement('option');
      o.value=p.id;o.textContent=p.nombre;
      sel.appendChild(o);
    });
  }
  const selId=document.getElementById('id-proceso');
  if(selId && selId.options.length===0){
    PROCESOS.forEach(p=>{
      const o=document.createElement('option');
      o.value=p.id;o.textContent=p.nombre;
      selId.appendChild(o);
    });
  }
}

function updateFormMeta(){
  const pid=parseInt(document.getElementById('f-proceso').value);
  const p=PROCESOS.find(x=>x.id===pid);
  document.getElementById('f-responsable').value=p?p.responsable:'';
}

function buildDesc(){
  const imp=document.getElementById('f-impacto').value;
  const causa=document.getElementById('f-causa').value.trim();
  const raiz=document.getElementById('f-raiz').value.trim();
  const box=document.getElementById('f-desc-auto');
  if(!imp&&!causa&&!raiz){box.textContent='Complete los campos de arriba para generar la descripción automáticamente.';return;}
  const parts=[];
  parts.push(imp||'[área de impacto]');
  if(causa)parts.push('DEBIDO A '+causa);
  if(raiz)parts.push('ORIGINADO POR '+raiz);
  box.textContent=parts.join(' ');
}

function calcZona(){
  const p=parseFloat(document.getElementById('f-prob').value);
    const i=parseFloat(document.getElementById('f-imp-val').value);
    const box=document.getElementById('f-zona-display');
    if(!p || !i){
        box.innerHTML='<span style="color:var(--text-muted)">Seleccione probabilidad e impacto</span>';
        return;
    }
    const z=getZona(p,i);
    const score=(p*i).toFixed(2);
    box.innerHTML=
        `${badgeZona(z)}
        <span style="font-size:11px;color:var(--text-muted);margin-left:6px">
        Calificación: ${score}
        </span>`;
}

/* NUEVA FUNCIÓN */
function calcZonaResidual(){
    const p=parseFloat(
        document.getElementById('f-prob-res').value
    );
    const i=parseFloat(
        document.getElementById('f-imp-res').value
    );
    const box=document.getElementById(
        'f-zona-residual'
    );
    if(!p || !i){
        box.innerHTML=
        '<span style="color:var(--text-muted)">Seleccione probabilidad e impacto</span>';
        return;
    }
    const z=getZona(p,i);
    const score=(p*i).toFixed(2);
    box.innerHTML=
        `${badgeZona(z)}
        <span style="font-size:11px;color:var(--text-muted);margin-left:6px">
        Calificación: ${score}
        </span>`;
}

function checkTratamiento(){
  const tipo=document.getElementById('f-tipo').value;
  const trat=document.getElementById('f-tratamiento').value;
  const aviso=document.getElementById('f-aviso-fiscal');
  aviso.style.display=(tipo==='Riesgo Fiscal'&&trat==='Aceptar')?'block':'none';
}

async function guardarRiesgo(){
  const pid=parseInt(document.getElementById('f-proceso').value);
  const tipo=document.getElementById('f-tipo').value;
  const imp=document.getElementById('f-impacto').value;
  const causa=document.getElementById('f-causa').value.trim();
  const raiz=document.getElementById('f-raiz').value.trim();
  const prob=parseFloat(document.getElementById('f-prob').value);
  const impV=parseFloat(document.getElementById('f-imp-val').value);
  const trat=document.getElementById('f-tratamiento').value;
  const registradoPor=document.getElementById('f-registrado-por').value.trim();
  if(!pid||!tipo||!imp||!causa||!raiz||!prob||!impV||!trat||!registradoPor){
    showToast('Complete todos los campos obligatorios (*)',true);return;
  }
  const zona=getZona(prob,impV);
  const nuevo={
    procesoId:pid,tipo,impacto:imp,causa,raiz,
    prob,imp:impV,zona,
    control:document.getElementById('f-control').value,
    ctrlTipo:document.getElementById('f-ctrl-tipo').value,
    tratamiento:trat,
    kri:document.getElementById('f-kri').value,
    kci:document.getElementById('f-kci').value,
    consecuencias:document.getElementById('f-consecuencias').value,
    registradoPor,  
planActividad:
document.getElementById('f-plan-actividad').value,
planResponsable:
document.getElementById('f-plan-responsable').value,
planEstado:
document.getElementById('f-plan-estado').value,
planInicio:
document.getElementById('f-plan-inicio').value,
planFin:
document.getElementById('f-plan-fin').value,
planAvance:
document.getElementById('f-plan-avance').value,
  };
  const btn=document.getElementById('btn-guardar-riesgo');
  btn.disabled=true; btn.innerHTML='<i class="ti ti-loader-2"></i> Guardando...';
  try{
    if(DEMO_MODE){
      const id=nextId++;
      riesgos.push({id,...nuevo});
      localStorage.setItem('riesgos_demo_v1', JSON.stringify(riesgos));
    }else{
      const res=await fetch(API_URL,{
        method:'POST',
        headers:{'Content-Type':'text/plain;charset=utf-8'},
        body:JSON.stringify({accion:'crear',datos:nuevo})
      });
      const data=await res.json();
      if(!data.ok) throw new Error(data.error||'Error desconocido');
      await cargarRiesgos();
    }
    document.getElementById('f-aviso-guardado').style.display='block';
    showToast('Riesgo guardado correctamente');
    setTimeout(()=>{document.getElementById('f-aviso-guardado').style.display='none'},3000);
    resetForm();
  }catch(err){
    console.error(err);
    showToast('No se pudo guardar el riesgo. Verifica tu conexión e inténtalo de nuevo.', true);
  }finally{
    btn.disabled=false; btn.innerHTML='<i class="ti ti-device-floppy"></i> Guardar riesgo';
  }
}

function resetForm(){
  ['f-proceso','f-tipo','f-fuente','f-impacto','f-clasif','f-prob','f-imp-val','f-tratamiento','f-ctrl-tipo','f-ctrl-impl']
    .forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  ['f-causa','f-raiz','f-control','f-accion','f-kri','f-kci','f-consecuencias','f-resp-accion','f-registrado-por']
    .forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  document.getElementById('f-responsable').value='';
  document.getElementById('f-desc-auto').textContent='Complete los campos de arriba para generar la descripción automáticamente.';
  document.getElementById('f-zona-display').innerHTML='<span style="color:var(--text-muted)">Seleccione probabilidad e impacto</span>';
  document.getElementById('f-aviso-fiscal').style.display='none';
   'f-plan-actividad',
'f-plan-responsable',
'f-plan-inicio',
'f-plan-fin'
document.getElementById('f-plan-avance').value=0;
document.getElementById('avance-label').innerText='0%';
}

async function eliminarRiesgo(id){
  if(!confirm('¿Eliminar este riesgo? Esta acción no se puede deshacer.')) return;
  try{
    if(DEMO_MODE){
      riesgos=riesgos.filter(r=>r.id!==id);
      localStorage.setItem('riesgos_demo_v1', JSON.stringify(riesgos));
    }else{
      const res=await fetch(API_URL,{
        method:'POST',
        headers:{'Content-Type':'text/plain;charset=utf-8'},
        body:JSON.stringify({accion:'eliminar',id})
      });
      const data=await res.json();
      if(!data.ok) throw new Error(data.error||'Error desconocido');
      await cargarRiesgos();
    }
    renderRiesgos();
    renderDashboard();
    showToast('Riesgo eliminado');
  }catch(err){
    console.error(err);
    showToast('No se pudo eliminar el riesgo.', true);
  }
}

function verProceso(pid){
  showScreen('formulario');
  setTimeout(()=>{
    document.getElementById('f-proceso').value=pid;
    updateFormMeta();
  },100);
}

/* ============================
   IDENTIFICACIÓN DEL PROCESO
   (guardado local por ahora — ver README para conectarlo a Sheets)
   ============================ */
function populateIdentificacion(){
  cargarIdentificacion();
}
function cargarIdentificacion(){
  const pid=document.getElementById('id-proceso').value;
  if(!pid) return;
  const guardado=JSON.parse(localStorage.getItem('identificacion_'+pid)||'null');
  document.getElementById('id-objetivo').value=guardado?guardado.objetivo:'';
  document.getElementById('id-dependencia').value=guardado?guardado.dependencia:'';
  document.getElementById('id-lider').value=guardado?guardado.lider:'';
  document.getElementById('id-grupo').value=guardado?guardado.grupo:'';
  document.getElementById('id-tipo').value=guardado?guardado.tipo:'Estratégico';
}
function guardarIdentificacion(){
  const pid=document.getElementById('id-proceso').value;
  if(!pid){showToast('Selecciona un proceso primero',true);return;}
  const datos={
    tipo:document.getElementById('id-tipo').value,
    objetivo:document.getElementById('id-objetivo').value,
    dependencia:document.getElementById('id-dependencia').value,
    lider:document.getElementById('id-lider').value,
    grupo:document.getElementById('id-grupo').value
  };
  localStorage.setItem('identificacion_'+pid, JSON.stringify(datos));
  showToast('Ficha del proceso guardada en este navegador');
}

/* ============================
   TOAST
   ============================ */
function showToast(msg,err=false){
  const t=document.getElementById('toast');
  document.getElementById('toast-msg').textContent=msg;
  t.style.background=err?'var(--fill-danger)':'var(--fill-success)';
  t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'),3500);
}

/* ============================
   EXPORTAR A EXCEL (real, con SheetJS — funciona sin conexión)
   ============================ */
function exportExcel(){
  if(riesgos.length===0){showToast('No hay riesgos para exportar',true);return;}
  const filas=riesgos.map(r=>{
    const p=PROCESOS.find(x=>x.id===r.procesoId);
    return{
      'N°':'R'+r.id,
      'Proceso':p?p.nombre:'',
      'Responsable':p?p.responsable:'',
      'Tipo de riesgo':r.tipo,
      'Área de impacto':r.impacto,
      'Causa inmediata':r.causa,
      'Causa raíz':r.raiz,
      'Descripción':`POSIBILIDAD DE ${r.impacto} DEBIDO A ${r.causa}, ORIGINADO POR ${r.raiz}`,
      'Consecuencias':r.consecuencias,
      'Probabilidad':r.prob,
      'Impacto':r.imp,
      'Zona de riesgo':r.zona,
      'Control':r.control,
      'Tipo de control':r.ctrlTipo,
      'Tratamiento':r.tratamiento,
      'KRI':r.kri,
      'KCI':r.kci,
      'Registrado por':r.registradoPor||'',
      'Fecha':r.fecha||'',
'Actividad':r.planActividad,
'Responsable Acción':r.planResponsable,
'Estado Acción':r.planEstado,
'Fecha Inicio':r.planInicio,
'Fecha Fin':r.planFin,
'Avance %':r.planAvance,
    };
  });
  const ws=XLSX.utils.json_to_sheet(filas);
  const wb=XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb,ws,'Riesgos');
  XLSX.writeFile(wb,'Mapa_de_Riesgos_Mindeporte_'+new Date().toISOString().slice(0,10)+'.xlsx');
  showToast('Exportando '+riesgos.length+' riesgos a Excel…');
}

/* ============================
   INICIO
   ============================ */
cargarRiesgos();
