// routes/dispositivi.js
const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken, checkLevel } = require('../middleware/auth');

// GET tutti i dispositivi
router.get('/', authenticateToken, async (req, res) => {
  try {
    const [dispositivi] = await db.query(`
      SELECT d.*, l.nome as location_nome, l.tipo_location
      FROM dispositivi d
      LEFT JOIN location l ON d.id_location = l.id_location
      ORDER BY d.nome
    `);
    
    res.json(dispositivi);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Errore nel recupero dispositivi' });
  }
});

// GET tutte le location
router.get('/location', authenticateToken, async (req, res) => {
  try {
    const [location] = await db.query('SELECT * FROM location ORDER BY tipo_location, nome');
    res.json(location);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Errore nel recupero location' });
  }
});

// POST nuova location (solo admin)
router.post('/location', authenticateToken, checkLevel(320), async (req, res) => {
  try {
    const { tipo_location, nome, descrizione } = req.body;
    
    const [result] = await db.query(
      'INSERT INTO location (tipo_location, nome, descrizione) VALUES (?, ?, ?)',
      [tipo_location, nome, descrizione]
    );
    
    res.status(201).json({ 
      message: 'Location creata con successo',
      id_location: result.insertId 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Errore nella creazione location' });
  }
});

// POST nuovo dispositivo (solo admin)
router.post('/', authenticateToken, checkLevel(320), async (req, res) => {
  try {
    const { nome, tipo, codice_identificativo, id_location, note } = req.body;
    
    const [result] = await db.query(
      'INSERT INTO dispositivi (nome, tipo, codice_identificativo, id_location, note) VALUES (?, ?, ?, ?, ?)',
      [nome, tipo, codice_identificativo, id_location, note]
    );
    
    res.status(201).json({ 
      message: 'Dispositivo aggiunto con successo',
      id_dispositivo: result.insertId 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Errore nell\'aggiunta dispositivo' });
  }
});

// POST richiedi dispositivo
router.post('/:id/richiedi', authenticateToken, async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    
    const { giorni_prestito } = req.body;
    const id_utente = req.user.id_utente;
    
    // Verifica disponibilità
    const [dispositivi] = await connection.query(
      'SELECT * FROM dispositivi WHERE id_dispositivo = ? AND disponibile = TRUE',
      [req.params.id]
    );
    
    if (dispositivi.length === 0) {
      return res.status(400).json({ error: 'Dispositivo non disponibile' });
    }
    
    // Calcola data restituzione
    const dataRestituzione = new Date();
    dataRestituzione.setDate(dataRestituzione.getDate() + (giorni_prestito || 7));
    
    // Crea prestito
    const [result] = await connection.query(
      'INSERT INTO prestiti_dispositivi (id_dispositivo, id_utente, data_restituzione_prevista) VALUES (?, ?, ?)',
      [req.params.id, id_utente, dataRestituzione]
    );
    
    // Aggiorna disponibilità
    await connection.query(
      'UPDATE dispositivi SET disponibile = FALSE WHERE id_dispositivo = ?',
      [req.params.id]
    );
    
    await connection.commit();
    res.status(201).json({ 
      message: 'Dispositivo assegnato con successo',
      id_prestito: result.insertId 
    });
    
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ error: 'Errore nella richiesta dispositivo' });
  } finally {
    connection.release();
  }
});

// PUT restituisci dispositivo (admin)
router.put('/prestiti/:id/restituisci', authenticateToken, checkLevel(320), async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    
    const [prestiti] = await connection.query(
      'SELECT * FROM prestiti_dispositivi WHERE id_prestito_disp = ? AND stato = "in_uso"',
      [req.params.id]
    );
    
    if (prestiti.length === 0) {
      return res.status(404).json({ error: 'Prestito non trovato' });
    }
    
    // Aggiorna prestito
    await connection.query(
      'UPDATE prestiti_dispositivi SET stato = "restituito", data_restituzione_effettiva = CURDATE() WHERE id_prestito_disp = ?',
      [req.params.id]
    );
    
    // Ripristina disponibilità
    await connection.query(
      'UPDATE dispositivi SET disponibile = TRUE WHERE id_dispositivo = ?',
      [prestiti[0].id_dispositivo]
    );
    
    await connection.commit();
    res.json({ message: 'Dispositivo restituito con successo' });
    
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ error: 'Errore nella restituzione dispositivo' });
  } finally {
    connection.release();
  }
});

module.exports = router;
