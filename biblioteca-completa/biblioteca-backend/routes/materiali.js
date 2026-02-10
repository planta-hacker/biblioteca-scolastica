// routes/materiali.js
const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken, checkLevel } = require('../middleware/auth');

// GET tutti i materiali con filtri
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { tipo, titolo, autore, genere, disponibile } = req.query;
    
    let query = `
      SELECT DISTINCT m.*, 
        ce.nome as editore,
        l.nome as lingua_nome,
        cd.descrizione as dewey_descrizione,
        GROUP_CONCAT(DISTINCT CONCAT(a.nome, ' ', a.cognome) SEPARATOR ', ') as autori,
        GROUP_CONCAT(DISTINCT g.nome SEPARATOR ', ') as generi
      FROM materiali m
      LEFT JOIN case_editrici ce ON m.id_editore = ce.id_editore
      LEFT JOIN lingue l ON m.id_lingua = l.id_lingua
      LEFT JOIN codici_dewey cd ON m.codice_dewey = cd.codice_dewey
      LEFT JOIN materiali_autori ma ON m.id_materiale = ma.id_materiale
      LEFT JOIN autori a ON ma.id_autore = a.id_autore
      LEFT JOIN materiali_generi mg ON m.id_materiale = mg.id_materiale
      LEFT JOIN generi g ON mg.id_genere = g.id_genere
      WHERE 1=1
    `;
    
    const params = [];
    
    if (tipo) {
      query += ' AND m.tipo_materiale = ?';
      params.push(tipo);
    }
    
    if (titolo) {
      query += ' AND m.titolo LIKE ?';
      params.push(`%${titolo}%`);
    }
    
    if (disponibile === 'true') {
      query += ' AND m.copie_disponibili > 0';
    }
    
    query += ' GROUP BY m.id_materiale ORDER BY m.titolo';
    
    const [materiali] = await db.query(query, params);
    
    // Filtra per autore se specificato (post-query perché è aggregato)
    let risultati = materiali;
    if (autore) {
      risultati = materiali.filter(m => 
        m.autori && m.autori.toLowerCase().includes(autore.toLowerCase())
      );
    }
    
    // Filtra per genere se specificato
    if (genere) {
      risultati = risultati.filter(m => 
        m.generi && m.generi.toLowerCase().includes(genere.toLowerCase())
      );
    }
    
    res.json(risultati);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Errore nel recupero materiali' });
  }
});

// GET singolo materiale per ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const [materiali] = await db.query(`
      SELECT m.*, 
        ce.nome as editore,
        l.nome as lingua_nome,
        cd.descrizione as dewey_descrizione,
        cd.categoria_principale,
        GROUP_CONCAT(DISTINCT CONCAT(a.nome, ' ', a.cognome) SEPARATOR ', ') as autori,
        GROUP_CONCAT(DISTINCT g.nome SEPARATOR ', ') as generi
      FROM materiali m
      LEFT JOIN case_editrici ce ON m.id_editore = ce.id_editore
      LEFT JOIN lingue l ON m.id_lingua = l.id_lingua
      LEFT JOIN codici_dewey cd ON m.codice_dewey = cd.codice_dewey
      LEFT JOIN materiali_autori ma ON m.id_materiale = ma.id_materiale
      LEFT JOIN autori a ON ma.id_autore = a.id_autore
      LEFT JOIN materiali_generi mg ON m.id_materiale = mg.id_materiale
      LEFT JOIN generi g ON mg.id_genere = g.id_genere
      WHERE m.id_materiale = ?
      GROUP BY m.id_materiale
    `, [req.params.id]);
    
    if (materiali.length === 0) {
      return res.status(404).json({ error: 'Materiale non trovato' });
    }
    
    res.json(materiali[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Errore nel recupero materiale' });
  }
});

// POST nuovo materiale (solo bibliotecari e master)
router.post('/', authenticateToken, checkLevel(320), async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    
    const {
      tipo_materiale, titolo, editore, lingua, anno_pubblicazione,
      data_pubblicazione, codice_isbn, codice_dewey, armadio, ripiano,
      immagine_copertina, trama, copie_totali, autori, generi
    } = req.body;
    
    // Validazione
    if (!tipo_materiale || !titolo || !lingua) {
      return res.status(400).json({ error: 'Campi obbligatori mancanti' });
    }
    
    // Gestione editore
    let id_editore = null;
    if (editore) {
      const [editoriExists] = await connection.query(
        'SELECT id_editore FROM case_editrici WHERE nome = ?',
        [editore.toUpperCase()]
      );
      
      if (editoriExists.length > 0) {
        id_editore = editoriExists[0].id_editore;
      } else {
        const [newEditore] = await connection.query(
          'INSERT INTO case_editrici (nome) VALUES (?)',
          [editore.toUpperCase()]
        );
        id_editore = newEditore.insertId;
      }
    }
    
    // Recupera id_lingua
    const [lingue] = await connection.query(
      'SELECT id_lingua FROM lingue WHERE codice = ? OR nome = ?',
      [lingua.toUpperCase(), lingua]
    );
    
    if (lingue.length === 0) {
      throw new Error('Lingua non valida');
    }
    
    const id_lingua = lingue[0].id_lingua;
    
    // Inserimento materiale
    const copie = copie_totali || 1;
    const [result] = await connection.query(
      `INSERT INTO materiali (
        tipo_materiale, titolo, id_editore, id_lingua, anno_pubblicazione,
        data_pubblicazione, codice_isbn, codice_dewey, armadio, ripiano,
        immagine_copertina, trama, copie_totali, copie_disponibili
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        tipo_materiale, titolo, id_editore, id_lingua, anno_pubblicazione,
        data_pubblicazione, codice_isbn ? codice_isbn.toUpperCase() : null,
        codice_dewey, armadio, ripiano, immagine_copertina, trama, copie, copie
      ]
    );
    
    const id_materiale = result.insertId;
    
    // Gestione autori
    if (autori && Array.isArray(autori)) {
      for (const autore of autori) {
        const [nome, ...cognomeParts] = autore.trim().split(' ');
        const cognome = cognomeParts.join(' ');
        
        const [autoriExists] = await connection.query(
          'SELECT id_autore FROM autori WHERE nome = ? AND cognome = ?',
          [nome, cognome]
        );
        
        let id_autore;
        if (autoriExists.length > 0) {
          id_autore = autoriExists[0].id_autore;
        } else {
          const [newAutore] = await connection.query(
            'INSERT INTO autori (nome, cognome) VALUES (?, ?)',
            [nome, cognome]
          );
          id_autore = newAutore.insertId;
        }
        
        await connection.query(
          'INSERT INTO materiali_autori (id_materiale, id_autore) VALUES (?, ?)',
          [id_materiale, id_autore]
        );
      }
    }
    
    // Gestione generi
    if (generi && Array.isArray(generi)) {
      for (const genere of generi) {
        const [generiExists] = await connection.query(
          'SELECT id_genere FROM generi WHERE nome = ?',
          [genere]
        );
        
        let id_genere;
        if (generiExists.length > 0) {
          id_genere = generiExists[0].id_genere;
        } else {
          const [newGenere] = await connection.query(
            'INSERT INTO generi (nome) VALUES (?)',
            [genere]
          );
          id_genere = newGenere.insertId;
        }
        
        await connection.query(
          'INSERT INTO materiali_generi (id_materiale, id_genere) VALUES (?, ?)',
          [id_materiale, id_genere]
        );
      }
    }
    
    await connection.commit();
    res.status(201).json({ 
      message: 'Materiale inserito con successo',
      id_materiale 
    });
    
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ error: 'Errore nell\'inserimento materiale' });
  } finally {
    connection.release();
  }
});

// PUT aggiorna materiale
router.put('/:id', authenticateToken, checkLevel(320), async (req, res) => {
  try {
    const { copie_disponibili, copie_totali, ...updateFields } = req.body;
    
    const updates = [];
    const values = [];
    
    Object.keys(updateFields).forEach(key => {
      if (updateFields[key] !== undefined) {
        updates.push(`${key} = ?`);
        values.push(updateFields[key]);
      }
    });
    
    if (copie_totali !== undefined) {
      updates.push('copie_totali = ?');
      values.push(copie_totali);
    }
    
    if (copie_disponibili !== undefined) {
      updates.push('copie_disponibili = ?');
      values.push(copie_disponibili);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ error: 'Nessun campo da aggiornare' });
    }
    
    values.push(req.params.id);
    
    await db.query(
      `UPDATE materiali SET ${updates.join(', ')} WHERE id_materiale = ?`,
      values
    );
    
    res.json({ message: 'Materiale aggiornato con successo' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Errore nell\'aggiornamento materiale' });
  }
});

// DELETE rimuovi materiale
router.delete('/:id', authenticateToken, checkLevel(320), async (req, res) => {
  try {
    // Verifica che non ci siano prestiti attivi
    const [prestiti] = await db.query(
      'SELECT COUNT(*) as count FROM prestiti WHERE id_materiale = ? AND stato IN ("prenotato", "ritirato")',
      [req.params.id]
    );
    
    if (prestiti[0].count > 0) {
      return res.status(400).json({ 
        error: 'Impossibile eliminare: ci sono prestiti attivi per questo materiale' 
      });
    }
    
    await db.query('DELETE FROM materiali WHERE id_materiale = ?', [req.params.id]);
    res.json({ message: 'Materiale eliminato con successo' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Errore nell\'eliminazione materiale' });
  }
});

// GET genera etichetta per materiale
router.get('/:id/etichetta', authenticateToken, async (req, res) => {
  try {
    const [materiali] = await db.query(`
      SELECT m.id_materiale, m.titolo, m.armadio, m.ripiano, m.codice_dewey,
        cd.categoria_principale,
        GROUP_CONCAT(DISTINCT CONCAT(a.cognome) ORDER BY a.cognome SEPARATOR ', ') as autori
      FROM materiali m
      LEFT JOIN codici_dewey cd ON m.codice_dewey = cd.codice_dewey
      LEFT JOIN materiali_autori ma ON m.id_materiale = ma.id_materiale
      LEFT JOIN autori a ON ma.id_autore = a.id_autore
      WHERE m.id_materiale = ?
      GROUP BY m.id_materiale
    `, [req.params.id]);
    
    if (materiali.length === 0) {
      return res.status(404).json({ error: 'Materiale non trovato' });
    }
    
    const m = materiali[0];
    const etichetta = {
      id: m.id_materiale,
      codice: `${m.armadio}-${m.ripiano}-${m.id_materiale}`,
      titolo: m.titolo,
      autori: m.autori,
      dewey: m.codice_dewey,
      categoria: m.categoria_principale,
      posizione: `Armadio ${m.armadio}, Ripiano ${m.ripiano}`
    };
    
    res.json(etichetta);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Errore nella generazione etichetta' });
  }
});

module.exports = router;
