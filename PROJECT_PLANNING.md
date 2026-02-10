# 📊 Pianificazione Progetto - Sistema Biblioteca Scolastica

## 1. WBS (Work Breakdown Structure)

### Livello 1: Progetto Sistema Biblioteca

#### 1.1 Analisi e Progettazione (40 ore)
- 1.1.1 Raccolta requisiti (8h)
  - Interviste stakeholder
  - Definizione funzionalità
  - Casi d'uso
- 1.1.2 Progettazione database (12h)
  - Schema ER
  - Normalizzazione
  - Indici e ottimizzazioni
- 1.1.3 Progettazione architettura (10h)
  - API design
  - Flussi utente
  - Wireframe UI
- 1.1.4 Documentazione tecnica (10h)
  - Specifiche tecniche
  - Diagrammi UML
  - Piano di test

#### 1.2 Sviluppo Database (20 ore)
- 1.2.1 Creazione schema (6h)
  - Tabelle principali
  - Relazioni
  - Vincoli
- 1.2.2 Stored procedures e trigger (6h)
  - Automazioni blacklist
  - Calcoli statistiche
  - Validazioni
- 1.2.3 Dati iniziali (4h)
  - Codici Dewey
  - Lingue e generi
  - Utenti admin
- 1.2.4 Testing e ottimizzazione (4h)
  - Query performance
  - Indici
  - Backup procedures

#### 1.3 Sviluppo Backend (60 ore)
- 1.3.1 Setup progetto (6h)
  - Inizializzazione Node.js
  - Configurazione dipendenze
  - Struttura cartelle
- 1.3.2 Autenticazione (10h)
  - Sistema JWT
  - Hash password
  - Middleware auth
- 1.3.3 API Materiali (12h)
  - CRUD completo
  - Filtri ricerca
  - Gestione immagini
- 1.3.4 API Prestiti (14h)
  - Prenotazioni
  - Ritiro/restituzione
  - Validazioni business logic
- 1.3.5 Sistema Blacklist (8h)
  - Automazioni
  - Jobs schedulati
  - Email notifiche
- 1.3.6 API Admin (10h)
  - Statistiche
  - Gestione utenti
  - Impostazioni

#### 1.4 Sviluppo Frontend (50 ore)
- 1.4.1 Setup e struttura (6h)
  - HTML base
  - CSS framework
  - JS modules
- 1.4.2 Autenticazione UI (8h)
  - Login/registrazione
  - Gestione sessione
  - Protezione routes
- 1.4.3 Catalogo e ricerca (12h)
  - Grid materiali
  - Filtri dinamici
  - Dettaglio materiale
- 1.4.4 Sistema prestiti (10h)
  - Form prenotazione
  - Lista prestiti
  - Annullamenti
- 1.4.5 Pannello admin (10h)
  - Dashboard statistiche
  - Gestione materiali
  - Blacklist UI
- 1.4.6 Responsive e UX (4h)
  - Mobile optimization
  - Loading states
  - Error handling

#### 1.5 Testing (30 ore)
- 1.5.1 Unit testing backend (10h)
  - Test API endpoints
  - Test business logic
  - Coverage report
- 1.5.2 Integration testing (8h)
  - Test flussi completi
  - Test database
  - Test autenticazione
- 1.5.3 Frontend testing (6h)
  - Test UI components
  - Test interazioni
  - Cross-browser testing
- 1.5.4 User acceptance testing (6h)
  - Test con utenti reali
  - Raccolta feedback
  - Bug fixing

#### 1.6 Deployment e Documentazione (25 ore)
- 1.6.1 Setup hosting (8h)
  - Configurazione server
  - Deploy database
  - Deploy applicazione
- 1.6.2 Configurazione produzione (6h)
  - SSL/HTTPS
  - Variabili ambiente
  - Backup automatici
- 1.6.3 Documentazione utente (6h)
  - Manuale studenti/docenti
  - Manuale bibliotecari
  - FAQ
- 1.6.4 Documentazione tecnica (5h)
  - README
  - API documentation
  - Deployment guide

#### 1.7 Manutenzione e Support (Continuativo)
- 1.7.1 Bug fixes
- 1.7.2 Aggiornamenti sicurezza
- 1.7.3 Nuove funzionalità
- 1.7.4 Supporto utenti

**TOTALE ORE PROGETTO: 225 ore**

---

## 2. Gantt Chart (Pianificazione Temporale)

### Timeline: 12 Settimane (3 mesi)

```
SETTIMANA 1-2: ANALISI E PROGETTAZIONE
├─ Sett. 1
│  ├─ Lun-Mar: Raccolta requisiti (16h)
│  ├─ Mer-Gio: Progettazione DB inizio (16h)
│  └─ Ven: Review e validazione (8h)
└─ Sett. 2
   ├─ Lun-Mar: Progettazione DB completo (16h)
   ├─ Mer-Gio: Architettura sistema (16h)
   └─ Ven: Documentazione (8h)

SETTIMANA 3: DATABASE
├─ Lun-Mar: Creazione schema (16h)
├─ Mer: Stored procedures (8h)
├─ Gio: Dati iniziali (8h)
└─ Ven: Testing DB (8h)

SETTIMANA 4-6: BACKEND (FASE 1)
├─ Sett. 4
│  ├─ Lun: Setup progetto (8h)
│  ├─ Mar-Mer: Autenticazione (16h)
│  └─ Gio-Ven: API Materiali inizio (16h)
├─ Sett. 5
│  ├─ Lun-Mar: API Materiali completo (16h)
│  ├─ Mer-Gio: API Prestiti (16h)
│  └─ Ven: Testing (8h)
└─ Sett. 6
   ├─ Lun-Mar: Sistema Blacklist (16h)
   ├─ Mer-Gio: API Admin (16h)
   └─ Ven: Integration testing (8h)

SETTIMANA 7-9: FRONTEND (FASE 1)
├─ Sett. 7
│  ├─ Lun: Setup frontend (8h)
│  ├─ Mar-Mer: Autenticazione UI (16h)
│  └─ Gio-Ven: Catalogo inizio (16h)
├─ Sett. 8
│  ├─ Lun-Mar: Catalogo completo (16h)
│  ├─ Mer-Gio: Sistema prestiti (16h)
│  └─ Ven: Testing UI (8h)
└─ Sett. 9
   ├─ Lun-Mer: Pannello admin (24h)
   ├─ Gio: Responsive (8h)
   └─ Ven: Polish e UX (8h)

SETTIMANA 10: TESTING COMPLETO
├─ Lun-Mar: Unit tests (16h)
├─ Mer-Gio: Integration tests (16h)
└─ Ven: UAT preparation (8h)

SETTIMANA 11: UAT E BUG FIXING
├─ Lun-Mar: User testing (16h)
├─ Mer-Gio: Bug fixes (16h)
└─ Ven: Final testing (8h)

SETTIMANA 12: DEPLOYMENT E DOCS
├─ Lun-Mar: Deploy setup (16h)
├─ Mer: Configurazione prod (8h)
├─ Gio: Documentazione (8h)
└─ Ven: Go-live e training (8h)
```

---

## 3. Milestone e Deliverables

### Milestone 1: Design Complete (Fine Settimana 2)
**Deliverables:**
- ✅ Documento requisiti approvato
- ✅ Schema database completo
- ✅ Wireframe UI
- ✅ Architettura sistema documentata

### Milestone 2: Database Ready (Fine Settimana 3)
**Deliverables:**
- ✅ Database creato e testato
- ✅ Stored procedures implementate
- ✅ Dati di test caricati
- ✅ Performance ottimizzata

### Milestone 3: Backend Alpha (Fine Settimana 6)
**Deliverables:**
- ✅ Tutte le API implementate
- ✅ Sistema autenticazione funzionante
- ✅ Business logic completa
- ✅ Test coverage >70%

### Milestone 4: Frontend Alpha (Fine Settimana 9)
**Deliverables:**
- ✅ Tutte le pagine implementate
- ✅ Integrazione backend completa
- ✅ UI responsive
- ✅ UX ottimizzata

### Milestone 5: Beta Release (Fine Settimana 11)
**Deliverables:**
- ✅ Sistema testato end-to-end
- ✅ Bug critici risolti
- ✅ UAT completato
- ✅ Feedback implementato

### Milestone 6: Production Launch (Fine Settimana 12)
**Deliverables:**
- ✅ Sistema deployato in produzione
- ✅ Documentazione completa
- ✅ Training completato
- ✅ Sistema monitorato e stabile

---

## 4. Allocazione Risorse

### Team Composition (Opzione Ideale)
- **1 Project Manager** (part-time, 50 ore)
  - Coordinamento
  - Planning e tracking
  - Stakeholder management

- **1 Backend Developer** (full-time, 100 ore)
  - Database design
  - API development
  - Deployment

- **1 Frontend Developer** (full-time, 80 ore)
  - UI/UX design
  - Frontend development
  - Testing

- **1 QA Tester** (part-time, 40 ore)
  - Test planning
  - Manual testing
  - UAT coordination

### Team Composition (Opzione Minima)
- **1 Full-Stack Developer** (225 ore)
  - Tutto lo sviluppo
  - Testing base
  - Deployment

---

## 5. Gestione Rischi

### Rischi Tecnici
| Rischio | Probabilità | Impatto | Mitigazione |
|---------|-------------|---------|-------------|
| Performance DB lenta | Media | Alto | Ottimizzazione query, indici |
| Bug API critici | Alta | Alto | Testing rigoroso, code review |
| Sicurezza vulnerabilità | Media | Critico | Security audit, best practices |
| Integrazione problemi | Media | Medio | Integration testing early |

### Rischi di Progetto
| Rischio | Probabilità | Impatto | Mitigazione |
|---------|-------------|---------|-------------|
| Ritardi sviluppo | Media | Alto | Buffer time, priorità chiare |
| Scope creep | Alta | Medio | Change control, freeze features |
| Risorse insufficienti | Bassa | Alto | Part-time support, outsourcing |
| Feedback negativo UAT | Media | Medio | Prototipi early, iterazioni |

---

## 6. Budget Stimato (Opzionale)

### Costi Sviluppo
- Sviluppatore Full-Stack (225h × €30/h): €6,750
- Project Management (50h × €40/h): €2,000
- QA Testing (40h × €25/h): €1,000
**Totale Sviluppo: €9,750**

### Costi Hosting (Primo Anno)
- Domain (.it): €15/anno
- Hosting Render/Railway: €0 (tier gratuito)
- Database PlanetScale: €0 (tier gratuito)
- Email service: €0 (Gmail gratuito)
**Totale Hosting Anno 1: €15**

### Alternative Hosting Pro
- VPS DigitalOcean: €60/anno
- Database managed: €100/anno
- SSL certificato: €0 (Let's Encrypt)
**Totale Pro: €160/anno**

---

## 7. Criteri di Successo

### Metriche Tecniche
- ✅ Test coverage >80%
- ✅ API response time <500ms
- ✅ Uptime >99.5%
- ✅ Zero critical bugs in production

### Metriche Business
- ✅ 100% utenti migrati al sistema digitale
- ✅ >90% soddisfazione utenti
- ✅ Riduzione 50% tempo gestione prestiti
- ✅ Zero perdite libri da tracciamento

### Metriche Utilizzo
- ✅ >80% prestiti gestiti online
- ✅ <1% rate di blacklist
- ✅ Media 3 giorni tempo restituzione
- ✅ >95% disponibilità materiali

---

## 8. Post-Launch

### Manutenzione (Ore/Mese)
- Bug fixes: 4-8 ore
- Support utenti: 2-4 ore
- Backup verification: 1 ora
- Security updates: 2 ore
**Totale: 10-15 ore/mese**

### Evoluzioni Future
- Mobile app nativa (iOS/Android): +150 ore
- Sistema QR code: +30 ore
- Analytics dashboard: +40 ore
- Integrazione Google Calendar: +20 ore
- AI recommendations: +60 ore

---

**Documento preparato per: Sistema Gestione Biblioteca Scolastica**
**Versione: 1.0**
**Data: 2026-02-10**
