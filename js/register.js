/* Lógica de la página de registro */
if (getSession()) window.location.href = 'dashboard.html';

document.getElementById('registerForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const err = document.getElementById('regError');
    const ok = document.getElementById('regOk');
    err.style.display = 'none'; ok.style.display = 'none';

    const pass = document.getElementById('password').value;
    if (pass !== document.getElementById('password2').value) {
        err.textContent = 'Las contraseñas no coinciden.'; err.style.display = 'block'; return;
    }
    // El registro público siempre crea perfil "usuario"
    const res = registerUser(
        document.getElementById('nombre').value,
        document.getElementById('email').value,
        document.getElementById('telefono').value,
        pass, 'usuario'
    );
    if (!res.ok) { err.textContent = res.error; err.style.display = 'block'; return; }

    startSession(res.user);
    ok.textContent = '¡Cuenta creada! Entrando a tu panel...'; ok.style.display = 'block';
    setTimeout(() => window.location.href = 'dashboard.html', 900);
});
