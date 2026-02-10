// routes/prestiti.js
const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken, checkLevel } = require('../middleware/auth');

// Genera codice prenotazione univoco
function generaCodicePrenotazione() {
  return 'PREST-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();
}

// GET prestiti utente corrente
router.get('/miei', authenticateToken, async (req, res) => {
  try {
    const [prestiti] = await db.query(`
      SELECT p.*, m.titolo, m.tipo_materiale, m.immagine_copertina,
        u.nome as bibliotecario_nome, u.cognome as bibliotecario_cognome
      FROM prestiti p
      JOIN materiali m ON p.id_materiale = m.id_materiale
      LEFT JOIN utenti u ON p.id_bibliotecario = u.id_utente
      WHERE p.id_utente = ?
      ORDER BY p.data_prenotazione DESC
    `, [req.user.id_utente]);
    
    res.json(prestiti);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Errore nel recupero prestiti' });
  }
});

// GET tutti i prestiti (solo bibliotecari)
router.get('/', authenticateToken, checkLevel(320), async (req, res) => {
  try {
    const { stato, id_utente } = req.query;
    
    let query = `
      SELECT p.*, m.titolo, m.tipo_materiale,
        u.nome as utente_nome, u.cognome as utente_cognome, u.email,
        b.nome as bibliotecario_nome, b.cognome as bibliotecario_cognome
      FROM prestiti p
      JOIN materiali m ON p.id_materiale = m.id_materiale
      JOIN utenti u ON p.id_utente = u.id_utente
      LEFT JOIN utenti b ON p.id_bibliotecario = b.id_utente
      WHERE 1=1
    `;
    
    const params = [];
    
    if (stato) {
      query += ' AND p.stato = ?';
      params.push(stato);
    }
    
    if (id_utente) {
      query += ' AND p.id_utente = ?';
      params.push(id_utente);
    }
    
    query += ' ORDER BY p.data_prenotazione DESC';
    
    const [prestiti] = await db.query(query, params);
    res.json(prestiti);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Errore nel recupero prestiti' });
  }
});

// POST nuovo prestito (prenotazione)
router.post('/', authenticateToken, async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    
    const { id_materiale, tipo_prestito, id_classe, studenti } = req.body;
    const id_utente = req.user.id_utente;
    
    // Verifica blacklist
    const [user] = await connection.query(
      'SELECT in_blacklist FROM utenti WHERE id_utente = ?',
      [id_utente]
    );
    
    if (user[0].in_blacklist) {
      return res.status(403).json({ error: 'Utente in blacklist' });
    }
    
    // Verifica disponibilità materiale
    const [materiale] = await connection.query(
      'SELECT copie_disponibili, titolo FROM materiali WHERE id_materiale = ?',
      [id_materiale]
    );
    
    if (materiale.length === 0) {
      return res.status(404).json({ error: 'Materiale non trovato' });
    }
    
    // Verifica limite prestiti per uso personale
    if (tipo_prestito === 'personale' || !tipo_prestito) {
      const [impostazioni] = await connection.query(
        'SELECT valore FROM impostazioni WHERE chiave = "prestiti_max_personali"'
      );
      const maxPrestiti = parseInt(impostazioni[0].valore);
      
      const [prestitiAttivi] = await connection.query(
        'SELECT COUNT(*) as count FROM prestiti WHERE id_utente = ? AND stato IN ("prenotato", "ritirato") AND tipo_prestito = "personale"',
        [id_utente]
      );
      
      if (prestitiAttivi[0].count >= maxPrestiti) {
        return res.status(400).json({ 
          error: `Limite massimo di ${maxPrestiti} prestiti contemporanei raggiunto` 
        });
      }
    }
    
    // Per docenti con prestito classe, verifica copie sufficienti
    let copieRichieste = 1;
    if (tipo_prestito === 'classe' && studenti && Array.isArray(studenti)) {
      copieRichieste = studenti.length;
    }
    
    if (materiale[0].copie_disponibili < copieRichieste) {
      // Aggiungi a lista attesa
      await connection.query(
        'INSERT INTO lista_attesa (id_materiale, id_utente) VALUES (?, ?)',
        [id_materiale, id_utente]
      );
      await connection.commit();
      return res.status(200).json({ 
        message: 'Copie non disponibili. Aggiunto alla lista d\'attesa',
        lista_attesa: true
      });
    }
    
    // Calcola data prevista restituzione
    const [giorniPrestito] = await connection.query(
      'SELECT valore FROM impostazioni WHERE chiave = "giorni_prestito"'
    );
    const giorni = parseInt(giorniPrestito[0].valore);
    const dataPrevista = new Date();
    dataPrevista.setDate(dataPrevista.getDate() + giorni);
    
    // Crea prestito
    const codicePren = generaCodicePrenotazione();
    const [result] = await connection.query(
      `INSERT INTO prestiti (id_materiale, id_utente, codice_prenotazione, 
        data_prevista_restituzione, tipo_prestito) 
      VALUES (?, ?, ?, ?, ?)`,
      [id_materiale, id_utente, codicePren, dataPrevista, tipo_prestito || 'personale']
    );
    
    const id_prestito = result.insertId;
    
    // Se prestito classe, registra studenti
    if (tipo_prestito === 'classe' && studenti && id_classe) {
      for (const id_studente of studenti) {
        await connection.query(
          'INSERT INTO prestiti_classe (id_prestito, id_classe, id_studente) VALUES (?, ?, ?)',
          [id_prestito, id_classe, id_studente]
        );
      }
    }
    
    // Aggiorna copie disponibili
    await connection.query(
      'UPDATE materiali SET copie_disponibili = copie_disponibili - ? WHERE id_materiale = ?',
      [copieRichieste, id_materiale]
    );
    
    await connection.commit();
    
    res.status(201).json({ 
      message: 'Prenotazione creata con successo',
      id_prestito,
      codice_prenotazione: codicePren,
      data_prevista_restituzione: dataPrevista
    });
    
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ error: 'Errore nella creazione prestito' });
  } finally {
    connection.release();
  }
});

// PUT conferma ritiro (bibliotecario)
router.put('/:id/ritiro', authenticateToken, checkLevel(320), async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    
    const { codice_prenotazione } = req.body;
    const id_bibliotecario = req.user.id_utente;
    
    // Verifica codice
    const [prestiti] = await connection.query(
      'SELECT * FROM prestiti WHERE id_prestito = ? AND codice_prenotazione = ?',
      [req.params.id, codice_prenotazione]
    );
    
    if (prestiti.length === 0) {
      return res.status(404).json({ error: 'Prestito non trovato o codice errato' });
    }
    
    if (prestiti[0].stato !== 'prenotato') {
      return res.status(400).json({ error: 'Prestito già ritirato o annullato' });
    }
    
    // Aggiorna prestito
    await connection.query(
      'UPDATE prestiti SET stato = "ritirato", data_ritiro = CURDATE(), id_bibliotecario = ? WHERE id_prestito = ?',
      [id_bibliotecario, req.params.id]
    );
    
    await connection.commit();
    res.json({ message: 'Ritiro confermato con successo' });
    
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ error: 'Errore nella conferma ritiro' });
  } finally {
    connection.release();
  }
});

// PUT conferma restituzione (bibliotecario)
router.put('/:id/restituzione', authenticateToken, checkLevel(320), async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    
    const { codice_prenotazione } = req.body;
    
    // Verifica prestito
    const [prestiti] = await connection.query(
      'SELECT p.*, m.id_materiale FROM prestiti p JOIN materiali m ON p.id_materiale = m.id_materiale WHERE p.id_prestito = ? AND p.codice_prenotazione = ?',
      [req.params.id, codice_prenotazione]
    );
    
    if (prestiti.length === 0) {
      return res.status(404).json({ error: 'Prestito non trovato o codice errato' });
    }
    
    const prestito = prestiti[0];
    
    if (prestito.stato !== 'ritirato') {
      return res.status(400).json({ error: 'Prestito non è stato ritirato' });
    }
    
    // Calcola copie da restituire
    let copieRestituite = 1;
    if (prestito.tipo_prestito === 'classe') {
      const [studenti] = await connection.query(
        'SELECT COUNT(*) as count FROM prestiti_classe WHERE id_prestito = ?',
        [req.params.id]
      );
      copieRestituite = studenti[0].count;
    }
    
    // Aggiorna prestito
    await connection.query(
      'UPDATE prestiti SET stato = "restituito", data_restituzione_effettiva = CURDATE() WHERE id_prestito = ?',
      [req.params.id]
    );
    
    // Ripristina copie disponibili
    await connection.query(
      'UPDATE materiali SET copie_disponibili = copie_disponibili + ? WHERE id_materiale = ?',
      [copieRestituite, prestito.id_materiale]
    );
    
    // Verifica ritardo e gestisci blacklist
    const oggi = new Date();
    const dataPrevista = new Date(prestito.data_prevista_restituzione);
    
    if (oggi > dataPrevista) {
      const [impostazioni] = await connection.query(
        'SELECT valore FROM impostazioni WHERE chiave = "giorni_blacklist"'
      );
      const giorniBlacklist = parseInt(impostazioni[0].valore);
      const dataFineBlacklist = new Date();
      dataFineBlacklist.setDate(dataFineBlacklist.getDate() + giorniBlacklist);
      
      // Aggiungi a blacklist
      await connection.query(
        'UPDATE utenti SET in_blacklist = TRUE, data_fine_blacklist = ? WHERE id_utente = ?',
        [dataFineBlacklist, prestito.id_utente]
      );
      
      await connection.query(
        'INSERT INTO blacklist_log (id_utente, motivo, data_scadenza, id_prestito) VALUES (?, "ritardo_restituzione", ?, ?)',
        [prestito.id_utente, dataFineBlacklist, req.params.id]
      );
    }
    
    // Notifica utenti in lista attesa
    const [listaAttesa] = await connection.query(
      'SELECT * FROM lista_attesa WHERE id_materiale = ? AND notifica_inviata = FALSE ORDER BY data_richiesta LIMIT 1',
      [prestito.id_materiale]
    );
    
    if (listaAttesa.length > 0) {
      // Qui andrebbe inviata email di notifica
      await connection.query(
        'UPDATE lista_attesa SET notifica_inviata = TRUE WHERE id_attesa = ?',
        [listaAttesa[0].id_attesa]
      );
    }
    
    await connection.commit();
    res.json({ message: 'Restituzione confermata con successo' });
    
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ error: 'Errore nella conferma restituzione' });
  } finally {
    connection.release();
  }
});

// DELETE annulla prenotazione
router.delete('/:id', authenticateToken, async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    
    const [prestiti] = await connection.query(
      'SELECT * FROM prestiti WHERE id_prestito = ? AND id_utente = ?',
      [req.params.id, req.user.id_utente]
    );
    
    if (prestiti.length === 0) {
      return res.status(404).json({ error: 'Prestito non trovato' });
    }
    
    const prestito = prestiti[0];
    
    if (prestito.stato !== 'prenotato') {
      return res.status(400).json({ error: 'Impossibile annullare: prestito già ritirato' });
    }
    
    // Calcola copie da ripristinare
    let copie = 1;
    if (prestito.tipo_prestito === 'classe') {
      const [studenti] = await connection.query(
        'SELECT COUNT(*) as count FROM prestiti_classe WHERE id_prestito = ?',
        [req.params.id]
      );
      copie = studenti[0].count;
    }
    
    // Annulla prestito
    await connection.query(
      'UPDATE prestiti SET stato = "annullato" WHERE id_prestito = ?',
      [req.params.id]
    );
    
    // Ripristina copie
    await connection.query(
      'UPDATE materiali SET copie_disponibili = copie_disponibili + ? WHERE id_materiale = ?',
      [copie, prestito.id_materiale]
    );
    
    await connection.commit();
    res.json({ message: 'Prenotazione annullata con successo' });
    
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ error: 'Errore nell\'annullamento prenotazione' });
  } finally {
    connection.release();
  }
});

module.exports = router;
