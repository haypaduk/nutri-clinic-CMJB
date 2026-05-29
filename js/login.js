import { Auth } from './modules/auth.js';

document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const nombre = document.getElementById('nombre').value.trim();
    
    if (nombre) {
        Auth.login(nombre);
        window.location.href = './dashboard.html';
    }
});

// Si ya está logueado, redirigir al dashboard
if (Auth.isAuthenticated()) {
    window.location.href = './dashboard.html';
}