// routes/admin.js
const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken, checkLevel } = require('../middleware/auth');

// Tutte le routes richiedono livello 320 (bibliotecario) o superiore
router.use(authenticateToken);
router.use(checkLevel(320));

// GET blacklist
router.get('/blacklist', async (req, res) => {
  try {
    const [blacklist] = await db.query(`
      SELECT u.id_utente, u.nome, u.cognome, u.email, u.data_fine_blacklist,
        bl.motivo, bl.data_inserimento, bl.data_scadenza,
        p.titolo as libro_titolo
      FROM utenti u
      LEFT JOIN blacklist_log bl ON u.id_utente = bl.id_utente AND bl.data_scadenza >= CURDATE()
      LEFT JOIN prestiti pr ON bl.id_prestito = pr.id_prestito
      LEFT JOIN materiali p ON pr.id_materiale = p.id_materiale
      WHERE u.in_blacklist = TRUE
      ORDER BY u.data_fine_blacklist DESC
    `);
    
    res.json(blacklist);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Errore nel recupero blacklist' });
  }
});

// POST rimuovi da blacklist manualmente
router.post('/blacklist/:id_utente/rimuovi', async (req, res) => {
  try {
    await db.query(
      'UPDATE utenti SET in_blacklist = FALSE, data_fine_blacklist = NULL WHERE id_utente = ?',
      [req.params.id_utente]
    );
    
    res.json({ message: 'Utente rimosso dalla blacklist' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Errore nella rimozione dalla blacklist' });
  }
});

// GET statistiche biblioteca
router.get('/statistiche', async (req, res) => {
  try {
    const [totaliMateriali] = await db.query(
      'SELECT tipo_materiale, COUNT(*) as totale FROM materiali GROUP BY tipo_materiale'
    );
    
    const [prestitiAttivi] = await db.query(
      'SELECT COUNT(*) as totale FROM prestiti WHERE stato IN ("prenotato", "ritirato")'
    );
    
    const [utentiRegistrati] = await db.query(
      'SELECT tipo_utente, COUNT(*) as totale FROM utenti GROUP BY tipo_utente'
    );
    
    const [prestitiMensili] = await db.query(`
      SELECT DATE_FORMAT(data_prenotazione, '%Y-%m') as mese, COUNT(*) as totale
      FROM prestiti
      WHERE data_prenotazione >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
      GROUP BY mese
      ORDER BY mese
    `);
    
    const [materialiPopolari] = await db.query(`
      SELECT m.id_materiale, m.titolo, m.tipo_materiale, COUNT(p.id_prestito) as num_prestiti
      FROM materiali m
      JOIN prestiti p ON m.id_materiale = p.id_materiale
      WHERE p.data_prenotazione >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
      GROUP BY m.id_materiale
      ORDER BY num_prestiti DESC
      LIMIT 10
    `);
    
    res.json({
      totali_materiali: totaliMateriali,
      prestiti_attivi: prestitiAttivi[0].totale,
      utenti_registrati: utentiRegistrati,
      prestiti_mensili: prestitiMensili,
      materiali_popolari: materialiPopolari
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Errore nel recupero statistiche' });
  }
});

// POST invia avviso
router.post('/avvisi', async (req, res) => {
  try {
    const { titolo, messaggio, data_scadenza, priorita } = req.body;
    
    const [result] = await db.query(
      'INSERT INTO avvisi (titolo, messaggio, data_scadenza, id_creatore, priorita) VALUES (?, ?, ?, ?, ?)',
      [titolo, messaggio, data_scadenza, req.user.id_utente, priorita || 'media']
    );
    
    res.status(201).json({ 
      message: 'Avviso pubblicato con successo',
      id_avviso: result.insertId 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Errore nella pubblicazione avviso' });
  }
});

// GET avvisi attivi
router.get('/avvisi', async (req, res) => {
  try {
    const [avvisi] = await db.query(`
      SELECT a.*, u.nome as creatore_nome, u.cognome as creatore_cognome
      FROM avvisi a
      JOIN utenti u ON a.id_creatore = u.id_utente
      WHERE a.data_scadenza IS NULL OR a.data_scadenza >= CURDATE()
      ORDER BY a.priorita DESC, a.data_pubblicazione DESC
    `);
    
    res.json(avvisi);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Errore nel recupero avvisi' });
  }
});

// GET/PUT impostazioni
router.get('/impostazioni', async (req, res) => {
  try {
    const [impostazioni] = await db.query('SELECT * FROM impostazioni');
    res.json(impostazioni);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Errore nel recupero impostazioni' });
  }
});

router.put('/impostazioni/:chiave', async (req, res) => {
  try {
    const { valore } = req.body;
    
    await db.query(
      'UPDATE impostazioni SET valore = ? WHERE chiave = ?',
      [valore, req.params.chiave]
    );
    
    res.json({ message: 'Impostazione aggiornata con successo' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Errore nell\'aggiornamento impostazione' });
  }
});

// Job automatici per gestione blacklist e promemoria
router.post('/jobs/verifica-blacklist', async (req, res) => {
  try {
    // Rimuove utenti dalla blacklist scaduta
    await db.query(`
      UPDATE utenti 
      SET in_blacklist = FALSE, data_fine_blacklist = NULL 
      WHERE in_blacklist = TRUE AND data_fine_blacklist < CURDATE()
    `);
    
    res.json({ message: 'Blacklist verificata' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Errore nella verifica blacklist' });
  }
});

router.post('/jobs/verifica-ritardi', async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    
    // Trova prestiti in ritardo
    const [prestitiRitardo] = await connection.query(`
      SELECT p.*, u.email, u.nome, u.cognome, m.titolo
      FROM prestiti p
      JOIN utenti u ON p.id_utente = u.id_utente
      JOIN materiali m ON p.id_materiale = m.id_materiale
      WHERE p.stato = 'ritirato' 
      AND p.data_prevista_restituzione < CURDATE()
    `);
    
    // Per ogni prestito in ritardo, considera aggiungere a blacklist dopo soglia
    for (const prestito of prestitiRitardo) {
      const giorniRitardo = Math.floor(
        (new Date() - new Date(prestito.data_prevista_restituzione)) / (1000 * 60 * 60 * 24)
      );
      
      // Se ritardo > 30 giorni e non già in blacklist
      if (giorniRitardo > 30) {
        const [user] = await connection.query(
          'SELECT in_blacklist FROM utenti WHERE id_utente = ?',
          [prestito.id_utente]
        );
        
        if (!user[0].in_blacklist) {
          const [impostazioni] = await connection.query(
            'SELECT valore FROM impostazioni WHERE chiave = "giorni_blacklist"'
          );
          const giorniBlacklist = parseInt(impostazioni[0].valore);
          const dataFine = new Date();
          dataFine.setDate(dataFine.getDate() + giorniBlacklist);
          
          await connection.query(
            'UPDATE utenti SET in_blacklist = TRUE, data_fine_blacklist = ? WHERE id_utente = ?',
            [dataFine, prestito.id_utente]
          );
          
          await connection.query(
            'INSERT INTO blacklist_log (id_utente, motivo, data_scadenza, id_prestito) VALUES (?, "ritardo_restituzione", ?, ?)',
            [prestito.id_utente, dataFine, prestito.id_prestito]
          );
        }
      }
    }
    
    await connection.commit();
    res.json({ 
      message: 'Verifica ritardi completata',
      prestiti_ritardo: prestitiRitardo.length 
    });
    
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ error: 'Errore nella verifica ritardi' });
  } finally {
    connection.release();
  }
});

module.exports = router;
