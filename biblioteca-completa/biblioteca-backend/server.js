// server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// Routes
const authRoutes = require('./routes/auth');
const materialiRoutes = require('./routes/materiali');
const prestitiRoutes = require('./routes/prestiti');
const utentiRoutes = require('./routes/utenti');
const dispositiviRoutes = require('./routes/dispositivi');
const impegniRoutes = require('./routes/impegni');
const adminRoutes = require('./routes/admin');

app.use('/api/auth', authRoutes);
app.use('/api/materiali', materialiRoutes);
app.use('/api/prestiti', prestitiRoutes);
app.use('/api/utenti', utentiRoutes);
app.use('/api/dispositivi', dispositiviRoutes);
app.use('/api/impegni', impegniRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server attivo' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Errore interno del server',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.listen(PORT, () => {
  console.log(`Server in ascolto sulla porta ${PORT}`);
});
