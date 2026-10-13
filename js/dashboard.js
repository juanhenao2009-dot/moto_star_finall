/* Panel principal: muestra un menú y vistas distintas según el perfil */
const session = requireAuth(['usuario', 'mecanico', 'admin']);

const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) || d; } catch (e) { return d; } };
const save = (k, v) => localStorage.setItem(k, JSON.stringify(v));
const pill = (txt, tipo) => `<span class="status-pill pill-${tipo}">${esc(txt)}</span>`;

/* ---------- DATOS DE EJEMPLO ---------- */
const ALERTAS = [
    { t: 'Presión de aceite irregular', c: 'P0521', e: 'Crítica', tipo: 'critical' },
    { t: 'Voltaje de batería bajo', c: 'P0562', e: 'Atención', tipo: 'warning' },
    { t: 'Temperatura estabilizada', c: 'SYS-04', e: 'Resuelta', tipo: 'success' }
];
const COLA = [
    { moto: 'AKT NKD 125 · ABC-123', sintoma: 'Humo blanco en el escape', urg: 'Alta', tipo: 'critical' },
    { moto: 'Pulsar NS 200 · XYZ-45F', sintoma: 'Chilla al frenar', urg: 'Alta', tipo: 'critical' },
    { moto: 'Yamaha MT-07 · KLM-88G', sintoma: 'Tiembla al acelerar', urg: 'Media', tipo: 'warning' }
];
const ORDENES_BASE = [
    { id: 101, moto: 'AKT NKD 125', trabajo: 'Cambio de aceite + filtro', estado: 'Pendiente' },
    { id: 102, moto: 'Pulsar NS 200', trabajo: 'Cambio de pastillas', estado: 'En proceso' },
    { id: 103, moto: 'Yamaha MT-07', trabajo: 'Tensión de cadena', estado: 'Completada' }
];
const STOCK = [
    { repuesto: 'Filtro de aceite', marca: 'Universal', stock: 24, precio: 18000 },
    { repuesto: 'Pastillas de freno', marca: 'Pulsar / AKT', stock: 3, precio: 35000 },
    { repuesto: 'Bujía NGK', marca: 'Multimarca', stock: 40, precio: 12000 },
    { repuesto: 'Kit de arrastre', marca: 'AKT', stock: 2, precio: 95000 }
];
/* Datos propios de cada usuario (moto, historial, citas) */
const cap = t => t.charAt(0).toUpperCase() + t.slice(1);
const motoKey = () => 'motostar_moto_' + session.email;
const histKey = () => 'motostar_hist_' + session.email;
const citasKey = () => 'motostar_citas_' + session.email;
const getMoto = () => load(motoKey(), null);
const getHist = () => load(histKey(), []);
const INTERVALO_ACEITE = 3000; // km entre cambios de aceite (valor de referencia)
const money = n => '$' + n.toLocaleString('es-CO');

/* ---------- VISTAS ---------- */
const VIEWS = {
    /* ===== USUARIO ===== */
    u_moto: (onboarding) => {
        const m = getMoto() || {};
        return `
        <h1>${onboarding ? '¡Empecemos! 🏍️' : 'Mi moto'}</h1>
        <p class="lead">${onboarding ? '¿Qué moto tienes? Guarda sus datos para llevar su historial y recibir diagnósticos a tu medida.' : 'Actualiza los datos de tu motocicleta.'}</p>
        <div class="panel" style="max-width:720px">
            <div class="row-form">
                <div class="form-group"><label>Marca *</label>
                    <input id="mMarca" class="form-input" list="marcas" placeholder="Ej: Yamaha, AKT, Honda..." value="${esc(m.marca || '')}">
                    <datalist id="marcas"><option>Yamaha</option><option>Honda</option><option>Suzuki</option><option>AKT</option><option>Bajaj</option><option>TVS</option><option>Hero</option><option>KTM</option><option>Kawasaki</option><option>Auteco</option><option>Kymco</option></datalist></div>
                <div class="form-group"><label>Modelo *</label><input id="mModelo" class="form-input" placeholder="Ej: MT-07, NKD 125, Pulsar NS 200" value="${esc(m.modelo || '')}"></div>
                <div class="form-group"><label>Año</label><input id="mAnio" type="number" class="form-input" placeholder="Ej: 2022" min="1970" max="2100" value="${esc(m.anio || '')}"></div>
                <div class="form-group"><label>Placa *</label><input id="mPlaca" class="form-input" placeholder="Ej: ABC12D" maxlength="7" style="text-transform:uppercase" value="${esc(m.placa || '')}"></div>
                <div class="form-group"><label>Kilometraje actual *</label><input id="mKm" type="number" min="0" class="form-input" placeholder="Ej: 18420" value="${esc(m.km ?? '')}"></div>
            </div>
            <p id="mMsg" style="font-weight:600;margin-bottom:.75rem"></p>
            <button class="btn-dark" onclick="guardarMoto(${onboarding ? 'true' : 'false'})"><i class="fa-solid fa-floppy-disk"></i> ${onboarding ? 'Guardar mi moto y continuar' : 'Guardar cambios'}</button>
        </div>`;
    },
    u_resumen: () => {
        const m = getMoto();
        if (!m) return VIEWS.u_moto(true);
        const hist = getHist().slice().sort((x, y) => y.fecha.localeCompare(x.fecha));
        const ultAceite = hist.filter(h => h.tipo === 'Cambio de aceite + filtro').sort((x, y) => y.km - x.km)[0];
        const proxAceite = ultAceite ? Math.max(0, ultAceite.km + INTERVALO_ACEITE - m.km) : null;
        return `
        <h1>Hola, ${esc(cap(session.nombre.split(' ')[0]))} 👋</h1><p class="lead">Resumen de tu motocicleta.</p>
        <div class="cards">
            <div class="card"><h4>Mi moto</h4><div class="big" style="font-size:1.3rem">${esc(m.marca)} ${esc(m.modelo)}</div><span style="color:var(--text-muted);font-size:.85rem">${m.anio ? 'Año ' + esc(m.anio) : ''}</span></div>
            <div class="card"><h4>Placa</h4><div class="big">${esc(m.placa)}</div></div>
            <div class="card"><h4>Kilometraje</h4><div class="big">${Number(m.km).toLocaleString('es-CO')} km</div></div>
            <div class="card"><h4>Próx. cambio de aceite</h4><div class="big">${proxAceite === null ? '—' : proxAceite.toLocaleString('es-CO') + ' km'}</div>
                <span style="color:var(--text-muted);font-size:.8rem">${proxAceite === null ? 'Registra tu primer cambio de aceite' : 'cada ' + INTERVALO_ACEITE.toLocaleString('es-CO') + ' km'}</span></div>
        </div>
        <div class="panel"><h3>Último mantenimiento</h3>
        ${hist.length ? `<table><tr><th>Fecha</th><th>Servicio</th><th>Kilometraje</th></tr>
            <tr><td>${esc(hist[0].fecha)}</td><td>${esc(hist[0].tipo)}</td><td>${Number(hist[0].km).toLocaleString('es-CO')} km</td></tr></table>`
          : '<p style="color:var(--text-muted)">Aún no has registrado mantenimientos. Ve a <b>Historial</b> para agregar el primero.</p>'}
        </div>
        <div style="display:flex;gap:.75rem;flex-wrap:wrap">
            <button class="btn-dark" onclick="setView('u_diagnostico')"><i class="fa-solid fa-stethoscope"></i> Diagnosticar una falla</button>
            <button class="btn-sm" onclick="setView('u_moto')">Editar datos de mi moto</button>
        </div>`;
    },
    u_diagnostico: () => `
        <h1>Diagnóstico</h1><p class="lead">Describe el síntoma de tu moto y recibe una recomendación.</p>
        <div class="panel">
            <div class="row-form">
                <div class="form-group"><label>Marca y modelo</label><input id="dMoto" class="form-input" placeholder="Ej: AKT NKD 125" value="${esc(getMoto() ? getMoto().marca + ' ' + getMoto().modelo : '')}"></div>
                <div class="form-group" style="grid-column: span 2"><label>Síntoma</label><textarea id="dSintoma" class="form-textarea" placeholder="Ej: me cuesta encender en frío..."></textarea></div>
            </div>
            <button class="btn-dark" onclick="correrDiagnostico()"><i class="fa-solid fa-magnifying-glass"></i> Analizar</button>
            <div class="result" id="dResult"></div>
        </div>`,
    u_historial: () => {
        if (!getMoto()) return VIEWS.u_moto(true);
        const hist = getHist().slice().sort((x, y) => y.fecha.localeCompare(x.fecha));
        const hoy = new Date().toISOString().slice(0, 10);
        return `<h1>Historial de mantenimiento</h1><p class="lead">Hoja de vida digital de tu motocicleta.</p>
        <div class="panel"><h3>Registrar mantenimiento</h3><div class="row-form">
            <div class="form-group"><label>Fecha</label><input type="date" id="hFecha" class="form-input" value="${hoy}"></div>
            <div class="form-group"><label>Kilometraje</label><input type="number" min="0" id="hKm" class="form-input" value="${esc(getMoto().km)}"></div>
            <div class="form-group"><label>Servicio</label><select id="hTipo" class="form-input">
                <option>Cambio de aceite + filtro</option><option>Revisión de frenos</option><option>Cambio de neumáticos</option><option>Kit de arrastre</option><option>Cambio de bujía</option><option>Servicio general</option><option>Otro</option></select></div>
            <div class="form-group"><label>Costo (COP)</label><input type="number" min="0" id="hCosto" class="form-input" placeholder="Opcional"></div>
            <div class="form-group" style="grid-column:1/-1"><label>Detalle</label><input id="hDetalle" class="form-input" placeholder="Opcional"></div>
        </div><p id="hMsg" style="font-weight:600;margin-bottom:.75rem;color:var(--danger)"></p>
        <button class="btn-dark" onclick="agregarMantenimiento()">Agregar al historial</button></div>
        <div class="panel"><h3>Registros</h3>
        ${hist.length ? `<table><tr><th>Fecha</th><th>Kilometraje</th><th>Servicio</th><th>Detalle</th><th>Costo</th><th></th></tr>
        ${hist.map(h => `<tr><td>${esc(h.fecha)}</td><td>${Number(h.km).toLocaleString('es-CO')} km</td><td>${esc(h.tipo)}</td><td>${esc(h.detalle || '-')}</td><td>${h.costo ? money(h.costo) : '-'}</td>
            <td><button class="btn-sm" onclick="borrarMantenimiento(${h.id})">Eliminar</button></td></tr>`).join('')}</table>`
          : '<p style="color:var(--text-muted)">Aún no hay registros. Agrega tu primer mantenimiento arriba.</p>'}</div>`;
    },
    u_citas: () => {
        const citas = load(citasKey(), []);
        return `<h1>Mis citas</h1><p class="lead">Agenda un servicio en el taller.</p>
        <div class="panel"><div class="row-form">
            <div class="form-group"><label>Fecha</label><input type="date" id="cFecha" class="form-input"></div>
            <div class="form-group"><label>Servicio</label><select id="cServicio" class="form-input">
                <option>Cambio de aceite + filtro</option><option>Revisión de frenos</option><option>Servicio general</option><option>Diagnóstico por falla</option></select></div>
            <div class="form-group"><label>Notas</label><input id="cNotas" class="form-input" placeholder="Opcional"></div>
        </div><button class="btn-dark" onclick="agendarCita()">Agendar cita</button></div>
        <div class="panel"><h3>Citas agendadas</h3>
        ${citas.length ? `<table><tr><th>Fecha</th><th>Servicio</th><th>Notas</th><th></th></tr>${citas.map((c, i) =>
            `<tr><td>${esc(c.fecha)}</td><td>${esc(c.servicio)}</td><td>${esc(c.notas || '-')}</td><td><button class="btn-sm" onclick="borrarCita(${i})">Cancelar</button></td></tr>`).join('')}</table>`
            : '<p style="color:var(--text-muted)">Aún no tienes citas.</p>'}</div>`;
    },

    /* ===== MECÁNICO ===== */
    m_cola: () => `
        <h1>Cola de diagnósticos</h1><p class="lead">Motos asignadas para inspección.</p>
        <div class="panel"><table><tr><th>Motocicleta</th><th>Síntoma reportado</th><th>Urgencia</th></tr>
        ${COLA.map(c => `<tr><td>${c.moto}</td><td>${c.sintoma}</td><td>${pill(c.urg, c.tipo)}</td></tr>`).join('')}</table></div>`,
    m_ordenes: () => {
        const ords = load('motostar_ordenes', ORDENES_BASE);
        const tipo = { 'Pendiente': 'warning', 'En proceso': 'info', 'Completada': 'success' };
        return `<h1>Órdenes de trabajo</h1><p class="lead">Avanza el estado de cada orden.</p>
        <div class="panel"><table><tr><th>#</th><th>Moto</th><th>Trabajo</th><th>Estado</th><th></th></tr>
        ${ords.map(o => `<tr><td>${o.id}</td><td>${o.moto}</td><td>${o.trabajo}</td><td>${pill(o.estado, tipo[o.estado])}</td>
            <td>${o.estado !== 'Completada' ? `<button class="btn-sm" onclick="avanzarOrden(${o.id})">Avanzar</button>` : ''}</td></tr>`).join('')}</table></div>`;
    },
    m_stock: () => `
        <h1>Stock de repuestos</h1><p class="lead">Disponibilidad para tus órdenes.</p>
        <div class="panel"><table><tr><th>Repuesto</th><th>Compatibilidad</th><th>Stock</th><th>Precio</th></tr>
        ${STOCK.map(s => `<tr><td>${s.repuesto}</td><td>${s.marca}</td><td class="${s.stock <= 3 ? 'low-stock' : ''}">${s.stock}${s.stock <= 3 ? ' (bajo)' : ''}</td><td>${money(s.precio)}</td></tr>`).join('')}</table></div>`,

    /* ===== ADMINISTRADOR ===== */
    a_usuarios: () => `
        <h1>Usuarios y roles</h1><p class="lead">Cuentas registradas en la plataforma.</p>
        <div class="panel"><h3>Crear cuenta (mecánico o administrador)</h3>
            <div class="row-form">
                <div class="form-group"><label>Nombre</label><input id="nNombre" class="form-input"></div>
                <div class="form-group"><label>Correo</label><input id="nEmail" type="email" class="form-input"></div>
                <div class="form-group"><label>Contraseña</label><input id="nPass" type="password" class="form-input" placeholder="Mínimo 6 caracteres"></div>
                <div class="form-group"><label>Rol</label><select id="nRol" class="form-input"><option value="mecanico">Mecánico</option><option value="admin">Administrador</option><option value="usuario">Usuario</option></select></div>
            </div>
            <button class="btn-dark" onclick="crearCuentaAdmin()">Crear cuenta</button>
            <p id="nMsg" style="margin-top:.75rem;font-weight:600"></p>
        </div>
        <div class="panel"><table><tr><th>Nombre</th><th>Correo</th><th>Rol</th></tr>
        ${getUsers().map(u => `<tr><td>${esc(u.nombre)}</td><td>${esc(u.email)}</td><td>${pill(ROLES[u.role], u.role === 'admin' ? 'critical' : u.role === 'mecanico' ? 'info' : 'success')}</td></tr>`).join('')}</table></div>`,
    a_reglas: () => `
        <h1>Reglas de diagnóstico</h1><p class="lead">Base de conocimiento del motor de diagnóstico.</p>
        <div class="panel"><table><tr><th>Síntoma clave</th><th>Causa probable</th><th>Urgencia</th></tr>
        ${REGLAS.map(r => `<tr><td>${r.sintomaClave}</td><td>${r.causa}</td><td>${pill(r.urgencia, r.nivel === 'alta' ? 'critical' : 'warning')}</td></tr>`).join('')}</table></div>`,
    a_metricas: () => {
        const barras = [['Frenos', 80], ['Lubricación', 65], ['Encendido', 50], ['Cadena / arrastre', 35]];
        return `<h1>Métricas del taller</h1><p class="lead">Rendimiento general y fallas más comunes.</p>
        <div class="cards">
            <div class="card"><h4>Diagnósticos (mes)</h4><div class="big">128</div></div>
            <div class="card"><h4>Órdenes completadas</h4><div class="big">74</div></div>
            <div class="card"><h4>Usuarios activos</h4><div class="big">${getUsers().length}</div></div>
        </div>
        <div class="panel"><h3>Fallas más comunes</h3>
        ${barras.map(b => `<div class="bar-row"><span>${b[0]}</span><div class="bar"><div style="width:${b[1]}%"></div></div><span>${b[1]}%</span></div>`).join('')}</div>`;
    }
};

const MENUS = {
    usuario:  [['u_resumen', 'fa-house', 'Resumen'], ['u_moto', 'fa-motorcycle', 'Mi moto'], ['u_diagnostico', 'fa-stethoscope', 'Diagnóstico'], ['u_historial', 'fa-clock-rotate-left', 'Historial'], ['u_citas', 'fa-calendar-check', 'Mis citas']],
    mecanico: [['m_cola', 'fa-list-check', 'Cola de diagnósticos'], ['m_ordenes', 'fa-screwdriver-wrench', 'Órdenes de trabajo'], ['m_stock', 'fa-boxes-stacked', 'Stock de repuestos']],
    admin:    [['a_usuarios', 'fa-users-gear', 'Usuarios y roles'], ['a_reglas', 'fa-sliders', 'Reglas de diagnóstico'], ['a_metricas', 'fa-chart-line', 'Métricas']]
};

/* ---------- ACCIONES ---------- */
function correrDiagnostico() {
    const s = document.getElementById('dSintoma').value.trim();
    if (!s) { alert('Describe el síntoma de tu moto.'); return; }
    const r = diagnosticar(s), c = COLORES_URGENCIA[r.nivel];
    const box = document.getElementById('dResult');
    box.style.display = 'block';
    box.innerHTML = `<strong>${esc(document.getElementById('dMoto').value || 'Mi motocicleta')}</strong>
        <span class="status-pill" style="background:${c.bg};color:${c.color};margin-left:.5rem">Urgencia: ${r.urgencia}</span>
        <h4 style="margin:.75rem 0 .4rem">${r.titulo}</h4>
        <p style="color:var(--text-muted);margin-bottom:.75rem">${r.cuerpo}</p>
        <div style="background:#f8fafc;padding:1rem;border-radius:10px;border-left:4px solid #84cc16"><strong>Solución recomendada:</strong>
        <p class="pre-line" style="color:var(--text-muted);margin-top:.25rem">${r.solucion}</p></div>`;
}
function agendarCita() {
    const fecha = document.getElementById('cFecha').value;
    if (!fecha) { alert('Selecciona una fecha.'); return; }
    const citas = load(citasKey(), []);
    citas.push({ fecha, servicio: document.getElementById('cServicio').value, notas: document.getElementById('cNotas').value });
    save(citasKey(), citas); setView('u_citas');
}
function guardarMoto(onboarding) {
    const marca = document.getElementById('mMarca').value.trim();
    const modelo = document.getElementById('mModelo').value.trim();
    const anio = document.getElementById('mAnio').value.trim();
    const placa = document.getElementById('mPlaca').value.trim().toUpperCase().replace(/[\s-]/g, '');
    const km = document.getElementById('mKm').value.trim();
    const msg = document.getElementById('mMsg'); msg.style.color = 'var(--danger)';
    if (!marca || !modelo) { msg.textContent = 'Escribe la marca y el modelo de tu moto.'; return; }
    if (!/^[A-Z]{3}\d{2,3}[A-Z]?$/.test(placa)) { msg.textContent = 'La placa no es válida (ej: ABC12D o ABC123).'; return; }
    if (km === '' || Number(km) < 0) { msg.textContent = 'Escribe el kilometraje actual de tu moto.'; return; }
    if (anio && (Number(anio) < 1970 || Number(anio) > new Date().getFullYear() + 1)) { msg.textContent = 'El año no es válido.'; return; }
    save(motoKey(), { marca, modelo, anio, placa, km: Number(km) });
    setView('u_resumen');
}
function agregarMantenimiento() {
    const fecha = document.getElementById('hFecha').value;
    const km = document.getElementById('hKm').value;
    const msg = document.getElementById('hMsg');
    if (!fecha || km === '') { msg.textContent = 'Indica la fecha y el kilometraje.'; return; }
    const hist = getHist();
    hist.push({ id: Date.now(), fecha, km: Number(km), tipo: document.getElementById('hTipo').value,
                detalle: document.getElementById('hDetalle').value.trim(), costo: Number(document.getElementById('hCosto').value) || 0 });
    save(histKey(), hist);
    const m = getMoto();
    if (Number(km) > m.km) { m.km = Number(km); save(motoKey(), m); }  // actualiza el kilometraje de la moto
    setView('u_historial');
}
function borrarMantenimiento(id) { save(histKey(), getHist().filter(h => h.id !== id)); setView('u_historial'); }
function crearCuentaAdmin() {
    const r = registerUser(document.getElementById('nNombre').value, document.getElementById('nEmail').value, '',
                           document.getElementById('nPass').value, document.getElementById('nRol').value);
    if (r.ok) { setView('a_usuarios'); const m = document.getElementById('nMsg'); m.style.color = 'var(--success)'; m.textContent = 'Cuenta creada correctamente.'; }
    else { const m = document.getElementById('nMsg'); m.style.color = 'var(--danger)'; m.textContent = r.error; }
}
function borrarCita(i) { const c = load(citasKey(), []); c.splice(i, 1); save(citasKey(), c); setView('u_citas'); }
function avanzarOrden(id) {
    const ords = load('motostar_ordenes', ORDENES_BASE);
    const o = ords.find(x => x.id === id);
    o.estado = o.estado === 'Pendiente' ? 'En proceso' : 'Completada';
    save('motostar_ordenes', ords); setView('m_ordenes');
}

/* ---------- NAVEGACIÓN ---------- */
function setView(id) {
    document.getElementById('view').innerHTML = id === 'u_moto' ? VIEWS.u_moto(!getMoto()) : VIEWS[id]();
    document.querySelectorAll('.menu button').forEach(b => b.classList.toggle('active', b.dataset.view === id));
}

if (session) {
    document.getElementById('userName').textContent = session.nombre;
    document.getElementById('userRole').textContent = ROLES[session.role];
    const menu = MENUS[session.role];
    document.getElementById('menu').innerHTML = menu.map(m =>
        `<button data-view="${m[0]}" onclick="setView('${m[0]}')"><i class="fa-solid ${m[1]}"></i> ${m[2]}</button>`).join('');
    setView(session.role === 'usuario' && !getMoto() ? 'u_moto' : menu[0][0]);
}
