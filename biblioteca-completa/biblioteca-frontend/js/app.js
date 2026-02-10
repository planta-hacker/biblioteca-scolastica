// js/app.js

// Gestione navigazione tra pagine
function navigateToPage(pageName) {
    // Nascondi tutte le pagine
    document.querySelectorAll('.page').forEach(page => {
        page.style.display = 'none';
    });
    
    // Mostra pagina selezionata
    const targetPage = document.getElementById(`page-${pageName}`);
    if (targetPage) {
        targetPage.style.display = 'block';
        
        // Carica contenuto specifico della pagina
        loadPageContent(pageName);
    }
}

// Carica contenuto pagina
function loadPageContent(pageName) {
    switch (pageName) {
        case 'catalogo':
            loadCatalogo();
            break;
        case 'prestiti':
            loadMieiPrestiti('prenotato');
            break;
        case 'dispositivi':
            loadDispositivi();
            break;
        case 'impegni':
            loadImpegni();
            break;
        case 'admin':
            if (Auth.hasLevel(320)) {
                loadAdminSection('materiali');
            }
            break;
        case 'profilo':
            loadProfilo();
            break;
    }
}

// Carica dispositivi
async function loadDispositivi() {
    const grid = document.getElementById('dispositivi-grid');
    grid.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
    
    try {
        const dispositivi = await API.getDispositivi();
        
        if (dispositivi.length === 0) {
            grid.innerHTML = '<p>Nessun dispositivo disponibile</p>';
            return;
        }
        
        grid.innerHTML = dispositivi.map(d => `
            <div class="dispositivo-card">
                <h3>🖥️ ${d.nome}</h3>
                <div class="dispositivo-meta">
                    <p><strong>Tipo:</strong> ${d.tipo || 'N/D'}</p>
                    <p><strong>Codice:</strong> ${d.codice_identificativo || 'N/D'}</p>
                    <p><strong>Location:</strong> ${d.location_nome || 'N/D'}</p>
                </div>
                <div style="margin-bottom: 15px;">
                    ${d.disponibile ? 
                        '<span class="badge badge-success">Disponibile</span>' :
                        '<span class="badge badge-danger">Non Disponibile</span>'
                    }
                </div>
                ${d.disponibile ? 
                    `<button class="btn-primary" onclick="richediDispositivo(${d.id_dispositivo})">
                        Richiedi
                    </button>` :
                    `<button class="btn-secondary" disabled>Non Disponibile</button>`
                }
            </div>
        `).join('');
    } catch (error) {
        grid.innerHTML = `<p style="color:red;">Errore: ${error.message}</p>`;
    }
}

// Richiedi dispositivo
async function richediDispositivo(id_dispositivo) {
    const giorni = prompt('Per quanti giorni vuoi il dispositivo? (default: 7)', '7');
    if (!giorni) return;
    
    try {
        await API.richediDispositivo(id_dispositivo, parseInt(giorni));
        alert('Dispositivo richiesto con successo!');
        loadDispositivi();
    } catch (error) {
        alert('Errore: ' + error.message);
    }
}

// Carica impegni
async function loadImpegni() {
    const list = document.getElementById('impegni-list');
    list.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
    
    // Mostra bottone nuovo impegno se docente o admin
    const user = Auth.getUser();
    if (user.tipo_utente === 'docente' || Auth.hasLevel(320)) {
        document.getElementById('btn-nuovo-impegno').style.display = 'block';
    }
    
    try {
        const impegni = await API.getImpegni();
        
        if (impegni.length === 0) {
            list.innerHTML = '<p style="text-align:center;">Nessun impegno programmato</p>';
            return;
        }
        
        list.innerHTML = impegni.map(i => {
            const dataInizio = new Date(i.data_inizio).toLocaleString('it-IT');
            const dataFine = i.data_fine ? 
                new Date(i.data_fine).toLocaleString('it-IT') : 'Non specificata';
            
            return `
                <div class="impegno-card">
                    <span class="badge badge-${i.tipo_impegno === 'open_day' ? 'success' : 'warning'}">
                        ${i.tipo_impegno.replace('_', ' ').toUpperCase()}
                    </span>
                    <h3>${i.titolo}</h3>
                    <div class="impegno-date">
                        <p>📅 ${dataInizio} - ${dataFine}</p>
                    </div>
                    ${i.descrizione ? `<p>${i.descrizione}</p>` : ''}
                    ${i.docente_nome ? 
                        `<p style="font-size: 12px; color: var(--text-light); margin-top: 10px;">
                            Organizzato da: ${i.docente_nome} ${i.docente_cognome}
                        </p>` : ''
                    }
                </div>
            `;
        }).join('');
    } catch (error) {
        list.innerHTML = `<p style="color:red;">Errore: ${error.message}</p>`;
    }
}

// Nuovo impegno
document.getElementById('btn-nuovo-impegno')?.addEventListener('click', () => {
    const modal = document.getElementById('modal-prenota');
    const content = document.getElementById('modal-prenota-content');
    
    modal.querySelector('h2').textContent = 'Nuovo Impegno';
    modal.style.display = 'flex';
    
    content.innerHTML = `
        <div class="form-group">
            <label>Titolo</label>
            <input type="text" id="impegno-titolo">
        </div>
        <div class="form-group">
            <label>Descrizione</label>
            <textarea id="impegno-descrizione" rows="3"></textarea>
        </div>
        <div class="form-group">
            <label>Data Inizio</label>
            <input type="datetime-local" id="impegno-data-inizio">
        </div>
        <div class="form-group">
            <label>Data Fine</label>
            <input type="datetime-local" id="impegno-data-fine">
        </div>
        <div class="form-group">
            <label>Tipo</label>
            <select id="impegno-tipo">
                <option value="open_day">Open Day</option>
                <option value="collegio_docenti">Collegio Docenti</option>
                <option value="riunione">Riunione</option>
                <option value="evento">Evento</option>
                <option value="altro">Altro</option>
            </select>
        </div>
        <div class="form-group">
            <label>Visibile a</label>
            <select id="impegno-visibile">
                <option value="tutti">Tutti</option>
                <option value="docenti">Solo Docenti</option>
                <option value="specifico">Solo Me</option>
            </select>
        </div>
        <button class="btn-primary btn-block" onclick="creaImpegno()">Crea Impegno</button>
    `;
});

async function creaImpegno() {
    const data = {
        titolo: document.getElementById('impegno-titolo').value,
        descrizione: document.getElementById('impegno-descrizione').value,
        data_inizio: document.getElementById('impegno-data-inizio').value,
        data_fine: document.getElementById('impegno-data-fine').value,
        tipo_impegno: document.getElementById('impegno-tipo').value,
        visibile_a: document.getElementById('impegno-visibile').value
    };
    
    try {
        await API.createImpegno(data);
        alert('Impegno creato con successo');
        document.getElementById('modal-prenota').style.display = 'none';
        loadImpegni();
    } catch (error) {
        alert('Errore: ' + error.message);
    }
}

// Carica profilo
async function loadProfilo() {
    const container = document.getElementById('profilo-info');
    container.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
    
    try {
        const user = await API.getProfile();
        
        container.innerHTML = `
            <h3>Informazioni Personali</h3>
            <div class="profilo-info-row">
                <span class="profilo-label">Nome</span>
                <span class="profilo-value">${user.nome} ${user.cognome}</span>
            </div>
            <div class="profilo-info-row">
                <span class="profilo-label">Email</span>
                <span class="profilo-value">${user.email}</span>
            </div>
            <div class="profilo-info-row">
                <span class="profilo-label">Tipo Utente</span>
                <span class="profilo-value">${user.tipo_utente.toUpperCase()}</span>
            </div>
            <div class="profilo-info-row">
                <span class="profilo-label">Livello Accesso</span>
                <span class="profilo-value">${user.livello_accesso}</span>
            </div>
            ${user.in_blacklist ? `
                <div class="profilo-info-row">
                    <span class="profilo-label">Stato</span>
                    <span class="profilo-value" style="color: var(--danger-color); font-weight: 600;">
                        IN BLACKLIST fino al ${new Date(user.data_fine_blacklist).toLocaleDateString('it-IT')}
                    </span>
                </div>
            ` : ''}
        `;
    } catch (error) {
        container.innerHTML = `<p style="color:red;">Errore: ${error.message}</p>`;
    }
}

// Event listener navigazione
document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const page = this.dataset.page;
        navigateToPage(page);
    });
});
