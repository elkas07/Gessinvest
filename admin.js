import { supabase } from './supabase.js';

// Fonction pour afficher une notification d'erreur
function afficherMessageErreur(message) {
    const errorMessage = document.getElementById('error-message');
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
}

// Fonction principale pour gérer la connexion
async function handleLogin(e) {
    e.preventDefault();
    const emailInput = document.getElementById('email').value.trim();
    const passwordInput = document.getElementById('password').value.trim();
    const errorMessage = document.getElementById('error-message');
    
    // Réinitialiser le message d'erreur
    errorMessage.style.display = 'none';

    // Vérifier que les champs ne sont pas vides
    if (!emailInput || !passwordInput) {
        afficherMessageErreur('Veuillez remplir tous les champs.');
        return;
    }

    try {
        const { error } = await supabase.auth.signInWithPassword({
            email: emailInput,
            password: passwordInput,
        });

        if (error) {
            console.error('Erreur de connexion:', error);
            // On affiche un message générique pour des raisons de sécurité
            afficherMessageErreur('Email ou mot de passe incorrect.');
        } else {
            // Connexion réussie, redirection vers la page du tableau de bord
            window.location.href = 'dashboard.html';
        }
    } catch (err) {
        console.error('Erreur inattendue:', err);
        afficherMessageErreur('Une erreur inattendue est survenue.');
    }
}

// Attacher l'événement au formulaire
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('admin-login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
});