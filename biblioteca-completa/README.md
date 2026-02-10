# 📚 Sistema Gestione Biblioteca Scolastica

Sistema completo per la gestione di una biblioteca scolastica con funzionalità di prenotazione libri, gestione dispositivi elettronici e calendario impegni.

## 🚀 Caratteristiche Principali

### Per Studenti e Docenti
- ✅ Visualizzazione catalogo completo (libri, riviste, dizionari)
- ✅ Prenotazione materiali con codice univoco
- ✅ Gestione prestiti personali (max 3 contemporanei)
- ✅ Annullamento prenotazioni anticipato
- ✅ Lista attesa per materiali non disponibili con notifica email
- ✅ Richiesta dispositivi elettronici
- ✅ Calendario impegni scolastici

### Per Docenti (Funzionalità Aggiuntive)
- ✅ Prenotazione multipla per attività di classe
- ✅ Selezione classe e studenti per assegnazione materiali
- ✅ Creazione eventi e impegni personalizzati

### Per Bibliotecari (Livello 320)
- ✅ Aggiunta/rimozione materiali dal catalogo
- ✅ Gestione prestiti e restituzioni con codice validazione
- ✅ Visualizzazione e gestione blacklist
- ✅ Invio avvisi speciali
- ✅ Statistiche utilizzo biblioteca
- ✅ Gestione dispositivi e location
- ✅ Modifica impostazioni sistema

### Sistema Blacklist
- ⚠️ Inserimento automatico per ritardi restituzione (>30 giorni)
- ⚠️ Blacklist per mancati ritiri ripetuti
- ⚠️ Durata configurabile (default 90 giorni)
- ⚠️ Blocco prestiti durante il periodo di blacklist

## 📋 Requisiti di Sistema

### Backend
- Node.js 16+ 
- MySQL 5.7+ o MariaDB 10.3+
- npm o yarn

### Frontend
- Browser moderno (Chrome, Firefox, Safari, Edge)
- JavaScript abilitato

## 🛠️ Installazione

### 1. Database Setup

```bash
# Accedi a MySQL
mysql -u root -p

# Crea il database e importa lo schema
CREATE DATABASE biblioteca_scolastica;
USE biblioteca_scolastica;

# Esegui lo script SQL fornito
source database_schema.sql
```

### 2. Backend Setup

```bash
# Naviga nella cartella backend
cd biblioteca-backend

# Installa dipendenze
npm install

# Copia e configura file .env
cp .env.example .env

# Modifica .env con le tue credenziali:
# - DB_HOST, DB_USER, DB_PASSWORD, DB_NAME
# - JWT_SECRET (genera una stringa casuale sicura)
# - EMAIL_HOST, EMAIL_USER, EMAIL_PASSWORD (per notifiche email)

# Avvia il server
npm start

# Oppure in modalità sviluppo con auto-reload:
npm run dev
```

Il server sarà disponibile su `http://localhost:3000`

### 3. Frontend Setup

```bash
# Naviga nella cartella frontend
cd biblioteca-frontend

# Modifica js/config.js se necessario (default: localhost:3000)

# Apri index.html nel browser o usa un server locale:
# Opzione 1: Live Server (VS Code extension)
# Opzione 2: Python
python -m http.server 8080

# Opzione 3: Node.js http-server
npx http-server -p 8080
```

Il frontend sarà disponibile su `http://localhost:8080`

## 🌐 Hosting Gratuito

### Opzione 1: Render.com (Consigliato)

**Backend:**
1. Crea account su https://render.com
2. New → Web Service
3. Connetti repository GitHub
4. Configura:
   - Build Command: `cd biblioteca-backend && npm install`
   - Start Command: `cd biblioteca-backend && npm start`
   - Aggiungi variabili d'ambiente (.env)
5. Deploy gratuito con sleep dopo 15 min inattività

**Database:**
1. Render → New → PostgreSQL (MySQL non disponibile free)
   - Alternativa: Usa PlanetScale o Railway per MySQL gratuito

**Frontend:**
1. Render → New → Static Site
2. Build Command: `echo "No build needed"`
3. Publish Directory: `biblioteca-frontend`

### Opzione 2: Railway.app

1. Crea account su https://railway.app
2. New Project → Deploy from GitHub
3. Aggiungi MySQL database dal marketplace
4. Configura variabili d'ambiente
5. Deploy automatico ad ogni push
6. 500 ore/mese gratuite

### Opzione 3: Vercel + PlanetScale

**Frontend (Vercel):**
```bash
npm install -g vercel
cd biblioteca-frontend
vercel
```

**Backend (Vercel Serverless):**
- Richiede conversione a serverless functions
- Documentazione: https://vercel.com/docs/functions

**Database (PlanetScale):**
1. Crea account su https://planetscale.com
2. New Database
3. Ottieni connection string
4. 5GB storage gratuito

### Opzione 4: Cyclic.sh + MongoDB Atlas

**Backend:**
1. https://cyclic.sh → Deploy
2. Connetti GitHub repo
3. Free hosting per Node.js

**Database:**
- Richiede conversione a MongoDB
- MongoDB Atlas: 512MB gratuito

### Opzione 5: Hosting Tradizionale

**Provider con tier gratuiti:**
- **InfinityFree**: Hosting PHP/MySQL gratuito
- **000webhost**: Hosting con MySQL
- **Heroku**: 1000 ore/mese (richiede carta)
- **Fly.io**: Free tier generoso

## 📊 Schema Database

### Tabelle Principali

**utenti**
- Gestione utenti con livelli accesso
- Tracking blacklist
- Campi: id_utente, email, password_hash, nome, cognome, tipo_utente, livello_accesso, in_blacklist, data_fine_blacklist

**materiali**
- Catalogo completo biblioteca
- Supporta libri, riviste, dizionari
- Campi: id_materiale, tipo_materiale, titolo, autori, editore, ISBN, codice_dewey, posizione (armadio/ripiano), copie

**prestiti**
- Gestione prestiti con stati
- Codice prenotazione univoco
- Stati: prenotato, ritirato, restituito, annullato
- Tracking date e bibliotecario responsabile

**blacklist_log**
- Storico inserimenti blacklist
- Motivi: ritardo_restituzione, mancato_ritiro

**dispositivi**
- Catalogo dispositivi elettronici
- Tracking location e disponibilità

**impegni_scolastici**
- Calendario eventi e impegni
- Visibilità configurabile

### Relazioni

- `materiali_autori`: Many-to-many libri-autori
- `materiali_generi`: Many-to-many libri-generi
- `prestiti_classe`: Tracking studenti in prestiti per classe
- `lista_attesa`: Notifiche disponibilità materiali

## 🔐 Livelli Accesso

| Livello | Tipo | Permessi |
|---------|------|----------|
| 0 | Studente/Docente | Prenotazione, visualizzazione |
| 320 | Bibliotecario | + Gestione materiali, prestiti, blacklist |
| 999 | Master | + Tutte le funzionalità admin |

## 📝 API Endpoints

### Autenticazione
- `POST /api/auth/register` - Registrazione
- `POST /api/auth/login` - Login

### Materiali
- `GET /api/materiali` - Lista materiali
- `GET /api/materiali/:id` - Dettaglio materiale
- `POST /api/materiali` - Nuovo materiale (320+)
- `PUT /api/materiali/:id` - Aggiorna materiale (320+)
- `DELETE /api/materiali/:id` - Elimina materiale (320+)

### Prestiti
- `GET /api/prestiti/miei` - Prestiti utente
- `POST /api/prestiti` - Nuova prenotazione
- `PUT /api/prestiti/:id/ritiro` - Conferma ritiro (320+)
- `PUT /api/prestiti/:id/restituzione` - Conferma restituzione (320+)
- `DELETE /api/prestiti/:id` - Annulla prenotazione

### Admin
- `GET /api/admin/blacklist` - Lista blacklist (320+)
- `GET /api/admin/statistiche` - Statistiche (320+)
- `POST /api/admin/avvisi` - Nuovo avviso (320+)
- `GET/PUT /api/admin/impostazioni` - Gestione impostazioni (320+)

## 🎯 Utilizzo

### Primo Accesso

1. **Registrati** come studente o docente
2. **Login** con le credenziali
3. **Esplora il catalogo** e cerca materiali
4. **Prenota** materiali disponibili

### Prenotazione Materiale

1. Cerca materiale nel catalogo
2. Click su materiale per dettagli
3. Click "Prenota Ora"
4. **Salva il codice prenotazione** fornito
5. Presenta il codice al bibliotecario per il ritiro

### Ritiro Materiale (Bibliotecario)

1. Vai su Admin → Prestiti
2. Cerca prenotazione
3. Verifica codice fornito dall'utente
4. Click "Conferma Ritiro"

### Restituzione (Bibliotecario)

1. Verifica codice prenotazione
2. Click "Conferma Restituzione"
3. Sistema controlla automaticamente ritardi
4. Inserimento automatico in blacklist se necessario

### Gestione Blacklist

- **Automatica**: Ritardi >30 giorni o mancati ritiri ripetuti
- **Durata**: 90 giorni (configurabile)
- **Rimozione**: Admin → Blacklist → Rimuovi

### Impostazioni Configurabili

- Prestiti massimi contemporanei (default: 3)
- Durata prestito (default: 30 giorni)
- Giorni blacklist (default: 90)
- Frequenza promemoria email (default: 7 giorni)

## 🛡️ Sicurezza

- Password hashate con bcrypt
- JWT per autenticazione
- Validazione input su tutti gli endpoint
- Protezione SQL injection (parametrized queries)
- Controllo permessi a livello middleware

## 📧 Email Notifications

Configura SMTP nel file .env:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=biblioteca@scuola.it
EMAIL_PASSWORD=app_password
```

### Setup Gmail:
1. Abilita 2FA sul tuo account Gmail
2. Genera App Password: https://myaccount.google.com/apppasswords
3. Usa la password generata in EMAIL_PASSWORD

## 🔧 Troubleshooting

### Errore connessione database
- Verifica credenziali in .env
- Controlla che MySQL sia in esecuzione
- Verifica nome database corretto

### Errore CORS
- Aggiungi origin frontend in backend/server.js
```javascript
app.use(cors({
  origin: 'http://localhost:8080'
}));
```

### Token non valido
- Cancella localStorage nel browser
- Effettua nuovo login

### Blacklist non funziona
- Esegui job: `POST /api/admin/jobs/verifica-ritardi`
- Configura cron job per esecuzione automatica

## 📈 Sviluppi Futuri

- [ ] Generazione etichette QR per materiali
- [ ] Scansione barcode/QR per ritiro/restituzione
- [ ] Dashboard analytics avanzata
- [ ] Integrazione calendario Google
- [ ] Notifiche push web
- [ ] App mobile (React Native)
- [ ] Sistema recensioni materiali
- [ ] Suggerimenti personalizzati AI

## 📄 Licenza

MIT License - Uso libero per scopi educativi e non commerciali

## 👥 Supporto

Per problemi o domande:
- Apri issue su GitHub
- Email: biblioteca@scuola.it

---

**Sviluppato per scuole che vogliono digitalizzare la gestione della biblioteca** 📚✨
