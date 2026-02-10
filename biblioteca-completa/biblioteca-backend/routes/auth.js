// routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

// Registrazione utente
router.post('/register', async (req, res) => {
  try {
    const { email, password, nome, cognome, tipo_utente } = req.body;
    
    // Validazione
    if (!email || !password || !nome || !cognome) {
      return res.status(400).json({ error: 'Tutti i campi sono obbligatori' });
    }

    // Verifica email esistente
    const [existing] = await db.query('SELECT id_utente FROM utenti WHERE email = ?', [email.toLowerCase()]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Email già registrata' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Determina livello accesso
    let livello_accesso = 0;
    if (tipo_utente === 'bibliotecario') livello_accesso = 320;
    if (tipo_utente === 'master') livello_accesso = 999;

    // Inserimento utente
    const [result] = await db.query(
      'INSERT INTO utenti (email, password_hash, nome, cognome, tipo_utente, livello_accesso) VALUES (?, ?, ?, ?, ?, ?)',
      [email.toLowerCase(), passwordHash, nome, cognome, tipo_utente || 'studente', livello_accesso]
    );

    res.status(201).json({ 
      message: 'Utente registrato con successo',
      id_utente: result.insertId 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Errore durante la registrazione' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email e password obbligatorie' });
    }

    // Recupera utente
    const [users] = await db.query(
      'SELECT * FROM utenti WHERE email = ?',
      [email.toLowerCase()]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Credenziali non valide' });
    }

    const user = users[0];

    // Verifica blacklist
    if (user.in_blacklist) {
      const oggi = new Date();
      const dataFine = new Date(user.data_fine_blacklist);
      
      if (oggi > dataFine) {
        // Rimuovi dalla blacklist
        await db.query(
          'UPDATE utenti SET in_blacklist = FALSE, data_fine_blacklist = NULL WHERE id_utente = ?',
          [user.id_utente]
        );
        user.in_blacklist = false;
      } else {
        return res.status(403).json({ 
          error: 'Account in blacklist',
          data_fine: user.data_fine_blacklist
        });
      }
    }

    // Verifica password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Credenziali non valide' });
    }

    // Genera token JWT
    const token = jwt.sign(
      { 
        id_utente: user.id_utente,
        email: user.email,
        tipo_utente: user.tipo_utente,
        livello_accesso: user.livello_accesso
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id_utente: user.id_utente,
        email: user.email,
        nome: user.nome,
        cognome: user.cognome,
        tipo_utente: user.tipo_utente,
        livello_accesso: user.livello_accesso
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Errore durante il login' });
  }
});

module.exports = router;
