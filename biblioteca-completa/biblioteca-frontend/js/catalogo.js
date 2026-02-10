// js/catalogo.js

// Carica e mostra catalogo
async function loadCatalogo(filters = {}) {
    const grid = document.getElementById('materiali-grid');
    grid.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
    
    try {
        const materiali = await API.getMateriali(filters);
        
        if (materiali.length === 0) {
            grid.innerHTML = '<p style="text-align:center; grid-column: 1/-1;">Nessun materiale trovato</p>';
            return;
        }
        
        grid.innerHTML = materiali.map(m => `
            <div class="materiale-card" onclick="showDettaglio(${m.id_materiale})">
                <div class="materiale-img">
                    ${m.immagine_copertina ? 
                        `<img src="${m.immagine_copertina}" alt="${m.titolo}" style="width:100%;height:100%;object-fit:cover;">` : 
                        '📚'
                    }
                </div>
                <div class="materiale-info">
                    <span class="materiale-tipo">${m.tipo_materiale.toUpperCase()}</span>
                    <h3 class="materiale-title">${m.titolo}</h3>
                    <p class="materiale-author">${m.autori || 'Autore sconosciuto'}</p>
                    <div class="materiale-disponibilita">
                        ${m.copie_disponibili > 0 ? 
                            `<span class="disponibile">✓ Disponibile (${m.copie_disponibili}/${m.copie_totali})</span>` :
                            '<span class="non-disponibile">✗ Non disponibile</span>'
                        }
                    </div>
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        grid.innerHTML = `<p style="color:red; grid-column: 1/-1;">Errore: ${error.message}</p>`;
    }
}

// Mostra dettaglio materiale in modal
async function showDettaglio(id) {
    const modal = document.getElementById('modal-dettaglio');
    const content = document.getElementById('modal-dettaglio-content');
    
    modal.style.display = 'flex';
    content.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
    
    try {
        const m = await API.getMateriale(id);
        
        content.innerHTML = `
            <h2>${m.titolo}</h2>
            <div style="margin: 20px 0;">
                <p><strong>Tipo:</strong> ${m.tipo_materiale}</p>
                <p><strong>Autori:</strong> ${m.autori || 'N/D'}</p>
                <p><strong>Editore:</strong> ${m.editore || 'N/D'}</p>
                <p><strong>Anno:</strong> ${m.anno_pubblicazione || 'N/D'}</p>
                <p><strong>Lingua:</strong> ${m.lingua_nome || 'N/D'}</p>
                <p><strong>ISBN:</strong> ${m.codice_isbn || 'N/D'}</p>
                <p><strong>Dewey:</strong> ${m.codice_dewey || 'N/D'} - ${m.dewey_descrizione || ''}</p>
                <p><strong>Generi:</strong> ${m.generi || 'N/D'}</p>
                <p><strong>Posizione:</strong> Armadio ${m.armadio}, Ripiano ${m.ripiano}</p>
                <p><strong>Disponibilità:</strong> ${m.copie_disponibili}/${m.copie_totali} copie</p>
                ${m.trama ? `<p><strong>Trama:</strong><br>${m.trama}</p>` : ''}
            </div>
            
            ${m.copie_disponibili > 0 ? 
                `<button class="btn-primary" onclick="mostraPrenotazione(${m.id_materiale}, '${m.titolo}')">
                    Prenota Ora
                </button>` :
                `<button class="btn-secondary" disabled>Non Disponibile</button>`
            }
        `;
        
    } catch (error) {
        content.innerHTML = `<p style="color:red;">Errore: ${error.message}</p>`;
    }
}

// Mostra form prenotazione
function mostraPrenotazione(id_materiale, titolo) {
    const modal = document.getElementById('modal-prenota');
    const content = document.getElementById('modal-prenota-content');
    
    document.getElementById('modal-dettaglio').style.display = 'none';
    modal.style.display = 'flex';
    
    const user = Auth.getUser();
    const isDocente = user.tipo_utente === 'docente';
    
    content.innerHTML = `
        <p>Stai prenotando: <strong>${titolo}</strong></p>
        
        ${isDocente ? `
            <div class="form-group" style="margin-top: 20px;">
                <label>Tipo Prestito:</label>
                <select id="tipo-prestito" onchange="toggleClasseSelection()">
                    <option value="personale">Uso Personale</option>
                    <option value="classe">Per la Classe</option>
                </select>
            </div>
            
            <div id="classe-selection" style="display:none; margin-top: 15px;">
                <div class="form-group">
                    <label>Seleziona Classe:</label>
                    <select id="select-classe"></select>
                </div>
                <div class="form-group">
                    <label>Studenti (seleziona):</label>
                    <div id="studenti-checkboxes" style="max-height: 200px; overflow-y: auto;"></div>
                </div>
            </div>
        ` : ''}
        
        <button class="btn-primary btn-block" style="margin-top: 20px;" onclick="confermaPrenotazione(${id_materiale})">
            Conferma Prenotazione
        </button>
    `;
    
    if (isDocente) {
        loadClassi();
    }
}

// Carica classi per docenti
async function loadClassi() {
    try {
        const classi = await API.getClassi();
        const select = document.getElementById('select-classe');
        
        select.innerHTML = '<option value="">Seleziona...</option>' + 
            classi.map(c => `<option value="${c.id_classe}">${c.nome_classe}</option>`).join('');
        
        select.addEventListener('change', async function() {
            if (this.value) {
                const studenti = await API.getStudentiClasse(this.value);
                const container = document.getElementById('studenti-checkboxes');
                
                container.innerHTML = studenti.map(s => `
                    <label style="display: block; padding: 5px;">
                        <input type="checkbox" value="${s.id_utente}" class="studente-checkbox">
                        ${s.nome} ${s.cognome}
                    </label>
                `).join('');
            }
        });
    } catch (error) {
        console.error('Errore caricamento classi:', error);
    }
}

function toggleClasseSelection() {
    const tipo = document.getElementById('tipo-prestito').value;
    const container = document.getElementById('classe-selection');
    container.style.display = tipo === 'classe' ? 'block' : 'none';
}

// Conferma prenotazione
async function confermaPrenotazione(id_materiale) {
    const user = Auth.getUser();
    const data = { id_materiale };
    
    if (user.tipo_utente === 'docente') {
        const tipoPrestito = document.getElementById('tipo-prestito').value;
        data.tipo_prestito = tipoPrestito;
        
        if (tipoPrestito === 'classe') {
            const id_classe = document.getElementById('select-classe').value;
            if (!id_classe) {
                alert('Seleziona una classe');
                return;
            }
            
            const studentiCheckboxes = document.querySelectorAll('.studente-checkbox:checked');
            if (studentiCheckboxes.length === 0) {
                alert('Seleziona almeno uno studente');
                return;
            }
            
            data.id_classe = id_classe;
            data.studenti = Array.from(studentiCheckboxes).map(cb => cb.value);
        }
    }
    
    try {
        const result = await API.createPrestito(data);
        
        if (result.lista_attesa) {
            alert('Materiale non disponibile. Sei stato aggiunto alla lista d\'attesa.');
        } else {
            alert(`Prenotazione confermata!\n\nCodice: ${result.codice_prenotazione}\n\nPorta questo codice quando ritiri il materiale.`);
        }
        
        document.getElementById('modal-prenota').style.display = 'none';
        loadCatalogo();
        
    } catch (error) {
        alert('Errore: ' + error.message);
    }
}

// Filtri ricerca
document.getElementById('btn-search').addEventListener('click', () => {
    const filters = {
        titolo: document.getElementById('search-title').value,
        tipo: document.getElementById('filter-tipo').value,
        disponibile: document.getElementById('filter-disponibile').value
    };
    
    loadCatalogo(filters);
});

// Chiudi modali
document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', function() {
        this.closest('.modal').style.display = 'none';
    });
});

// Click fuori dal modal per chiudere
window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.style.display = 'none';
    }
});
