import { supabase } from './supabase.js';

const loginForm = document.getElementById('login-form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const errorMessage = document.getElementById('error-message');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = emailInput.value;
    const password = passwordInput.value;

    const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
    });

    if (error) {
        // Gérer les erreurs de connexion
        console.error('Erreur de connexion:', error.message);
        errorMessage.textContent = 'Email ou mot de passe incorrect.';
        errorMessage.classList.add('visible');
    } else {
        // Connexion réussie, rediriger l'utilisateur vers son tableau de bord
        errorMessage.classList.remove('visible');
        window.location.href = 'user_dashboard.html';
    }
});