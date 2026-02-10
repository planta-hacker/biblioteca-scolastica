# 🚀 Guida Rapida Installazione

## ⚡ Setup Veloce (5 minuti)

### 1. Database (2 min)
```bash
mysql -u root -p
CREATE DATABASE biblioteca_scolastica;
USE biblioteca_scolastica;
source database_schema.sql;
exit;
```

### 2. Backend (2 min)
```bash
cd biblioteca-backend
npm install
cp .env.example .env
# Modifica .env con le tue credenziali MySQL
npm start
```

### 3. Frontend (1 min)
```bash
cd biblioteca-frontend
# Opzione A: Apri index.html nel browser
# Opzione B: Server locale
python -m http.server 8080
# Vai su http://localhost:8080
```

### 4. Login Iniziale
- Email: `admin@biblioteca.it`
- Password: `admin123`

**⚠️ IMPORTANTE: Cambia la password admin dopo il primo login!**

---

## 🌐 Hosting Gratuito (Metodo più Semplice)

### Render.com (Tutto Incluso)

**1. Database MySQL (Alternativa: PlanetScale)**
```bash
# Iscriviti a PlanetScale: https://planetscale.com
# Crea nuovo database
# Ottieni connection string
# Esempio: mysql://user:pass@host.planetscale.cloud/dbname?sslaccept=strict
```

**2. Backend su Render**
1. Vai su https://render.com
2. New → Web Service
3. Connect GitHub repo (carica il progetto)
4. Settings:
   - Name: biblioteca-backend
   - Environment: Node
   - Build Command: `cd biblioteca-backend && npm install`
   - Start Command: `cd biblioteca-backend && npm start`
   - Instance Type: Free
5. Environment Variables:
   ```
   DB_HOST=your_planetscale_host
   DB_USER=your_planetscale_user
   DB_PASSWORD=your_planetscale_password
   DB_NAME=biblioteca_scolastica
   JWT_SECRET=your_random_secret_key_here
   PORT=3000
   NODE_ENV=production
   ```
6. Deploy!

**3. Frontend su Render**
1. New → Static Site
2. Connect stesso repo
3. Settings:
   - Name: biblioteca-frontend
   - Build Command: `echo "No build"`
   - Publish Directory: `biblioteca-frontend`
4. Dopo deploy, copia URL (es. https://biblioteca-frontend.onrender.com)
5. Modifica `biblioteca-frontend/js/config.js`:
   ```javascript
   const API_BASE_URL = 'https://biblioteca-backend.onrender.com/api';
   ```
6. Commit e push → rideploy automatico

**✅ Done! Il tuo sito è online gratis!**

---

## 📱 Accesso Rapido

### URL Produzione
- Frontend: https://biblioteca-frontend.onrender.com
- Backend API: https://biblioteca-backend.onrender.com/api

### Test Locale
- Frontend: http://localhost:8080
- Backend: http://localhost:3000

---

## 🔧 Troubleshooting Comuni

### "Cannot connect to database"
```bash
# Verifica credenziali .env
# Test connessione
mysql -h your_host -u your_user -p your_database
```

### "CORS error"
```javascript
// In backend/server.js aggiungi:
app.use(cors({
  origin: ['http://localhost:8080', 'https://your-frontend-url.com']
}));
```

### "Token expired"
```javascript
// Nel browser (F12 → Console):
localStorage.clear();
// Poi ricarica pagina e rifai login
```

---

## 📊 Struttura Tabelle (Riferimento Veloce)

### Tabelle Principali
- `utenti` - Account (studenti, docenti, bibliotecari)
- `materiali` - Catalogo (libri, riviste, dizionari)
- `prestiti` - Prenotazioni e prestiti
- `blacklist_log` - Utenti bannati temporaneamente
- `dispositivi` - Tablet, laptop, etc.
- `impegni_scolastici` - Calendario eventi

### Livelli Accesso
- **0**: Studente/Docente base
- **320**: Bibliotecario
- **999**: Master admin

---

## 💡 Tips

### Backup Database
```bash
mysqldump -u root -p biblioteca_scolastica > backup.sql
```

### Ripristino
```bash
mysql -u root -p biblioteca_scolastica < backup.sql
```

### Test API con cURL
```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@biblioteca.it","password":"admin123"}'

# Lista materiali (usa il token ricevuto)
curl http://localhost:3000/api/materiali \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Monitoring
```bash
# Logs server
npm start | tee server.log

# Monitor in tempo reale
tail -f server.log
```

---

## 🎯 Prossimi Passi

1. ✅ Cambia password admin
2. ✅ Configura email SMTP per notifiche
3. ✅ Aggiungi primi libri al catalogo
4. ✅ Crea account bibliotecari
5. ✅ Testa prenotazione e restituzione
6. ✅ Configura backup automatici

---

## 📞 Supporto

- 📧 Email: support@biblioteca.it
- 📚 Docs: README.md completo
- 🐛 Issues: GitHub repository

**Buon lavoro con la tua biblioteca digitale! 📚✨**
