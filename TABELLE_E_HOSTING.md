# 📋 DOCUMENTO RIEPILOGATIVO - Sistema Biblioteca Scolastica

## 🗄️ STRUTTURA TABELLE DATABASE

### 1. TABELLA: `utenti`
**Scopo**: Gestione account utenti (studenti, docenti, bibliotecari, master)

| Campo | Tipo | Descrizione | Note |
|-------|------|-------------|------|
| id_utente | INT PK | ID univoco utente | Auto-incrementale |
| email | VARCHAR(255) UNIQUE | Email login | NOT NULL, lowercase |
| password_hash | VARCHAR(255) | Password hashata bcrypt | NOT NULL |
| nome | VARCHAR(100) | Nome utente | NOT NULL |
| cognome | VARCHAR(100) | Cognome utente | NOT NULL |
| tipo_utente | ENUM | studente/docente/bibliotecario/master | NOT NULL |
| livello_accesso | INT | 0/320/999 | Default 0 |
| in_blacklist | BOOLEAN | Flag blacklist | Default FALSE |
| data_fine_blacklist | DATE | Scadenza blacklist | NULL se non in blacklist |
| data_registrazione | TIMESTAMP | Data iscrizione | Auto |

**Indici**: email, blacklist, tipo
**Formattazione dati**: 
- email → LOWERCASE prima dell'inserimento
- password → bcrypt hash (salt rounds: 10)

---

### 2. TABELLA: `materiali`
**Scopo**: Catalogo completo biblioteca (libri, riviste, dizionari)

| Campo | Tipo | Descrizione | Note |
|-------|------|-------------|------|
| id_materiale | INT PK | ID univoco materiale | Auto-incrementale |
| tipo_materiale | ENUM | libro/rivista/dizionario | NOT NULL |
| titolo | VARCHAR(500) | Titolo completo | NOT NULL |
| id_editore | INT FK | Riferimento case_editrici | NULL consentito |
| id_lingua | INT FK | Riferimento lingue | NOT NULL |
| anno_pubblicazione | YEAR | Anno pubblicazione | NULL consentito |
| data_pubblicazione | DATE | Data specifica (riviste) | NULL consentito |
| codice_isbn | VARCHAR(13) | Codice ISBN 10-13 caratteri | NULL, UPPERCASE |
| codice_dewey | VARCHAR(10) FK | Classificazione Dewey | NULL consentito |
| armadio | VARCHAR(50) | Posizione armadio | NULL consentito |
| ripiano | VARCHAR(50) | Posizione ripiano | NULL consentito |
| immagine_copertina | VARCHAR(500) | URL immagine | NULL consentito |
| trama | TEXT | Sinossi/descrizione | NULL consentito |
| copie_totali | INT | Numero copie totali | Default 1 |
| copie_disponibili | INT | Copie disponibili ora | Default 1 |
| data_inserimento | TIMESTAMP | Data aggiunta catalogo | Auto |

**Indici**: tipo, disponibilità, ISBN, titolo (fulltext)
**Formattazione dati**:
- codice_isbn → UPPERCASE
- titolo → NO formattazione (preserva maiuscole/minuscole)

**Relazioni**:
- `materiali_autori` (many-to-many con `autori`)
- `materiali_generi` (many-to-many con `generi`)

---

### 3. TABELLA: `prestiti`
**Scopo**: Gestione prenotazioni e prestiti materiali

| Campo | Tipo | Descrizione | Note |
|-------|------|-------------|------|
| id_prestito | INT PK | ID univoco prestito | Auto-incrementale |
| id_materiale | INT FK | Materiale prestato | NOT NULL |
| id_utente | INT FK | Utente richiedente | NOT NULL |
| id_bibliotecario | INT FK | Bibliotecario che gestisce | NULL fino a ritiro |
| codice_prenotazione | VARCHAR(20) UNIQUE | Codice univoco per ritiro | NOT NULL, generato |
| data_prenotazione | TIMESTAMP | Data richiesta | Auto |
| data_ritiro | DATE | Data ritiro effettivo | NULL fino a ritiro |
| data_prevista_restituzione | DATE | Scadenza restituzione | Calcolata (oggi + giorni_prestito) |
| data_restituzione_effettiva | DATE | Data restituzione reale | NULL fino a restituzione |
| stato | ENUM | prenotato/ritirato/restituito/annullato | Default 'prenotato' |
| tipo_prestito | ENUM | personale/classe | Default 'personale' |
| note | TEXT | Note aggiuntive | NULL consentito |

**Indici**: stato, utente, date, codice
**Formattazione dati**:
- codice_prenotazione → Formato: PREST-{timestamp}-{random}
- Esempio: PREST-1707567890-XY3K9M

**Stati prestito**:
1. **prenotato** → Utente prenota, attende ritiro
2. **ritirato** → Bibliotecario conferma ritiro con codice
3. **restituito** → Bibliotecario conferma restituzione
4. **annullato** → Utente annulla prima del ritiro

---

### 4. TABELLA: `blacklist_log`
**Scopo**: Storico inserimenti blacklist con motivazioni

| Campo | Tipo | Descrizione | Note |
|-------|------|-------------|------|
| id_log | INT PK | ID univoco log | Auto-incrementale |
| id_utente | INT FK | Utente bannato | NOT NULL |
| motivo | ENUM | ritardo_restituzione/mancato_ritiro | NOT NULL |
| data_inserimento | TIMESTAMP | Data inserimento blacklist | Auto |
| data_scadenza | DATE | Data fine blacklist | NOT NULL |
| id_prestito | INT FK | Prestito che ha causato ban | NULL consentito |

**Trigger automatici**:
- Ritardo > 30 giorni → blacklist 90 giorni
- Mancati ritiri ≥ 3 → blacklist 90 giorni

---

### 5. TABELLA: `case_editrici`
**Scopo**: Anagrafica editori

| Campo | Tipo | Descrizione |
|-------|------|-------------|
| id_editore | INT PK | ID univoco |
| nome | VARCHAR(255) UNIQUE | Nome casa editrice |

**Formattazione**: nome → UPPERCASE

---

### 6. TABELLA: `autori`
**Scopo**: Anagrafica autori

| Campo | Tipo | Descrizione |
|-------|------|-------------|
| id_autore | INT PK | ID univoco |
| nome | VARCHAR(100) | Nome autore |
| cognome | VARCHAR(100) | Cognome autore |

**Vincolo**: UNIQUE (nome, cognome)
**Formattazione**: Mantiene maiuscole/minuscole originali

---

### 7. TABELLA: `lingue`
**Scopo**: Lingue supportate

| Campo | Tipo | Descrizione |
|-------|------|-------------|
| id_lingua | INT PK | ID univoco |
| codice | VARCHAR(10) UNIQUE | Codice ISO (IT, EN, FR...) |
| nome | VARCHAR(50) | Nome lingua |

**Formattazione**: codice → UPPERCASE

---

### 8. TABELLA: `generi`
**Scopo**: Generi letterari

| Campo | Tipo | Descrizione |
|-------|------|-------------|
| id_genere | INT PK | ID univoco |
| nome | VARCHAR(100) UNIQUE | Nome genere |

**Esempi**: Narrativa, Fantasy, Giallo, Thriller, Poesia...

---

### 9. TABELLA: `codici_dewey`
**Scopo**: Sistema classificazione Dewey

| Campo | Tipo | Descrizione |
|-------|------|-------------|
| codice_dewey | VARCHAR(10) PK | Codice Dewey |
| descrizione | VARCHAR(255) | Descrizione categoria |
| categoria_principale | VARCHAR(100) | Macro-categoria |

**Esempi**:
- 000 → Informatica (Generalità)
- 500 → Scienze pure (Scienze)
- 800 → Letteratura (Letteratura)

---

### 10. TABELLA: `dispositivi`
**Scopo**: Catalogo dispositivi elettronici

| Campo | Tipo | Descrizione |
|-------|------|-------------|
| id_dispositivo | INT PK | ID univoco |
| nome | VARCHAR(255) | Nome dispositivo |
| tipo | VARCHAR(100) | Tipo (tablet, laptop, proiettore...) |
| codice_identificativo | VARCHAR(50) UNIQUE | Codice interno |
| id_location | INT FK | Posizione (armadio/aula/carrello) |
| disponibile | BOOLEAN | Disponibilità |
| note | TEXT | Note aggiuntive |

---

### 11. TABELLA: `location`
**Scopo**: Location dispositivi e materiali

| Campo | Tipo | Descrizione |
|-------|------|-------------|
| id_location | INT PK | ID univoco |
| tipo_location | ENUM | armadio/aula/carrello |
| nome | VARCHAR(100) | Nome location |
| descrizione | TEXT | Descrizione |

---

### 12. TABELLA: `impegni_scolastici`
**Scopo**: Calendario eventi e impegni

| Campo | Tipo | Descrizione |
|-------|------|-------------|
| id_impegno | INT PK | ID univoco |
| titolo | VARCHAR(255) | Titolo impegno |
| descrizione | TEXT | Descrizione completa |
| data_inizio | DATETIME | Data/ora inizio |
| data_fine | DATETIME | Data/ora fine |
| tipo_impegno | ENUM | open_day/collegio_docenti/riunione/evento/altro |
| id_docente | INT FK | Docente organizzatore |
| visibile_a | ENUM | tutti/docenti/specifico |

---

### 13. TABELLA: `impostazioni`
**Scopo**: Configurazioni sistema

| Campo | Tipo | Descrizione |
|-------|------|-------------|
| chiave | VARCHAR(100) PK | Chiave impostazione |
| valore | VARCHAR(500) | Valore impostazione |
| descrizione | TEXT | Descrizione |
| tipo_dato | ENUM | int/string/boolean/date |

**Impostazioni principali**:
- `prestiti_max_personali`: 3 (prestiti contemporanei)
- `giorni_prestito`: 30 (durata prestito)
- `giorni_blacklist`: 90 (durata ban)
- `giorni_promemoria_email`: 7 (frequenza reminder)
- `mancati_ritiri_blacklist`: 3 (soglia ban)

---

### 14. TABELLA: `avvisi`
**Scopo**: Sistema notifiche/avvisi

| Campo | Tipo | Descrizione |
|-------|------|-------------|
| id_avviso | INT PK | ID univoco |
| titolo | VARCHAR(255) | Titolo avviso |
| messaggio | TEXT | Contenuto avviso |
| data_pubblicazione | TIMESTAMP | Data pubblicazione |
| data_scadenza | DATE | Data scadenza visualizzazione |
| id_creatore | INT FK | Bibliotecario che ha creato |
| priorita | ENUM | bassa/media/alta |

---

## 🌐 HOSTING GRATUITO - GUIDA PASSO PASSO

### OPZIONE 1: Render.com + PlanetScale (100% GRATUITO)

#### Step 1: Database (PlanetScale)
1. Vai su https://planetscale.com
2. Sign up → Verifica email
3. New Database → Nome: `biblioteca_scolastica`
4. Create Database
5. Connect → Genera password
6. Copia connection string:
   ```
   mysql://user:pass@host.us-east-4.psdb.cloud/biblioteca_scolastica?sslaccept=strict
   ```
7. Usa PlanetScale CLI per importare schema:
   ```bash
   pscale shell biblioteca_scolastica main < database_schema.sql
   ```

#### Step 2: Backend (Render.com)
1. Push progetto su GitHub:
   ```bash
   cd biblioteca-backend
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/tuousername/biblioteca-backend.git
   git push -u origin main
   ```

2. Vai su https://render.com → Sign up
3. New → Web Service
4. Connect GitHub → Seleziona repo
5. Configurazione:
   - **Name**: biblioteca-backend
   - **Environment**: Node
   - **Region**: Frankfurt (EU) o Ohio (US)
   - **Branch**: main
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free

6. Environment Variables (Add from .env):
   ```
   DB_HOST=host.us-east-4.psdb.cloud
   DB_USER=your_user
   DB_PASSWORD=your_password
   DB_NAME=biblioteca_scolastica
   JWT_SECRET=cambia_questo_con_stringa_random_sicura_32caratteri
   PORT=10000
   NODE_ENV=production
   ```

7. Create Web Service → Attendi deploy (5-10 min)
8. Copia URL: `https://biblioteca-backend-xxx.onrender.com`

#### Step 3: Frontend (Render.com)
1. Push frontend su GitHub (separato o stesso repo):
   ```bash
   cd biblioteca-frontend
   # Modifica js/config.js con URL backend Render
   # const API_BASE_URL = 'https://biblioteca-backend-xxx.onrender.com/api';
   git init
   git add .
   git commit -m "Initial commit"
   git push
   ```

2. Render.com → New → Static Site
3. Connect GitHub → Seleziona repo
4. Configurazione:
   - **Name**: biblioteca-frontend
   - **Build Command**: (vuoto)
   - **Publish Directory**: `.` o `biblioteca-frontend`

5. Create Static Site
6. URL finale: `https://biblioteca-frontend-xxx.onrender.com`

**✅ FATTO! Sistema online 100% gratuito**

---

### OPZIONE 2: Vercel (Frontend) + Railway (Backend+DB)

#### Railway (Backend + MySQL)
1. https://railway.app → Sign up GitHub
2. New Project → Deploy MySQL
3. Copia credenziali MySQL
4. New → GitHub Repo → biblioteca-backend
5. Settings → Variables:
   ```
   DATABASE_URL=mysql://user:pass@host/dbname
   JWT_SECRET=...
   ```
6. Deploy automatico
7. Settings → Networking → Generate Domain

#### Vercel (Frontend)
```bash
npm install -g vercel
cd biblioteca-frontend
vercel --prod
```

---

### OPZIONE 3: Hosting Tradizionale (InfinityFree)

1. Registrati su https://infinityfree.net
2. Create Account → Scegli subdomain
3. Upload file via FileZilla/cPanel
4. Crea database MySQL da cPanel
5. Importa `database_schema.sql`
6. Modifica configurazioni con credenziali

**Limiti**: No Node.js nativo (solo PHP)
**Soluzione**: Converti backend a PHP o usa servizi esterni

---

## 🔐 SICUREZZA - BEST PRACTICES

### Password Default da Cambiare
```sql
-- Admin default (CAMBIARE SUBITO!)
UPDATE utenti 
SET password_hash = '$2a$10$NUOVO_HASH_QUI' 
WHERE email = 'admin@biblioteca.it';
```

### Genera JWT Secret Sicuro
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### SSL/HTTPS
- Render/Vercel: Automatico ✅
- Hosting custom: Let's Encrypt gratuito

### Backup Database
```bash
# Automatico ogni 24h (crea script cron)
mysqldump -u user -p biblioteca_scolastica > backup_$(date +%Y%m%d).sql
```

---

## 📊 MONITORING POST-DEPLOY

### Health Check Endpoint
```bash
curl https://your-backend.onrender.com/api/health
# Risposta attesa: {"status":"OK","message":"Server attivo"}
```

### Test Login
```bash
curl -X POST https://your-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@biblioteca.it","password":"admin123"}'
```

### Logs
- Render: Dashboard → Logs tab
- Railway: Project → Logs
- Vercel: Project → Logs

---

## 🆘 TROUBLESHOOTING COMUNE

### "Cannot connect to database"
✅ Verifica variabili ambiente
✅ Controlla firewall/whitelist IP
✅ Test connessione: `mysql -h host -u user -p`

### "CORS error"
✅ Aggiungi origin frontend in backend:
```javascript
app.use(cors({
  origin: ['https://your-frontend.com']
}));
```

### "503 Service Unavailable"
✅ Render free tier va in sleep dopo 15 min
✅ Prima richiesta risveglia server (30 sec)
✅ Considera Render paid ($7/mese) per always-on

### "Database connection timeout"
✅ PlanetScale sleep mode
✅ Reconnect automatico nel codice
✅ Usa connection pooling

---

## 📧 SUPPORTO

**Email**: biblioteca@scuola.it
**GitHub**: [repository-url]
**Docs**: README.md completo nel progetto

---

**Sistema pronto all'uso! 🚀📚**
