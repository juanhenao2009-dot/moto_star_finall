/* Lógica de la página principal */

// Si ya hay sesión, el botón de la barra lleva directo al panel
(function () {
    const s = getSession();
    const btn = document.getElementById('btnAcceso');
    if (s && btn) {
        btn.textContent = 'IR AL PANEL';
        btn.href = 'dashboard.html';
    }
})();

// --- Canvas de telemetría ---
const canvas = document.getElementById('telemetryCanvas');
const ctx = canvas.getContext('2d');
let step = 0;
function resizeCanvas() { canvas.width = canvas.parentElement.clientWidth; canvas.height = 100; }
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function drawTelemetry() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 20) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
    }
    ctx.beginPath(); ctx.strokeStyle = '#a3e635'; ctx.lineWidth = 2;
    for (let x = 0; x < canvas.width; x++) {
        const y = canvas.height / 2 + Math.sin((x + step) * 0.03) * 15 + Math.cos((x + step) * 0.01) * 8;
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.beginPath(); ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 1.5;
    for (let x = 0; x < canvas.width; x++) {
        const y = canvas.height / 2 + Math.cos((x - step * 1.5) * 0.02) * 20;
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
    step += 2;
    requestAnimationFrame(drawTelemetry);
}
drawTelemetry();

// --- Asistente de diagnóstico ---
function analizarSintoma() {
    const modelo = document.getElementById('motoModel').value.trim();
    const sintoma = document.getElementById('symptomDesc').value.trim();
    if (!sintoma) { alert('Por favor escribe la descripción de la falla o síntoma de la motocicleta.'); return; }

    const r = diagnosticar(sintoma);
    const c = COLORES_URGENCIA[r.nivel];
    document.getElementById('resMotoName').innerText = modelo || 'Motocicleta Registrada';
    const u = document.getElementById('resUrgencia');
    u.innerText = 'Urgencia: ' + r.urgencia; u.style.color = c.color; u.style.backgroundColor = c.bg;
    document.getElementById('resDiagnosticoTitle').innerText = r.titulo;
    document.getElementById('resDiagnosticoBody').innerText = r.cuerpo;
    document.getElementById('resSolucion').innerText = r.solucion;

    const box = document.getElementById('diagResultBox');
    box.style.display = 'block';
    if (modelo) document.getElementById('dashMotoTitle').innerText = modelo;
    box.scrollIntoView({ behavior: 'smooth' });
}

// --- Filtro del historial de alertas ---
let currentFilter = 'ALL';
function toggleFiltroAlertas() {
    const btn = document.getElementById('btnFilter');
    const items = document.querySelectorAll('#alertsContainer .alert-item');
    currentFilter = currentFilter === 'ALL' ? 'CRITICAL' : 'ALL';
    btn.innerText = currentFilter === 'ALL' ? 'TODAS' : 'SÓLO CRÍTICAS';
    items.forEach(i => {
        i.style.display = (currentFilter === 'ALL' || i.dataset.type === 'critical') ? 'flex' : 'none';
    });
}
