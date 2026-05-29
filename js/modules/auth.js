// Módulo de autenticación
const SESSION_KEY = 'nutri_session';

export const Auth = {
    login(nutriologo) {
        const session = {
            name: nutriologo,
            timestamp: new Date().toISOString()
        };
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    },
    
    logout() {
        sessionStorage.removeItem(SESSION_KEY);
        window.location.href = './index.html';
    },
    
    getCurrentUser() {
        const session = sessionStorage.getItem(SESSION_KEY);
        return session ? JSON.parse(session) : null;
    },
    
    isAuthenticated() {
        return this.getCurrentUser() !== null;
    },
    
    requireAuth() {
        if (!this.isAuthenticated()) {
            window.location.href = './index.html';
            return false;
        }
        return true;
    }
};