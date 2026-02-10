// routes/utenti.js
const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken, checkLevel } = require('../middleware/auth');

// GET profilo utente corrente
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT id_utente, email, nome, cognome, tipo_utente, livello_accesso, in_blacklist, data_fine_blacklist FROM utenti WHERE id_utente = ?',
      [req.user.id_utente]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'Utente non trovato' });
    }
    
    res.json(users[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Errore nel recupero profilo' });
  }
});

// GET tutti gli utenti (solo bibliotecari)
router.get('/', authenticateToken, checkLevel(320), async (req, res) => {
  try {
    const { tipo_utente, in_blacklist } = req.query;
    
    let query = 'SELECT id_utente, email, nome, cognome, tipo_utente, livello_accesso, in_blacklist, data_fine_blacklist, data_registrazione FROM utenti WHERE 1=1';
    const params = [];
    
    if (tipo_utente) {
      query += ' AND tipo_utente = ?';
      params.push(tipo_utente);
    }
    
    if (in_blacklist === 'true') {
      query += ' AND in_blacklist = TRUE';
    }
    
    query += ' ORDER BY cognome, nome';
    
    const [users] = await db.query(query, params);
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Errore nel recupero utenti' });
  }
});

// GET classi
router.get('/classi', authenticateToken, async (req, res) => {
  try {
    const [classi] = await db.query('SELECT * FROM classi ORDER BY nome_classe');
    res.json(classi);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Errore nel recupero classi' });
  }
});

// GET studenti di una classe
router.get('/classi/:id/studenti', authenticateToken, async (req, res) => {
  try {
    const [studenti] = await db.query(`
      SELECT u.id_utente, u.nome, u.cognome, u.email
      FROM utenti u
      JOIN studenti_classi sc ON u.id_utente = sc.id_studente
      WHERE sc.id_classe = ? AND u.tipo_utente = 'studente'
      ORDER BY u.cognome, u.nome
    `, [req.params.id]);
    
    res.json(studenti);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Errore nel recupero studenti' });
  }
});

module.exports = router;
