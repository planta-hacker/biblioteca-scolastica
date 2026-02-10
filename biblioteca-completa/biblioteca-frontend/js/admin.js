// js/admin.js

let currentAdminSection = 'materiali';

// Carica sezione admin
async function loadAdminSection(section) {
    if (!Auth.hasLevel(320)) {
        alert('Accesso negato');
        return;
    }
    
    currentAdminSection = section;
    const content = document.getElementById('admin-content');
    content.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
    
    try {
        switch (section) {
            case 'materiali':
                await loadGestioneMateriali(content);
                break;
            case 'blacklist':
                await loadBlacklist(content);
                break;
            case 'statistiche':
                await loadStatistiche(content);
                break;
            case 'impostazioni':
                await loadImpostazioni(content);
                break;
            case 'avvisi':
                await loadAvvisi(content);
                break;
        }
    } catch (error) {
        content.innerHTML = `<p style="color:red;">Errore: ${error.message}</p>`;
    }
}

// Gestione Materiali
async function loadGestioneMateriali(content) {
    content.innerHTML = `
        <div class="table-container">
            <button class="btn-primary" onclick="mostraFormNuovoMateriale()" style="margin-bottom: 20px;">
                + Nuovo Materiale
            </button>
            
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Titolo</th>
                        <th>Tipo</th>
                        <th>Autori</th>
                        <th>Copie</th>
                        <th>Azioni</th>
                    </tr>
                </thead>
                <tbody id="materiali-tbody">
                    <tr><td colspan="6">Caricamento...</td></tr>
                </tbody>
            </table>
        </div>
    `;
    
    const materiali = await API.getMateriali();
    const tbody = document.getElementById('materiali-tbody');
    
    tbody.innerHTML = materiali.map(m => `
        <tr>
            <td>${m.id_materiale}</td>
            <td>${m.titolo}</td>
            <td>${m.tipo_materiale}</td>
            <td>${m.autori || 'N/D'}</td>
            <td>${m.copie_disponibili}/${m.copie_totali}</td>
            <td>
                <button class="btn-primary" onclick="modificaMateriale(${m.id_materiale})" style="margin-right: 5px;">
                    Modifica
                </button>
                <button class="btn-danger" onclick="eliminaMateriale(${m.id_materiale})">
                    Elimina
                </button>
            </td>
        </tr>
    `).join('');
}

function mostraFormNuovoMateriale() {
    // Mostra form in modal o crea UI inline
    alert('Funzionalità form nuovo materiale: da implementare con UI dedicata');
}

async function eliminaMateriale(id) {
    if (!confirm('Sei sicuro di voler eliminare questo materiale?')) return;
    
    try {
        await API.deleteMateriale(id);
        alert('Materiale eliminato');
        loadAdminSection('materiali');
    } catch (error) {
        alert('Errore: ' + error.message);
    }
}

// Blacklist
async function loadBlacklist(content) {
    const blacklist = await API.getBlacklist();
    
    content.innerHTML = `
        <div class="table-container">
            <h3>Utenti in Blacklist</h3>
            <table>
                <thead>
                    <tr>
                        <th>Nome</th>
                        <th>Email</th>
                        <th>Motivo</th>
                        <th>Data Fine</th>
                        <th>Azioni</th>
                    </tr>
                </thead>
                <tbody>
                    ${blacklist.length === 0 ? 
                        '<tr><td colspan="5" style="text-align:center;">Nessun utente in blacklist</td></tr>' :
                        blacklist.map(u => `
                            <tr>
                                <td>${u.nome} ${u.cognome}</td>
                                <td>${u.email}</td>
                                <td>${u.motivo || 'N/D'}</td>
                                <td>${new Date(u.data_fine_blacklist).toLocaleDateString('it-IT')}</td>
                                <td>
                                    <button class="btn-success" onclick="rimuoviDaBlacklist(${u.id_utente})">
                                        Rimuovi
                                    </button>
                                </td>
                            </tr>
                        `).join('')
                    }
                </tbody>
            </table>
        </div>
    `;
}

async function rimuoviDaBlacklist(id_utente) {
    if (!confirm('Rimuovere utente dalla blacklist?')) return;
    
    try {
        await API.rimuoviDaBlacklist(id_utente);
        alert('Utente rimosso dalla blacklist');
        loadAdminSection('blacklist');
    } catch (error) {
        alert('Errore: ' + error.message);
    }
}

// Statistiche
async function loadStatistiche(content) {
    const stats = await API.getStatistiche();
    
    content.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
            <div class="profilo-card">
                <h3>📚 Materiali Totali</h3>
                ${stats.totali_materiali.map(t => `
                    <div class="profilo-info-row">
                        <span class="profilo-label">${t.tipo_materiale}</span>
                        <span class="profilo-value">${t.totale}</span>
                    </div>
                `).join('')}
            </div>
            
            <div class="profilo-card">
                <h3>📊 Prestiti Attivi</h3>
                <p style="font-size: 48px; text-align: center; color: var(--primary-color); margin: 20px 0;">
                    ${stats.prestiti_attivi}
                </p>
            </div>
            
            <div class="profilo-card">
                <h3>👥 Utenti Registrati</h3>
                ${stats.utenti_registrati.map(u => `
                    <div class="profilo-info-row">
                        <span class="profilo-label">${u.tipo_utente}</span>
                        <span class="profilo-value">${u.totale}</span>
                    </div>
                `).join('')}
            </div>
        </div>
        
        <div class="profilo-card" style="margin-top: 20px;">
            <h3>🔥 Materiali Più Richiesti (ultimi 6 mesi)</h3>
            <table>
                <thead>
                    <tr>
                        <th>Titolo</th>
                        <th>Tipo</th>
                        <th>Prestiti</th>
                    </tr>
                </thead>
                <tbody>
                    ${stats.materiali_popolari.map(m => `
                        <tr>
                            <td>${m.titolo}</td>
                            <td>${m.tipo_materiale}</td>
                            <td>${m.num_prestiti}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// Impostazioni
async function loadImpostazioni(content) {
    const impostazioni = await API.getImpostazioni();
    
    content.innerHTML = `
        <div class="profilo-card">
            <h3>⚙️ Impostazioni Sistema</h3>
            ${impostazioni.map(i => `
                <div class="form-group" style="margin-bottom: 20px;">
                    <label><strong>${i.descrizione}</strong></label>
                    <input type="${i.tipo_dato === 'int' ? 'number' : 'text'}" 
                           id="imp-${i.chiave}" 
                           value="${i.valore}" 
                           class="filter-input">
                    <button class="btn-primary" onclick="aggiornaImpostazione('${i.chiave}')">
                        Salva
                    </button>
                </div>
            `).join('')}
        </div>
    `;
}

async function aggiornaImpostazione(chiave) {
    const valore = document.getElementById(`imp-${chiave}`).value;
    
    try {
        await API.updateImpostazione(chiave, valore);
        alert('Impostazione aggiornata');
    } catch (error) {
        alert('Errore: ' + error.message);
    }
}

// Avvisi
async function loadAvvisi(content) {
    const avvisi = await API.getAvvisi();
    
    content.innerHTML = `
        <button class="btn-primary" onclick="mostraFormNuovoAvviso()" style="margin-bottom: 20px;">
            + Nuovo Avviso
        </button>
        
        <div style="display: flex; flex-direction: column; gap: 15px;">
            ${avvisi.length === 0 ? 
                '<p>Nessun avviso attivo</p>' :
                avvisi.map(a => `
                    <div class="impegno-card">
                        <span class="badge badge-${a.priorita === 'alta' ? 'danger' : a.priorita === 'media' ? 'warning' : 'success'}">
                            ${a.priorita.toUpperCase()}
                        </span>
                        <h3>${a.titolo}</h3>
                        <p>${a.messaggio}</p>
                        <p style="font-size: 12px; color: var(--text-light); margin-top: 10px;">
                            Pubblicato il ${new Date(a.data_pubblicazione).toLocaleDateString('it-IT')}
                        </p>
                    </div>
                `).join('')
            }
        </div>
    `;
}

function mostraFormNuovoAvviso() {
    const modal = document.getElementById('modal-prenota');
    const content = document.getElementById('modal-prenota-content');
    
    modal.querySelector('h2').textContent = 'Nuovo Avviso';
    modal.style.display = 'flex';
    
    content.innerHTML = `
        <div class="form-group">
            <label>Titolo</label>
            <input type="text" id="avviso-titolo">
        </div>
        <div class="form-group">
            <label>Messaggio</label>
            <textarea id="avviso-messaggio" rows="4"></textarea>
        </div>
        <div class="form-group">
            <label>Priorità</label>
            <select id="avviso-priorita">
                <option value="bassa">Bassa</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
            </select>
        </div>
        <button class="btn-primary btn-block" onclick="pubblicaAvviso()">Pubblica</button>
    `;
}

async function pubblicaAvviso() {
    const data = {
        titolo: document.getElementById('avviso-titolo').value,
        messaggio: document.getElementById('avviso-messaggio').value,
        priorita: document.getElementById('avviso-priorita').value
    };
    
    try {
        await API.createAvviso(data);
        alert('Avviso pubblicato');
        document.getElementById('modal-prenota').style.display = 'none';
        loadAdminSection('avvisi');
    } catch (error) {
        alert('Errore: ' + error.message);
    }
}

// Tab admin
document.querySelectorAll('.admin-tab').forEach(tab => {
    tab.addEventListener('click', function() {
        document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        
        const section = this.dataset.section;
        loadAdminSection(section);
    });
});
