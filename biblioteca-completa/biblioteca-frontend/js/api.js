// js/api.js

const API = {
    // Helper per chiamate autenticate
    async fetch(url, options = {}) {
        const token = Auth.getToken();
        
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` })
            }
        };
        
        const mergedOptions = {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...options.headers
            }
        };
        
        try {
            const response = await fetch(url, mergedOptions);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Errore nella richiesta');
            }
            
            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },
    
    // Materiali
    async getMateriali(filters = {}) {
        const params = new URLSearchParams(filters);
        return this.fetch(`${CONFIG.ENDPOINTS.MATERIALI.LIST}?${params}`);
    },
    
    async getMateriale(id) {
        return this.fetch(CONFIG.ENDPOINTS.MATERIALI.DETAIL(id));
    },
    
    async createMateriale(data) {
        return this.fetch(CONFIG.ENDPOINTS.MATERIALI.CREATE, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },
    
    async updateMateriale(id, data) {
        return this.fetch(CONFIG.ENDPOINTS.MATERIALI.UPDATE(id), {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },
    
    async deleteMateriale(id) {
        return this.fetch(CONFIG.ENDPOINTS.MATERIALI.DELETE(id), {
            method: 'DELETE'
        });
    },
    
    // Prestiti
    async getMieiPrestiti() {
        return this.fetch(CONFIG.ENDPOINTS.PRESTITI.MIEI);
    },
    
    async getAllPrestiti(filters = {}) {
        const params = new URLSearchParams(filters);
        return this.fetch(`${CONFIG.ENDPOINTS.PRESTITI.LIST}?${params}`);
    },
    
    async createPrestito(data) {
        return this.fetch(CONFIG.ENDPOINTS.PRESTITI.CREATE, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },
    
    async confermaRitiro(id, codice_prenotazione) {
        return this.fetch(CONFIG.ENDPOINTS.PRESTITI.RITIRO(id), {
            method: 'PUT',
            body: JSON.stringify({ codice_prenotazione })
        });
    },
    
    async confermaRestituzione(id, codice_prenotazione) {
        return this.fetch(CONFIG.ENDPOINTS.PRESTITI.RESTITUZIONE(id), {
            method: 'PUT',
            body: JSON.stringify({ codice_prenotazione })
        });
    },
    
    async annullaPrestito(id) {
        return this.fetch(CONFIG.ENDPOINTS.PRESTITI.DELETE(id), {
            method: 'DELETE'
        });
    },
    
    // Utenti
    async getProfile() {
        return this.fetch(CONFIG.ENDPOINTS.UTENTI.ME);
    },
    
    async getClassi() {
        return this.fetch(CONFIG.ENDPOINTS.UTENTI.CLASSI);
    },
    
    async getStudentiClasse(id_classe) {
        return this.fetch(CONFIG.ENDPOINTS.UTENTI.STUDENTI_CLASSE(id_classe));
    },
    
    // Dispositivi
    async getDispositivi() {
        return this.fetch(CONFIG.ENDPOINTS.DISPOSITIVI.LIST);
    },
    
    async getLocation() {
        return this.fetch(CONFIG.ENDPOINTS.DISPOSITIVI.LOCATION);
    },
    
    async richediDispositivo(id, giorni_prestito) {
        return this.fetch(CONFIG.ENDPOINTS.DISPOSITIVI.RICHIEDI(id), {
            method: 'POST',
            body: JSON.stringify({ giorni_prestito })
        });
    },
    
    // Impegni
    async getImpegni(filters = {}) {
        const params = new URLSearchParams(filters);
        return this.fetch(`${CONFIG.ENDPOINTS.IMPEGNI.LIST}?${params}`);
    },
    
    async createImpegno(data) {
        return this.fetch(CONFIG.ENDPOINTS.IMPEGNI.CREATE, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },
    
    // Admin
    async getBlacklist() {
        return this.fetch(CONFIG.ENDPOINTS.ADMIN.BLACKLIST);
    },
    
    async rimuoviDaBlacklist(id_utente) {
        return this.fetch(CONFIG.ENDPOINTS.ADMIN.RIMUOVI_BLACKLIST(id_utente), {
            method: 'POST'
        });
    },
    
    async getStatistiche() {
        return this.fetch(CONFIG.ENDPOINTS.ADMIN.STATISTICHE);
    },
    
    async getAvvisi() {
        return this.fetch(CONFIG.ENDPOINTS.ADMIN.AVVISI);
    },
    
    async createAvviso(data) {
        return this.fetch(CONFIG.ENDPOINTS.ADMIN.AVVISI, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },
    
    async getImpostazioni() {
        return this.fetch(CONFIG.ENDPOINTS.ADMIN.IMPOSTAZIONI);
    },
    
    async updateImpostazione(chiave, valore) {
        return this.fetch(CONFIG.ENDPOINTS.ADMIN.UPDATE_IMPOSTAZIONE(chiave), {
            method: 'PUT',
            body: JSON.stringify({ valore })
        });
    }
};
