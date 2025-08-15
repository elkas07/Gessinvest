// js/login.js
import { supabase } from './supabase.js';

// Récupération des éléments DOM pour plus de lisibilité
const form = document.getElementById('login-form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginButton = document.getElementById('btn-login');
const errorMessage = document.getElementById('error-message');

/**
 * Gère la connexion de l'utilisateur.
 */
async function handleLogin(e) {
    e.preventDefault();

    // 1. Validation simple des champs
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
        displayError('Veuillez saisir votre email et votre mot de passe.');
        return;
    }

    // 2. Désactiver le bouton et masquer le message d'erreur
    loginButton.disabled = true;
    loginButton.textContent = 'Connexion en cours...';
    hideError();

    // 3. Tentative de connexion avec Supabase
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    // 4. Gérer le résultat de la connexion
    if (error) {
        displayError(`Erreur de connexion : ${error.message}`);
    } else {
        // Redirection en cas de succès
        window.location.href = 'admin.html';
    }

    // 5. Réactiver le bouton (si la redirection n'a pas eu lieu)
    loginButton.disabled = false;
    loginButton.textContent = 'Se connecter';
}

/**
 * Affiche un message d'erreur.
 * @param {string} message - Le message d'erreur à afficher.
 */
function displayError(message) {
    if (errorMessage) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
    }
}

/**
 * Cache le message d'erreur.
 */
function hideError() {
    if (errorMessage) {
        errorMessage.style.display = 'none';
        errorMessage.textContent = '';
    }
}

// Ajout de l'écouteur d'événement sur la soumission du formulaire
if (form) {
    form.addEventListener('submit', handleLogin);
} else {
    console.warn("Le formulaire avec l'ID 'login-form' n'a pas été trouvé.");
}