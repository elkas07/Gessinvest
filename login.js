import { supabase } from './supabase.js';

const loginContainer = document.querySelector('.login-container');
const loginForm = document.getElementById('login-form');
const resetForm = document.getElementById('reset-password-form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const newPasswordInput = document.getElementById('new-password');
const errorMessage = document.getElementById('error-message');
const forgotPasswordLink = document.getElementById('forgot-password');

// Fonction pour gérer la connexion
async function handleLogin(e) {
    e.preventDefault();

    const email = emailInput.value;
    const password = passwordInput.value;

    const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
    });

    if (error) {
        console.error('Erreur de connexion:', error.message);
        errorMessage.textContent = 'Email ou mot de passe incorrect.';
        errorMessage.classList.add('visible');
    } else {
        errorMessage.classList.remove('visible');
        window.location.href = 'user_dashboard.html';
    }
}

// Fonction pour gérer la réinitialisation du mot de passe
async function handleResetPassword(e) {
    e.preventDefault();

    const newPassword = newPasswordInput.value;

    // Supabase détecte automatiquement le token dans l'URL pour cette fonction
    const { data, error } = await supabase.auth.updateUser({
        password: newPassword
    });

    if (error) {
        console.error('Erreur de mise à jour du mot de passe:', error.message);
        errorMessage.textContent = 'Erreur lors du changement de mot de passe.';
        errorMessage.classList.add('visible');
    } else {
        alert('Votre mot de passe a été réinitialisé avec succès ! Vous pouvez maintenant vous connecter.');
        // Rediriger vers la page de connexion après le changement
        window.location.href = 'login.html';
    }
}

// Vérifier si l'URL contient un token de réinitialisation
async function checkAuthSession() {
    const { data: { session } } = await supabase.auth.getSession();

    if (session && session.user.aud === 'authenticated') {
        const urlParams = new URLSearchParams(window.location.search);
        const type = urlParams.get('type');

        if (type === 'recovery') {
            // Afficher le formulaire de réinitialisation
            if (loginForm) loginForm.style.display = 'none';
            if (resetForm) resetForm.style.display = 'block';
            return;
        }
    }

    // Par défaut, afficher le formulaire de connexion
    if (loginForm) loginForm.style.display = 'block';
    if (resetForm) resetForm.style.display = 'none';
}

// Exécuter la vérification au chargement de la page
document.addEventListener('DOMContentLoaded', checkAuthSession);

// Ajouter les écouteurs d'événements
if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
}

if (resetForm) {
    resetForm.addEventListener('submit', handleResetPassword);
}

if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener('click', async (e) => {
        e.preventDefault();
        const email = prompt("Entrez votre adresse email pour réinitialiser le mot de passe:");
        if (email) {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: window.location.origin + '/login.html'
            });
            if (error) {
                alert('Erreur lors de l\'envoi de l\'email de réinitialisation.');
            } else {
                alert('Un email de réinitialisation a été envoyé à votre adresse. Vérifiez votre boîte de réception.');
            }
        }
    });
}