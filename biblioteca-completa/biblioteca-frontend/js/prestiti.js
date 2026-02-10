// js/prestiti.js

let currentStatoPrestiti = 'prenotato';

// Carica prestiti dell'utente
async function loadMieiPrestiti(stato = 'prenotato') {
    const list = document.getElementById('prestiti-list');
    list.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
    
    currentStatoPrestiti = stato;
    
    try {
        const prestiti = await API.getMieiPrestiti();
        const filtrati = prestiti.filter(p => p.stato === stato);
        
        if (filtrati.length === 0) {
            list.innerHTML = '<p style="text-align:center;">Nessun prestito trovato</p>';
            return;
        }
        
        list.innerHTML = filtrati.map(p => {
            const dataPrenotazione = new Date(p.data_prenotazione).toLocaleDateString('it-IT');
            const dataPrevista = p.data_prevista_restituzione ? 
                new Date(p.data_prevista_restituzione).toLocaleDateString('it-IT') : 'N/D';
            const dataRitiro = p.data_ritiro ? 
                new Date(p.data_ritiro).toLocaleDateString('it-IT') : 'Non ancora ritirato';
            const dataRestituzione = p.data_restituzione_effettiva ? 
                new Date(p.data_restituzione_effettiva).toLocaleDateString('it-IT') : 'N/D';
            
            return `
                <div class="prestito-card">
                    <div class="prestito-info">
                        <h3>${p.titolo}</h3>
                        <div class="prestito-meta">
                            <p><strong>Tipo:</strong> ${p.tipo_materiale}</p>
                            <p><strong>Prenotato il:</strong> ${dataPrenotazione}</p>
                            ${p.stato === 'prenotato' ? `
                                <p><strong>Codice Prenotazione:</strong> 
                                    <span class="codice-prestito">${p.codice_prenotazione}</span>
                                </p>
                            ` : ''}
                            ${p.stato === 'ritirato' ? `
                                <p><strong>Ritirato il:</strong> ${dataRitiro}</p>
                                <p><strong>Da restituire entro:</strong> ${dataPrevista}</p>
                                ${isInRitardo(p.data_prevista_restituzione) ? 
                                    '<p style="color: var(--danger-color); font-weight: 600;">⚠️ IN RITARDO</p>' : ''
                                }
                            ` : ''}
                            ${p.stato === 'restituito' ? `
                                <p><strong>Restituito il:</strong> ${dataRestituzione}</p>
                            ` : ''}
                        </div>
                    </div>
                    <div class="prestito-actions">
                        ${p.stato === 'prenotato' ? `
                            <button class="btn-danger" onclick="annullaPrenotazione(${p.id_prestito})">
                                Annulla
                            </button>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('');
        
    } catch (error) {
        list.innerHTML = `<p style="color:red;">Errore: ${error.message}</p>`;
    }
}

// Verifica se prestito è in ritardo
function isInRitardo(dataPrevista) {
    if (!dataPrevista) return false;
    const oggi = new Date();
    const prevista = new Date(dataPrevista);
    return oggi > prevista;
}

// Annulla prenotazione
async function annullaPrenotazione(id_prestito) {
    if (!confirm('Sei sicuro di voler annullare questa prenotazione?')) {
        return;
    }
    
    try {
        await API.annullaPrestito(id_prestito);
        alert('Prenotazione annullata con successo');
        loadMieiPrestiti(currentStatoPrestiti);
    } catch (error) {
        alert('Errore: ' + error.message);
    }
}

// Tab prestiti
document.querySelectorAll('.prestito-tab').forEach(tab => {
    tab.addEventListener('click', function() {
        document.querySelectorAll('.prestito-tab').forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        
        const stato = this.dataset.stato;
        loadMieiPrestiti(stato);
    });
});
