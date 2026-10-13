/* =====================================================
   AUTENTICACIÓN DE MOTOSTAR (versión demostrativa)
   Los usuarios viven aquí solo para la demo. En el
   proyecto real esto debe validarse en el servidor
   (base de datos + contraseñas cifradas).
   ===================================================== */
const ROLES = { usuario: 'Usuario', mecanico: 'Mecánico', admin: 'Administrador' };

const BASE_USERS = [
    { nombre: 'Carlos Ramírez',   email: 'usuario@motostar.com',  password: 'usuario123',  role: 'usuario'  },
    { nombre: 'Andrés Torres',    email: 'mecanico@motostar.com', password: 'mecanico123', role: 'mecanico' },
    { nombre: 'Laura Gómez',      email: 'admin@motostar.com',    password: 'admin123',    role: 'admin'    }
];

const SESSION_KEY = 'motostar_session';
const USERS_KEY = 'motostar_users';   // cuentas creadas desde el registro

/* Cuentas de prueba + cuentas registradas */
function getUsers() {
    let extra = [];
    try { extra = JSON.parse(localStorage.getItem(USERS_KEY)) || []; } catch (e) {}
    return BASE_USERS.concat(extra);
}

/* Crea una cuenta nueva. Devuelve { ok:true, user } o { ok:false, error } */
function registerUser(nombre, email, telefono, password, role) {
    nombre = (nombre || '').trim();
    email = (email || '').trim().toLowerCase();
    telefono = (telefono || '').trim();
    if (nombre.length < 3) return { ok: false, error: 'Escribe tu nombre completo.' };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: 'El correo no es válido.' };
    if (telefono && !/^[0-9+\s-]{7,15}$/.test(telefono)) return { ok: false, error: 'El teléfono no es válido.' };
    if ((password || '').length < 6) return { ok: false, error: 'La contraseña debe tener mínimo 6 caracteres.' };
    if (getUsers().some(u => u.email === email)) return { ok: false, error: 'Ya existe una cuenta con ese correo.' };
    const user = { nombre, email, telefono, password, role: role || 'usuario' };
    const extra = getUsers().filter(u => !BASE_USERS.includes(u));
    extra.push(user);
    localStorage.setItem(USERS_KEY, JSON.stringify(extra));
    return { ok: true, user };
}

function startSession(user) {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ nombre: user.nombre, email: user.email, role: user.role }));
}

function getSession() {
    try { return JSON.parse(localStorage.getItem(SESSION_KEY)); }
    catch (e) { return null; }
}

/* Devuelve { ok:true, user } o { ok:false, error } */
function login(email, password, role) {
    email = (email || '').trim().toLowerCase();
    const user = getUsers().find(u => u.email === email && u.password === password);
    if (!user) return { ok: false, error: 'Correo o contraseña incorrectos.' };
    if (user.role !== role) {
        return { ok: false, error: 'Esas credenciales no pertenecen al perfil «' + ROLES[role] + '». Elige el perfil correcto.' };
    }
    startSession(user);
    return { ok: true, user };
}

function logout() {
    localStorage.removeItem(SESSION_KEY);
    window.location.href = 'login.html';
}

/* Protege una página: si no hay sesión (o el rol no está permitido) redirige al login */
function requireAuth(allowedRoles) {
    const s = getSession();
    if (!s || (allowedRoles && !allowedRoles.includes(s.role))) {
        window.location.href = 'login.html';
        return null;
    }
    return s;
}
