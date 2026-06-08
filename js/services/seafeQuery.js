import { showAlert } from '../utils/dom.js';

/**
 * Exécute une requête Supabase de manière sécurisée avec tentatives de reconnexion
 * @param {Function} queryFunc - Fonction retournant une promesse Supabase
 * @param {number} retries - Nombre de tentatives maximum
 * @param {number} delay - Délai initial en millisecondes
 */
export async function safeQuery(queryFunc, retries = 2, delay = 1000) {
    try {
        const response = await queryFunc();
        
        // Si Supabase renvoie une erreur explicite
        if (response.error) {
            throw response.error;
        }
        
        return response.data;
    } catch (error) {
        if (retries > 0) {
            console.warn(`Requête échouée. Nouvelle tentative dans ${delay}ms... (${retries} restantes)`, error);
            await new Promise(resolve => setTimeout(resolve, delay));
            return safeQuery(queryFunc, retries - 1, delay * 2);
        }
        
        // Journalisation et notification à l'utilisateur si tout échoue
        console.error("Erreur critique de communication API :", error);
        showAlert(error.message || "Erreur de connexion au serveur.", "error");
        throw error;
    }
}
