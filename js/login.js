/* Lógica de la página de inicio de sesión */

// Si ya está logueado, ir directo al panel
if (getSession()) window.location.href = 'dashboard.html';

let rolSeleccionado = 'usuario';
const DEMO = {
    usuario:  { email: 'usuario@motostar.com',  password: 'usuario123'  },
    mecanico: { email: 'mecanico@motostar.com', password: 'mecanico123' },
    admin:    { email: 'admin@motostar.com',    password: 'admin123'    }
};

function seleccionarRol(rol) {
    rolSeleccionado = rol;
    document.querySelectorAll('.role-tab').forEach(t => t.classList.toggle('active', t.dataset.role === rol));
    document.getElementById('loginError').style.display = 'none';
    document.getElementById('demoRol').textContent = ROLES[rol];
}

function llenarDemo() {
    document.getElementById('email').value = DEMO[rolSeleccionado].email;
    document.getElementById('password').value = DEMO[rolSeleccionado].password;
}

document.getElementById('loginForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const res = login(document.getElementById('email').value, document.getElementById('password').value, rolSeleccionado);
    const err = document.getElementById('loginError');
    if (!res.ok) { err.textContent = res.error; err.style.display = 'block'; return; }
    window.location.href = 'dashboard.html';
});

seleccionarRol('usuario');
