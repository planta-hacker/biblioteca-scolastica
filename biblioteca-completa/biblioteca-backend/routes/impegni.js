// routes/impegni.js
const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// GET tutti gli impegni
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { data_inizio, data_fine, tipo_impegno } = req.query;
    
    let query = `
      SELECT i.*, u.nome as docente_nome, u.cognome as docente_cognome
      FROM impegni_scolastici i
      LEFT JOIN utenti u ON i.id_docente = u.id_utente
      WHERE (i.visibile_a = 'tutti' OR i.visibile_a = ? OR i.id_docente = ?)
    `;
    
    const params = [
      req.user.tipo_utente === 'docente' ? 'docenti' : 'tutti',
      req.user.id_utente
    ];
    
    if (data_inizio) {
      query += ' AND i.data_inizio >= ?';
      params.push(data_inizio);
    }
    
    if (data_fine) {
      query += ' AND i.data_fine <= ?';
      params.push(data_fine);
    }
    
    if (tipo_impegno) {
      query += ' AND i.tipo_impegno = ?';
      params.push(tipo_impegno);
    }
    
    query += ' ORDER BY i.data_inizio';
    
    const [impegni] = await db.query(query, params);
    res.json(impegni);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Errore nel recupero impegni' });
  }
});

// POST nuovo impegno (docenti e admin)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { titolo, descrizione, data_inizio, data_fine, tipo_impegno, visibile_a } = req.body;
    
    if (req.user.tipo_utente !== 'docente' && req.user.livello_accesso < 320) {
      return res.status(403).json({ error: 'Accesso negato' });
    }
    
    const [result] = await db.query(
      `INSERT INTO impegni_scolastici 
      (titolo, descrizione, data_inizio, data_fine, tipo_impegno, id_docente, visibile_a) 
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [titolo, descrizione, data_inizio, data_fine, tipo_impegno, req.user.id_utente, visibile_a || 'tutti']
    );
    
    res.status(201).json({ 
      message: 'Impegno creato con successo',
      id_impegno: result.insertId 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Errore nella creazione impegno' });
  }
});

// PUT aggiorna impegno
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const [impegni] = await db.query(
      'SELECT * FROM impegni_scolastici WHERE id_impegno = ?',
      [req.params.id]
    );
    
    if (impegni.length === 0) {
      return res.status(404).json({ error: 'Impegno non trovato' });
    }
    
    // Verifica permessi
    if (impegni[0].id_docente !== req.user.id_utente && req.user.livello_accesso < 320) {
      return res.status(403).json({ error: 'Non autorizzato a modificare questo impegno' });
    }
    
    const { titolo, descrizione, data_inizio, data_fine, tipo_impegno, visibile_a } = req.body;
    
    await db.query(
      `UPDATE impegni_scolastici 
      SET titolo = ?, descrizione = ?, data_inizio = ?, data_fine = ?, tipo_impegno = ?, visibile_a = ?
      WHERE id_impegno = ?`,
      [titolo, descrizione, data_inizio, data_fine, tipo_impegno, visibile_a, req.params.id]
    );
    
    res.json({ message: 'Impegno aggiornato con successo' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Errore nell\'aggiornamento impegno' });
  }
});

// DELETE elimina impegno
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const [impegni] = await db.query(
      'SELECT * FROM impegni_scolastici WHERE id_impegno = ?',
      [req.params.id]
    );
    
    if (impegni.length === 0) {
      return res.status(404).json({ error: 'Impegno non trovato' });
    }
    
    // Verifica permessi
    if (impegni[0].id_docente !== req.user.id_utente && req.user.livello_accesso < 320) {
      return res.status(403).json({ error: 'Non autorizzato a eliminare questo impegno' });
    }
    
    await db.query('DELETE FROM impegni_scolastici WHERE id_impegno = ?', [req.params.id]);
    res.json({ message: 'Impegno eliminato con successo' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Errore nell\'eliminazione impegno' });
  }
});

module.exports = router;
