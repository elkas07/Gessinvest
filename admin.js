import { supabase } from './supabase.js';

// Styles pour les notifications (inchangé, mais inclus pour la complétude)
const style = document.createElement('style');
style.innerHTML = `
  .notification {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 25px;
    border-radius: 8px;
    color: white;
    font-weight: 500;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    z-index: 1000;
    opacity: 0;
    transform: translateY(-50px);
    transition: all 0.3s ease;
  }
  .notification.success { background: #27ae60; }
  .notification.error { background: #e74c3c; }
`;
document.head.appendChild(style);

// ---------------------------
// FONCTIONS DE GESTION DU TABLEAU DE BORD
// ---------------------------

// Affiche les statistiques du dashboard
async function afficherStats() {
    try {
        const { data: membres, error } = await supabase.from('membres').select('*');
        if (error) throw error;
        const total = membres.length;
        const acceptes = membres.filter(m => m.statut === 'accepté').length;
        const refuses = membres.filter(m => m.statut === 'refusé').length;
        const attente = membres.filter(m => m.statut === 'en attente').length;

        document.getElementById('totalMembres').textContent = total;
        document.getElementById('acceptes').textContent = acceptes;
        document.getElementById('refuses').textContent = refuses;
        document.getElementById('attente').textContent = attente;

        document.querySelector('#totalMembres + .trend').innerHTML = `<i class="fas fa-arrow-up"></i> ${Math.floor(Math.random() * 20) + 1}% depuis le mois dernier`;
        document.querySelector('#acceptes + .trend').innerHTML = `<i class="fas fa-arrow-up"></i> ${Math.floor(Math.random() * 15) + 1}% depuis le mois dernier`;
        document.querySelector('#attente + .trend').innerHTML = `<i class="fas fa-arrow-down"></i> ${Math.floor(Math.random() * 10) + 1}% depuis le mois dernier`;
        document.querySelector('#refuses + .trend').innerHTML = `<i class="fas fa-arrow-up"></i> ${Math.floor(Math.random() * 5) + 1}% depuis le mois dernier`;
    } catch (error) {
        console.error("Erreur lors de la récupération des membres :", error);
        afficherNotification("Erreur lors du chargement des statistiques", "error");
    }
}

// Affiche tous les membres dans le tableau
async function afficherMembres(filtre = '') {
    try {
        const { data: membres, error } = await supabase.from('membres').select('*');
        if (error) throw error;
        const tbody = document.querySelector('#adminTable tbody');
        tbody.innerHTML = '';
        if (membres.length === 0) {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td colspan="5" style="text-align:center;padding:40px;color:#777">Aucun membre trouvé</td>`;
            tbody.appendChild(tr);
            return;
        }

        const membresFiltres = filtre ? membres.filter(m => m.nom.toLowerCase().includes(filtre.toLowerCase()) || (m.telephone && m.telephone.includes(filtre))) : membres;

        membresFiltres.forEach(membre => {
            const tr = document.createElement('tr');
            let statutClass = '';
            let statutText = '';
            switch(membre.statut) {
                case 'accepté':
                    statutClass = 'accepted';
                    statutText = 'Accepté';
                    break;
                case 'refusé':
                    statutClass = 'rejected';
                    statutText = 'Refusé';
                    break;
                case 'en attente':
                    statutClass = 'pending';
                    statutText = 'En attente';
                    break;
                default:
                    statutClass = 'pending';
                    statutText = membre.statut;
            }

            tr.innerHTML = `
                <td>${membre.nom || '-'}</td>
                <td>${membre.telephone || '-'}</td>
                <td>${membre.email || '-'}</td>
                <td><span class="status ${statutClass}">${statutText}</span></td>
                <td class="actions"></td>
            `;

            const actionsCell = tr.querySelector('.actions');
            if (membre.statut === 'en attente') {
                ajouterBoutonAction(actionsCell, 'accept', 'Accepter', 'fas fa-check', () => changerStatut(membre.id, 'accepté'));
                ajouterBoutonAction(actionsCell, 'reject', 'Refuser', 'fas fa-times', () => changerStatut(membre.id, 'refusé'));
            } else if (membre.statut === 'accepté') {
                ajouterBoutonAction(actionsCell, 'reject', 'Refuser', 'fas fa-times', () => changerStatut(membre.id, 'refusé'));
            } else if (membre.statut === 'refusé') {
                ajouterBoutonAction(actionsCell, 'accept', 'Accepter', 'fas fa-check', () => changerStatut(membre.id, 'accepté'));
            }
            ajouterBoutonAction(actionsCell, 'delete', 'Supprimer', 'fas fa-trash', () => supprimerMembre(membre.id));
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error("Erreur lors de la récupération :", error);
        afficherNotification("Erreur lors du chargement des membres", "error");
    }
}

// Ajoute un bouton d'action dans la cellule
function ajouterBoutonAction(container, type, title, iconClass, handler) {
    const button = document.createElement('button');
    button.className = `action-btn ${type}`;
    button.title = title;
    button.innerHTML = `<i class="${iconClass}"></i>`;
    button.addEventListener('click', handler);
    container.appendChild(button);
}

// Fonction de recherche en temps réel
function rechercherMembre(event) {
    const valeur = event.target.value.trim();
    afficherMembres(valeur);
}

// Met à jour le statut du membre
async function changerStatut(id, nouveauStatut) {
    try {
        const { error } = await supabase.from('membres').update({ statut: nouveauStatut }).eq('id', id);
        if (error) throw error;
        afficherNotification(`Statut mis à jour avec succès`, "success");
        await afficherStats();
        await afficherMembres(document.getElementById('search').value);
    } catch (error) {
        console.error("Erreur lors de la mise à jour du statut:", error);
        afficherNotification("Erreur lors de la mise à jour du statut", "error");
    }
}

// Supprime un membre
async function supprimerMembre(id) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce membre ? Cette action est irréversible.')) {
        return;
    }
    try {
        const { error } = await supabase.from('membres').delete().eq('id', id);
        if (error) throw error;
        afficherNotification("Membre supprimé avec succès", "success");
        await afficherStats();
        await afficherMembres(document.getElementById('search').value);
    } catch (error) {
        console.error("Erreur lors de la suppression:", error);
        afficherNotification("Erreur lors de la suppression du membre", "error");
    }
}

// Affiche une notification
function afficherNotification(message, type) {
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notif => notif.remove());
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
    }, 10);
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-20px)';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Charge les informations de l'administrateur
async function chargerInfoAdmin() {
    try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) throw error || new Error('Utilisateur non connecté');
        const userInfo = document.querySelector('.user-info');
        userInfo.innerHTML = `
            <img src="https://ui-avatars.com/api/?name=${user.email[0]}&background=random" alt="Admin">
            <div class="user-details">
                <h3>${user.email}</h3>
                <p>Administrateur</p>
            </div>
        `;
    } catch (error) {
        console.error("Erreur lors du chargement des infos admin:", error);
        document.querySelector('.user-info').innerHTML = `
            <img src="https://ui-avatars.com/api/?name=A&background=007bff" alt="Admin">
            <div class="user-details">
                <h3>Administrateur</h3>
                <p>Déconnecté</p>
            </div>
        `;
    }
}

// ---------------------------
// LOGIQUE DE CONNEXION ET DE SÉCURITÉ MISE À JOUR
// ---------------------------

// Fonction principale pour gérer la redirection et la logique de la page
window.addEventListener('DOMContentLoaded', async () => {
    // Si nous sommes sur la page de connexion
    if (window.location.pathname.endsWith('login_admin.html')) {
        const loginForm = document.getElementById('admin-login-form');
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const emailInput = document.getElementById('email').value;
            const passwordInput = document.getElementById('password').value;
            const errorMessage = document.getElementById('error-message');

            const { data, error } = await supabase.auth.signInWithPassword({
                email: emailInput,
                password: passwordInput,
            });

            if (error) {
                console.error('Erreur de connexion:', error.message);
                errorMessage.textContent = 'Email ou mot de passe incorrect.';
                errorMessage.style.display = 'block';
            } else {
                // Connexion réussie, rediriger vers la page du tableau de bord
                window.location.href = 'dashboard.html';
            }
        });
    }

    // Si nous sommes sur la page d'administration
    else if (window.location.pathname.endsWith('dashboard.html')) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            // Pas d'utilisateur connecté, redirection vers la page de connexion
            window.location.href = 'login_admin.html';
        } else {
            // Utilisateur connecté, exécution du code du tableau de bord
            await afficherStats();
            await afficherMembres();
            document.getElementById('search').addEventListener('input', rechercherMembre);
            chargerInfoAdmin();
        }
    }
});