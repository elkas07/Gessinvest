import { supabase } from './supabase.js';

const userNameSpan = document.getElementById('user-name');
const userEmailSpan = document.getElementById('user-email');
const logoutBtn = document.getElementById('logout-btn');

async function checkAuth() {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
        // Redirige vers la page de connexion si l'utilisateur n'est pas connecté
        window.location.href = 'login.html';
    } else {
        // Affiche les informations de l'utilisateur
        displayUserInfo(user);
    }
}

function displayUserInfo(user) {
    // Les informations du profil peuvent être plus détaillées
    // en récupérant les données depuis une table "profiles" par exemple.
    const userEmail = user.email;

    userNameSpan.textContent = userEmail.split('@')[0]; // Affiche la partie avant l'arobase
    userEmailSpan.textContent = userEmail;
}

// Gère la déconnexion
logoutBtn.addEventListener('click', async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
        console.error('Erreur de déconnexion:', error.message);
    } else {
        // Redirige vers la page de connexion après déconnexion
        window.location.href = 'login.html';
    }
});

// Exécute la vérification d'authentification au chargement de la page
document.addEventListener('DOMContentLoaded', checkAuth);