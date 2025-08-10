import { supabase } from './supabase.js';

// Sélectionner les éléments du DOM
const loginForm = document.getElementById('login-form');
const resetForm = document.getElementById('reset-password-form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const newPasswordInput = document.getElementById('new-password');
const errorMessage = document.getElementById('error-message');
const errorMessageReset = document.getElementById('error-message-reset');
const forgotPasswordLink = document.getElementById('forgot-password');

// Gérer la soumission du formulaire de connexion
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = emailInput.value;
    const password = passwordInput.value;

    const { error } = await supabase.auth.signInWithPassword({
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
});

// Gérer la soumission du formulaire de réinitialisation
resetForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const newPassword = newPasswordInput.value;
    
    // On met à jour le mot de passe de l'utilisateur
    const { error } = await supabase.auth.updateUser({
        password: newPassword
    });

    if (error) {
        console.error('Erreur de mise à jour du mot de passe:', error.message);
        errorMessageReset.textContent = 'Erreur lors du changement de mot de passe.';
        errorMessageReset.classList.add('visible');
    } else {
        alert('Votre mot de passe a été réinitialisé avec succès ! Vous pouvez maintenant vous connecter.');
        // On redirige vers la page de connexion après le changement
        window.location.href = 'login.html';
    }
});

// Gérer le lien "Mot de passe oublié ?"
forgotPasswordLink.addEventListener('click', async (e) => {
    e.preventDefault();
    const email = prompt("Entrez votre adresse email pour réinitialiser le mot de passe:");
    
    if (email) {
        // Envoie un email de réinitialisation avec un lien qui redirige vers la page de login
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            // C'est ici qu'il fallait mettre l'URL complète
            redirectTo: 'https://gessinvest.vercel.app/login.html'
        });
        
        if (error) {
            alert('Erreur lors de l\'envoi de l\'email de réinitialisation.');
        } else {
            alert('Un email de réinitialisation a été envoyé à votre adresse. Vérifiez votre boîte de réception.');
        }
    }
});

// Fonction pour vérifier l'URL et afficher le bon formulaire
async function checkUrlForPasswordRecovery() {
    const urlParams = new URLSearchParams(window.location.search);
    const type = urlParams.get('type');
    
    if (type === 'recovery') {
        // Si le paramètre 'type=recovery' est présent, on masque le formulaire de connexion
        // et on affiche celui pour changer le mot de passe.
        if (loginForm) loginForm.style.display = 'none';
        if (resetForm) resetForm.style.display = 'block';
    } else {
        // Sinon, on affiche le formulaire de connexion par défaut.
        if (loginForm) loginForm.style.display = 'block';
        if (resetForm) resetForm.style.display = 'none';
    }
}

// Appeler la fonction au chargement de la page pour vérifier l'URL
document.addEventListener('DOMContentLoaded', checkUrlForPasswordRecovery);