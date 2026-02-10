// js/auth.js

// Gestione token
const Auth = {
    setToken(token) {
        localStorage.setItem('token', token);
    },
    
    getToken() {
        return localStorage.getItem('token');
    },
    
    removeToken() {
        localStorage.removeItem('token');
    },
    
    setUser(user) {
        localStorage.setItem('user', JSON.stringify(user));
    },
    
    getUser() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },
    
    removeUser() {
        localStorage.removeItem('user');
    },
    
    isAuthenticated() {
        return !!this.getToken();
    },
    
    logout() {
        this.removeToken();
        this.removeUser();
        window.location.reload();
    },
    
    hasLevel(minLevel) {
        const user = this.getUser();
        return user && user.livello_accesso >= minLevel;
    },
    
    isBibliotecario() {
        return this.hasLevel(320);
    },
    
    isMaster() {
        return this.hasLevel(999);
    }
};

// Switch tra form login e registrazione
document.querySelectorAll('.auth-tab').forEach(tab => {
    tab.addEventListener('click', function() {
        const targetTab = this.dataset.tab;
        
        // Aggiorna tab attivi
        document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        
        // Mostra form corretto
        document.getElementById('login-form').style.display = targetTab === 'login' ? 'flex' : 'none';
        document.getElementById('register-form').style.display = targetTab === 'register' ? 'flex' : 'none';
        
        // Nascondi messaggi
        document.getElementById('auth-message').style.display = 'none';
    });
});

// Form Login
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const messageEl = document.getElementById('auth-message');
    
    try {
        const response = await fetch(CONFIG.ENDPOINTS.AUTH.LOGIN, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Errore durante il login');
        }
        
        // Salva token e user
        Auth.setToken(data.token);
        Auth.setUser(data.user);
        
        // Mostra app
        showApp();
        
    } catch (error) {
        messageEl.textContent = error.message;
        messageEl.className = 'message error';
    }
});

// Form Registrazione
document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const nome = document.getElementById('register-nome').value;
    const cognome = document.getElementById('register-cognome').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const tipo_utente = document.getElementById('register-tipo').value;
    const messageEl = document.getElementById('auth-message');
    
    try {
        const response = await fetch(CONFIG.ENDPOINTS.AUTH.REGISTER, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nome, cognome, email, password, tipo_utente })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Errore durante la registrazione');
        }
        
        messageEl.textContent = 'Registrazione completata! Effettua il login.';
        messageEl.className = 'message success';
        
        // Switch a login dopo 2 secondi
        setTimeout(() => {
            document.querySelector('[data-tab="login"]').click();
        }, 2000);
        
    } catch (error) {
        messageEl.textContent = error.message;
        messageEl.className = 'message error';
    }
});

// Logout
document.getElementById('logout-btn').addEventListener('click', () => {
    Auth.logout();
});

// Mostra app se già autenticato
function showApp() {
    const user = Auth.getUser();
    
    document.getElementById('auth-container').style.display = 'none';
    document.getElementById('app-container').style.display = 'block';
    document.getElementById('navbar').style.display = 'block';
    
    // Aggiorna UI con nome utente
    document.getElementById('user-name').textContent = `${user.nome} ${user.cognome}`;
    document.getElementById('nav-user').style.display = 'block';
    
    // Mostra link admin se ha privilegi
    if (Auth.hasLevel(320)) {
        document.getElementById('nav-admin').style.display = 'block';
    }
    
    // Carica pagina catalogo
    navigateToPage('catalogo');
}

// Check autenticazione all'avvio
if (Auth.isAuthenticated()) {
    showApp();
}
