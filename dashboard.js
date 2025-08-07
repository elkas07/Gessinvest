import { supabase } from './supabase.js';

// Elements du DOM
const membersTableBody = document.getElementById('members-table-body');
const logoutBtn = document.getElementById('logout-btn');
const searchInput = document.getElementById('search-input');

// Vérifie si l'utilisateur est authentifié
async function checkAuth() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        window.location.href = 'login_admin.html';
    } else {
        displayUserInfo(user);
        fetchMembers();
    }
}

// Affiche les informations de l'utilisateur
function displayUserInfo(user) {
    const email = user.email;
    const initials = email.charAt(0).toUpperCase() + email.charAt(1).toUpperCase();
    document.getElementById('user-avatar-initials').textContent = initials;
    document.getElementById('user-info-email').textContent = email;
}

// Récupère les membres depuis Supabase
async function fetchMembers() {
    const { data, error } = await supabase
        .from('membres')
        .select('*');

    if (error) {
        console.error('Erreur lors de la récupération des membres:', error.message);
    } else {
        updateStats(data);
        renderMembersTable(data);
    }
}

// Met à jour les cartes de statistiques
function updateStats(members) {
    const totalMembres = members.length;
    const membresAcceptes = members.filter(m => m.statut === 'accepted').length;
    const demandesAttente = members.filter(m => m.statut === 'pending').length;
    const membresRefuses = members.filter(m => m.statut === 'rejected').length;

    document.getElementById('totalMembres').textContent = totalMembres;
    document.getElementById('acceptes').textContent = membresAcceptes;
    document.getElementById('attente').textContent = demandesAttente;
    document.getElementById('refuses').textContent = membresRefuses;
}

// Affiche le tableau des membres
function renderMembersTable(members) {
    membersTableBody.innerHTML = '';
    members.forEach(member => {
        const row = membersTableBody.insertRow();
        row.innerHTML = `
            <td>${member.nom}</td>
            <td>${member.telephone}</td>
            <td>${member.email}</td>
            <td><span class="status ${member.statut}">${getFrenchStatus(member.statut)}</span></td>
            <td class="actions">
                <button class="action-btn accept" onclick="updateStatus(${member.id}, 'accepted')" title="Accepter"><i class="fas fa-check-circle"></i></button>
                <button class="action-btn reject" onclick="updateStatus(${member.id}, 'rejected')" title="Refuser"><i class="fas fa-times-circle"></i></button>
                <button class="action-btn delete" onclick="deleteMember(${member.id})" title="Supprimer"><i class="fas fa-trash"></i></button>
            </td>
        `;
    });
}

// Traduit le statut
function getFrenchStatus(status) {
    switch (status) {
        case 'pending': return 'En attente';
        case 'accepted': return 'Accepté';
        case 'rejected': return 'Refusé';
        default: return 'Inconnu';
    }
}

// Met à jour le statut d'un membre
async function updateStatus(id, newStatus) {
    const { data, error } = await supabase
        .from('membres')
        .update({ statut: newStatus })
        .eq('id', id);

    if (error) {
        console.error('Erreur lors de la mise à jour du statut:', error.message);
    } else {
        alert(`Statut mis à jour pour le membre ID ${id}`);
        fetchMembers(); // Re-fetch pour mettre à jour le tableau
    }
}

// Supprime un membre
async function deleteMember(id) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce membre ? Cette action est irréversible.')) {
        const { data, error } = await supabase
            .from('membres')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Erreur lors de la suppression du membre:', error.message);
        } else {
            alert(`Membre ID ${id} supprimé avec succès.`);
            fetchMembers(); // Re-fetch pour mettre à jour le tableau
        }
    }
}

// Gestion de la recherche
searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const rows = membersTableBody.querySelectorAll('tr');

    rows.forEach(row => {
        const name = row.cells[0].textContent.toLowerCase();
        const phone = row.cells[1].textContent.toLowerCase();
        if (name.includes(searchTerm) || phone.includes(searchTerm)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
});

// Fonction de déconnexion
async function logout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
        console.error('Erreur de déconnexion:', error.message);
    } else {
        window.location.href = 'login_admin.html';
    }
}

// Écouteurs d'événements
logoutBtn.addEventListener('click', logout);

// Au chargement de la page
document.addEventListener('DOMContentLoaded', checkAuth);

// Exposer les fonctions globales pour les boutons d'action
window.updateStatus = updateStatus;
window.deleteMember = deleteMember;