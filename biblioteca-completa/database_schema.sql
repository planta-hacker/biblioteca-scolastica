-- ============================================
-- DATABASE BIBLIOTECA SCOLASTICA
-- Schema Completo con Dati di Esempio
-- ============================================

CREATE DATABASE IF NOT EXISTS biblioteca_scolastica CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE biblioteca_scolastica;

-- Tabella Utenti
CREATE TABLE utenti (
    id_utente INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nome VARCHAR(100) NOT NULL,
    cognome VARCHAR(100) NOT NULL,
    tipo_utente ENUM('studente', 'docente', 'bibliotecario', 'master') NOT NULL,
    livello_accesso INT NOT NULL DEFAULT 0,
    in_blacklist BOOLEAN DEFAULT FALSE,
    data_fine_blacklist DATE NULL,
    data_registrazione TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_blacklist (in_blacklist),
    INDEX idx_tipo (tipo_utente)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabella Classi
CREATE TABLE classi (
    id_classe INT AUTO_INCREMENT PRIMARY KEY,
    nome_classe VARCHAR(50) NOT NULL,
    anno_scolastico VARCHAR(20) NOT NULL,
    INDEX idx_anno (anno_scolastico)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabella Studenti-Classi (relazione)
CREATE TABLE studenti_classi (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_studente INT NOT NULL,
    id_classe INT NOT NULL,
    FOREIGN KEY (id_studente) REFERENCES utenti(id_utente) ON DELETE CASCADE,
    FOREIGN KEY (id_classe) REFERENCES classi(id_classe) ON DELETE CASCADE,
    UNIQUE KEY unique_studente_classe (id_studente, id_classe)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabella Case Editrici
CREATE TABLE case_editrici (
    id_editore INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabella Autori
CREATE TABLE autori (
    id_autore INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    cognome VARCHAR(100) NOT NULL,
    UNIQUE KEY unique_autore (nome, cognome)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabella Lingue
CREATE TABLE lingue (
    id_lingua INT AUTO_INCREMENT PRIMARY KEY,
    codice VARCHAR(10) UNIQUE NOT NULL,
    nome VARCHAR(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabella Generi
CREATE TABLE generi (
    id_genere INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabella Codici Dewey
CREATE TABLE codici_dewey (
    codice_dewey VARCHAR(10) PRIMARY KEY,
    descrizione VARCHAR(255) NOT NULL,
    categoria_principale VARCHAR(100)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabella Materiali (libri, riviste, dizionari)
CREATE TABLE materiali (
    id_materiale INT AUTO_INCREMENT PRIMARY KEY,
    tipo_materiale ENUM('libro', 'rivista', 'dizionario') NOT NULL,
    titolo VARCHAR(500) NOT NULL,
    id_editore INT,
    id_lingua INT NOT NULL,
    anno_pubblicazione YEAR,
    data_pubblicazione DATE NULL,
    codice_isbn VARCHAR(13),
    codice_dewey VARCHAR(10),
    armadio VARCHAR(50),
    ripiano VARCHAR(50),
    immagine_copertina VARCHAR(500),
    trama TEXT,
    copie_totali INT DEFAULT 1,
    copie_disponibili INT DEFAULT 1,
    data_inserimento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_editore) REFERENCES case_editrici(id_editore),
    FOREIGN KEY (id_lingua) REFERENCES lingue(id_lingua),
    FOREIGN KEY (codice_dewey) REFERENCES codici_dewey(codice_dewey),
    INDEX idx_tipo (tipo_materiale),
    INDEX idx_disponibilita (copie_disponibili),
    INDEX idx_isbn (codice_isbn),
    INDEX idx_titolo (titolo(255)),
    FULLTEXT idx_titolo_fulltext (titolo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabella Autori-Materiali (relazione many-to-many)
CREATE TABLE materiali_autori (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_materiale INT NOT NULL,
    id_autore INT NOT NULL,
    FOREIGN KEY (id_materiale) REFERENCES materiali(id_materiale) ON DELETE CASCADE,
    FOREIGN KEY (id_autore) REFERENCES autori(id_autore) ON DELETE CASCADE,
    UNIQUE KEY unique_materiale_autore (id_materiale, id_autore)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabella Generi-Materiali (relazione many-to-many)
CREATE TABLE materiali_generi (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_materiale INT NOT NULL,
    id_genere INT NOT NULL,
    FOREIGN KEY (id_materiale) REFERENCES materiali(id_materiale) ON DELETE CASCADE,
    FOREIGN KEY (id_genere) REFERENCES generi(id_genere) ON DELETE CASCADE,
    UNIQUE KEY unique_materiale_genere (id_materiale, id_genere)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabella Prestiti
CREATE TABLE prestiti (
    id_prestito INT AUTO_INCREMENT PRIMARY KEY,
    id_materiale INT NOT NULL,
    id_utente INT NOT NULL,
    id_bibliotecario INT,
    codice_prenotazione VARCHAR(20) UNIQUE NOT NULL,
    data_prenotazione TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_ritiro DATE NULL,
    data_prevista_restituzione DATE,
    data_restituzione_effettiva DATE NULL,
    stato ENUM('prenotato', 'ritirato', 'restituito', 'annullato') DEFAULT 'prenotato',
    tipo_prestito ENUM('personale', 'classe') DEFAULT 'personale',
    note TEXT,
    FOREIGN KEY (id_materiale) REFERENCES materiali(id_materiale),
    FOREIGN KEY (id_utente) REFERENCES utenti(id_utente),
    FOREIGN KEY (id_bibliotecario) REFERENCES utenti(id_utente),
    INDEX idx_stato (stato),
    INDEX idx_utente (id_utente),
    INDEX idx_date (data_ritiro, data_restituzione_effettiva),
    INDEX idx_codice (codice_prenotazione)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabella Prestiti Classe (per docenti)
CREATE TABLE prestiti_classe (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_prestito INT NOT NULL,
    id_classe INT NOT NULL,
    id_studente INT NOT NULL,
    FOREIGN KEY (id_prestito) REFERENCES prestiti(id_prestito) ON DELETE CASCADE,
    FOREIGN KEY (id_classe) REFERENCES classi(id_classe),
    FOREIGN KEY (id_studente) REFERENCES utenti(id_utente)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabella Lista Attesa
CREATE TABLE lista_attesa (
    id_attesa INT AUTO_INCREMENT PRIMARY KEY,
    id_materiale INT NOT NULL,
    id_utente INT NOT NULL,
    data_richiesta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notifica_inviata BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (id_materiale) REFERENCES materiali(id_materiale) ON DELETE CASCADE,
    FOREIGN KEY (id_utente) REFERENCES utenti(id_utente) ON DELETE CASCADE,
    INDEX idx_notifica (notifica_inviata)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabella Blacklist Log
CREATE TABLE blacklist_log (
    id_log INT AUTO_INCREMENT PRIMARY KEY,
    id_utente INT NOT NULL,
    motivo ENUM('ritardo_restituzione', 'mancato_ritiro') NOT NULL,
    data_inserimento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_scadenza DATE NOT NULL,
    id_prestito INT,
    FOREIGN KEY (id_utente) REFERENCES utenti(id_utente),
    FOREIGN KEY (id_prestito) REFERENCES prestiti(id_prestito),
    INDEX idx_utente (id_utente),
    INDEX idx_scadenza (data_scadenza)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabella Location (armadi, aule, carrelli)
CREATE TABLE location (
    id_location INT AUTO_INCREMENT PRIMARY KEY,
    tipo_location ENUM('armadio', 'aula', 'carrello') NOT NULL,
    nome VARCHAR(100) NOT NULL,
    descrizione TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabella Dispositivi Elettronici
CREATE TABLE dispositivi (
    id_dispositivo INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    tipo VARCHAR(100),
    codice_identificativo VARCHAR(50) UNIQUE,
    id_location INT,
    disponibile BOOLEAN DEFAULT TRUE,
    note TEXT,
    FOREIGN KEY (id_location) REFERENCES location(id_location),
    INDEX idx_disponibile (disponibile)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabella Prestiti Dispositivi
CREATE TABLE prestiti_dispositivi (
    id_prestito_disp INT AUTO_INCREMENT PRIMARY KEY,
    id_dispositivo INT NOT NULL,
    id_utente INT NOT NULL,
    data_prestito TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_restituzione_prevista DATE,
    data_restituzione_effettiva DATE NULL,
    stato ENUM('in_uso', 'restituito') DEFAULT 'in_uso',
    FOREIGN KEY (id_dispositivo) REFERENCES dispositivi(id_dispositivo),
    FOREIGN KEY (id_utente) REFERENCES utenti(id_utente),
    INDEX idx_stato (stato)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabella Impegni Scolastici
CREATE TABLE impegni_scolastici (
    id_impegno INT AUTO_INCREMENT PRIMARY KEY,
    titolo VARCHAR(255) NOT NULL,
    descrizione TEXT,
    data_inizio DATETIME NOT NULL,
    data_fine DATETIME,
    tipo_impegno ENUM('open_day', 'collegio_docenti', 'riunione', 'evento', 'altro') NOT NULL,
    id_docente INT NULL,
    visibile_a ENUM('tutti', 'docenti', 'specifico') DEFAULT 'tutti',
    FOREIGN KEY (id_docente) REFERENCES utenti(id_utente),
    INDEX idx_date (data_inizio, data_fine)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabella Impostazioni Sistema
CREATE TABLE impostazioni (
    chiave VARCHAR(100) PRIMARY KEY,
    valore VARCHAR(500) NOT NULL,
    descrizione TEXT,
    tipo_dato ENUM('int', 'string', 'boolean', 'date') DEFAULT 'string'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabella Avvisi
CREATE TABLE avvisi (
    id_avviso INT AUTO_INCREMENT PRIMARY KEY,
    titolo VARCHAR(255) NOT NULL,
    messaggio TEXT NOT NULL,
    data_pubblicazione TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_scadenza DATE NULL,
    id_creatore INT NOT NULL,
    priorita ENUM('bassa', 'media', 'alta') DEFAULT 'media',
    FOREIGN KEY (id_creatore) REFERENCES utenti(id_utente),
    INDEX idx_scadenza (data_scadenza),
    INDEX idx_priorita (priorita)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- INSERIMENTO DATI INIZIALI
-- ============================================

-- Impostazioni di sistema
INSERT INTO impostazioni (chiave, valore, descrizione, tipo_dato) VALUES
('prestiti_max_personali', '3', 'Numero massimo di prestiti contemporanei per utente', 'int'),
('giorni_prestito', '30', 'Durata standard prestito in giorni', 'int'),
('giorni_blacklist', '90', 'Durata blacklist in giorni', 'int'),
('giorni_promemoria_email', '7', 'Ogni quanti giorni inviare promemoria restituzione', 'int'),
('mancati_ritiri_blacklist', '3', 'Numero mancati ritiri per blacklist', 'int');

-- Lingue comuni
INSERT INTO lingue (codice, nome) VALUES
('IT', 'Italiano'),
('EN', 'Inglese'),
('FR', 'Francese'),
('DE', 'Tedesco'),
('ES', 'Spagnolo'),
('LA', 'Latino'),
('GR', 'Greco'),
('PT', 'Portoghese'),
('RU', 'Russo'),
('CN', 'Cinese');

-- Codici Dewey principali e sottocategorie
INSERT INTO codici_dewey (codice_dewey, descrizione, categoria_principale) VALUES
('000', 'Informatica, informazione e opere generali', 'Generalità'),
('100', 'Filosofia e psicologia', 'Filosofia'),
('200', 'Religione', 'Religione'),
('300', 'Scienze sociali', 'Scienze sociali'),
('400', 'Linguaggio', 'Linguaggio'),
('500', 'Scienze pure', 'Scienze'),
('510', 'Matematica', 'Scienze'),
('520', 'Astronomia', 'Scienze'),
('530', 'Fisica', 'Scienze'),
('540', 'Chimica', 'Scienze'),
('550', 'Scienze della Terra', 'Scienze'),
('560', 'Paleontologia', 'Scienze'),
('570', 'Biologia', 'Scienze'),
('580', 'Botanica', 'Scienze'),
('590', 'Zoologia', 'Scienze'),
('600', 'Tecnologia', 'Tecnologia'),
('610', 'Medicina', 'Tecnologia'),
('620', 'Ingegneria', 'Tecnologia'),
('630', 'Agricoltura', 'Tecnologia'),
('640', 'Economia domestica', 'Tecnologia'),
('650', 'Management', 'Tecnologia'),
('700', 'Arti', 'Arti'),
('710', 'Urbanistica', 'Arti'),
('720', 'Architettura', 'Arti'),
('730', 'Scultura', 'Arti'),
('740', 'Disegno e arti decorative', 'Arti'),
('750', 'Pittura', 'Arti'),
('760', 'Grafica', 'Arti'),
('770', 'Fotografia', 'Arti'),
('780', 'Musica', 'Arti'),
('790', 'Sport e giochi', 'Arti'),
('800', 'Letteratura', 'Letteratura'),
('810', 'Letteratura americana', 'Letteratura'),
('820', 'Letteratura inglese', 'Letteratura'),
('830', 'Letteratura tedesca', 'Letteratura'),
('840', 'Letteratura francese', 'Letteratura'),
('850', 'Letteratura italiana', 'Letteratura'),
('860', 'Letteratura spagnola', 'Letteratura'),
('870', 'Letteratura latina', 'Letteratura'),
('880', 'Letteratura greca', 'Letteratura'),
('890', 'Altre letterature', 'Letteratura'),
('900', 'Storia e geografia', 'Storia'),
('910', 'Geografia e viaggi', 'Storia'),
('920', 'Biografie', 'Storia'),
('930', 'Storia antica', 'Storia'),
('940', 'Storia europea', 'Storia'),
('950', 'Storia asiatica', 'Storia'),
('960', 'Storia africana', 'Storia'),
('970', 'Storia nordamericana', 'Storia'),
('980', 'Storia sudamericana', 'Storia');

-- Generi letterari
INSERT INTO generi (nome) VALUES
('Narrativa'),
('Fantasy'),
('Fantascienza'),
('Giallo'),
('Thriller'),
('Horror'),
('Romantico'),
('Storico'),
('Avventura'),
('Biografico'),
('Classico'),
('Contemporaneo'),
('Distopico'),
('Umoristico'),
('Drammatico'),
('Poesia'),
('Teatro'),
('Saggio'),
('Divulgazione scientifica'),
('Manuale'),
('Young Adult'),
('Graphic Novel'),
('Fumetto');

-- Utente admin predefinito (password: admin123)
-- IMPORTANTE: Cambiare la password in produzione!
INSERT INTO utenti (email, password_hash, nome, cognome, tipo_utente, livello_accesso) VALUES
('admin@biblioteca.it', '$2a$10$X.P/tV7gkz5qDGvp4T6Cl.8Q5xE7X8p9JBMqVvhHZlwH8t5YE8Mq.', 'Admin', 'Biblioteca', 'master', 999),
('bibliotecario@scuola.it', '$2a$10$X.P/tV7gkz5qDGvp4T6Cl.8Q5xE7X8p9JBMqVvhHZlwH8t5YE8Mq.', 'Mario', 'Rossi', 'bibliotecario', 320);

-- ============================================
-- FINE SCRIPT
-- ============================================
