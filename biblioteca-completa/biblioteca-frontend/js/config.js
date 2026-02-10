// js/config.js
const API_BASE_URL = 'https://biblioteca-scolastica-production.up.railway.app/api';

const CONFIG = {
    API_BASE_URL,
    ENDPOINTS: {
        AUTH: {
            LOGIN: `${API_BASE_URL}/auth/login`,
            REGISTER: `${API_BASE_URL}/auth/register`
        },
        MATERIALI: {
            LIST: `${API_BASE_URL}/materiali`,
            DETAIL: (id) => `${API_BASE_URL}/materiali/${id}`,
            CREATE: `${API_BASE_URL}/materiali`,
            UPDATE: (id) => `${API_BASE_URL}/materiali/${id}`,
            DELETE: (id) => `${API_BASE_URL}/materiali/${id}`,
            ETICHETTA: (id) => `${API_BASE_URL}/materiali/${id}/etichetta`
        },
        PRESTITI: {
            LIST: `${API_BASE_URL}/prestiti`,
            MIEI: `${API_BASE_URL}/prestiti/miei`,
            CREATE: `${API_BASE_URL}/prestiti`,
            RITIRO: (id) => `${API_BASE_URL}/prestiti/${id}/ritiro`,
            RESTITUZIONE: (id) => `${API_BASE_URL}/prestiti/${id}/restituzione`,
            DELETE: (id) => `${API_BASE_URL}/prestiti/${id}`
        },
        UTENTI: {
            ME: `${API_BASE_URL}/utenti/me`,
            LIST: `${API_BASE_URL}/utenti`,
            CLASSI: `${API_BASE_URL}/utenti/classi`,
            STUDENTI_CLASSE: (id) => `${API_BASE_URL}/utenti/classi/${id}/studenti`
        },
        DISPOSITIVI: {
            LIST: `${API_BASE_URL}/dispositivi`,
            LOCATION: `${API_BASE_URL}/dispositivi/location`,
            CREATE: `${API_BASE_URL}/dispositivi`,
            RICHIEDI: (id) => `${API_BASE_URL}/dispositivi/${id}/richiedi`,
            RESTITUISCI: (id) => `${API_BASE_URL}/dispositivi/prestiti/${id}/restituisci`
        },
        IMPEGNI: {
            LIST: `${API_BASE_URL}/impegni`,
            CREATE: `${API_BASE_URL}/impegni`,
            UPDATE: (id) => `${API_BASE_URL}/impegni/${id}`,
            DELETE: (id) => `${API_BASE_URL}/impegni/${id}`
        },
        ADMIN: {
            BLACKLIST: `${API_BASE_URL}/admin/blacklist`,
            RIMUOVI_BLACKLIST: (id) => `${API_BASE_URL}/admin/blacklist/${id}/rimuovi`,
            STATISTICHE: `${API_BASE_URL}/admin/statistiche`,
            AVVISI: `${API_BASE_URL}/admin/avvisi`,
            IMPOSTAZIONI: `${API_BASE_URL}/admin/impostazioni`,
            UPDATE_IMPOSTAZIONE: (chiave) => `${API_BASE_URL}/admin/impostazioni/${chiave}`
        }
    }
};
