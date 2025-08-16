// js/dashboard.js
import { supabase } from './supabase.js';

/* ================== UTILITAIRES ================== */

/**
 * Formate un nombre en devise XAF.
 * @param {number} value - Le montant à formater.
 * @returns {string} Le montant formaté avec "XAF".
 */
function formatXAF(value) {
    const amount = Number(value || 0);
    // Correction : Utilisation de toLocaleString pour un formatage correct
    return amount.toLocaleString('fr-FR') + ' XAF';
}

/**
 * Calcule le pourcentage de progression d'un objectif.
 * @param {number} collected - Le montant collecté.
 * @param {number} goal - L'objectif à atteindre.
 * @returns {number} Le pourcentage arrondi entre 0 et 100.
 */
function calculatePercentage(collected, goal) {
    const c = Number(collected || 0);
    const o = Number(goal || 0);
    if (o <= 0) return 0;
    return Math.max(0, Math.min(100, Math.round((c / o) * 100)));
}

/* ================== RENDU PROJETS ================== */

const projectContainers = {
    encours: document.getElementById('cards-encours'),
    atteint: document.getElementById('cards-atteint'),
    avenir: document.getElementById('cards-avenir')
};

/**
 * Crée le HTML pour le badge de statut.
 * @param {string} status - Le statut du projet ('encours', 'atteint', 'avenir').
 * @returns {string} Le code HTML du badge.
 */
function createStatusBadge(status) {
    const badges = {
        'encours': 'Collecte en cours',
        'atteint': 'Objectif atteint',
        'avenir': 'Collecte à venir'
    };
    const text = badges[status] || '';
    return `<span class="badge ${status}">${text}</span>`;
}

/**
 * Crée une carte de projet à partir des données.
 * @param {object} project - L'objet projet.
 * @returns {string} Le code HTML de la carte.
 */
function createProjectCard(project) {
    const percentage = calculatePercentage(project.collecte, project.objectif);
    const eventDate = project.evenement_date ? new Date(project.evenement_date) : null;
    const dateText = eventDate ? `${eventDate.toLocaleDateString()} à ${eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : '';

    return `
        <article class="card">
            <img src="${project.image_url || 'https://images.unsplash.com/photo-1505691723518-36a5ac3b2d55?q=80&w=1200&auto=format&fit=crop'}" alt="${project.titre || ''}">
            <div class="card-body">
                ${createStatusBadge(project.statut)}
                <h3 class="card-title">${project.titre || 'Projet immobilier'}</h3>
                <div class="card-meta"><span>Objectif :</span><strong>${formatXAF(project.objectif)}</strong></div>
                <div class="card-meta"><span>Collecté :</span><strong>${formatXAF(project.collecte)}</strong></div>
                <div class="progress"><span style="width:${percentage}%"></span></div>
                ${project.statut === 'avenir' && dateText ? `<div class="card-meta">🕒 ${dateText}</div>` : ''}
                ${project.ville ? `<div class="card-meta">📍 ${project.ville}</div>` : ''}
            </div>
        </article>
    `;
}

/**
 * Charge les projets depuis la base de données et les affiche.
 */
async function loadProjects() {
    // Optionnel : afficher un état de chargement
    Object.values(projectContainers).forEach(container => {
        if (container) container.innerHTML = '<p class="loading-message">Chargement des projets...</p>';
    });

    // Correction 1 : Utiliser un tri plus fiable sur l'ID pour les statuts
    const { data: projects, error } = await supabase
        .from('projets')
        .select('*')
        .order('id', { ascending: true }); // Tri par ID pour assurer l'ordre d'insertion

    if (error) {
        console.error('Erreur de chargement des projets :', error);
        Object.values(projectContainers).forEach(container => {
            if (container) container.innerHTML = '<p class="error-message">Une erreur est survenue lors du chargement des projets.</p>';
        });
        return;
    }

    // Correction 2 : Grouper les projets par statut avant l'affichage
    const groupedProjects = projects.reduce((acc, project) => {
        const status = project.statut;
        if (!acc[status]) {
            acc[status] = [];
        }
        acc[status].push(project);
        return acc;
    }, {});

    // Vider les conteneurs et afficher les projets
    Object.values(projectContainers).forEach(container => { if (container) container.innerHTML = ''; });
    
    // Afficher les projets groupés
    for (const status in groupedProjects) {
        const container = projectContainers[status];
        if (container) {
            const htmlCards = groupedProjects[status].map(createProjectCard).join('');
            container.innerHTML = htmlCards;
        } else {
            console.warn(`Statut de projet inconnu: ${status}`);
        }
    }
}

// Abonnement en temps réel aux projets
supabase
    .channel('projets-realtime')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'projets' }, () => {
        console.log("Mise à jour en temps réel des projets...");
        loadProjects();
    })
    .subscribe();

/* ================== RENDU COTISATIONS ================== */

const contributionForm = document.getElementById('cotisation-form');
const contributionBody = document.getElementById('cotisation-body');
const contributionFormInputs = {
    nom: document.getElementById('nom'),
    telephone: document.getElementById('telephone'),
    montant: document.getElementById('montant')
};

/**
 * Charge les cotisations et les affiche dans le tableau.
 */
async function loadContributions() {
    if (!contributionBody) {
        console.warn("L'élément 'cotisation-body' n'a pas été trouvé.");
        return;
    }

    contributionBody.innerHTML = '<tr><td colspan="4" class="loading-message">Chargement des cotisations...</td></tr>';

    const { data: contributions, error } = await supabase
        .from('cotisations')
        .select('*')
        .order('date_de_cotisation', { ascending: false });

    if (error) {
        console.error('Erreur de chargement des cotisations :', error);
        contributionBody.innerHTML = '<tr><td colspan="4" class="error-message">Erreur lors du chargement des cotisations.</td></tr>';
        return;
    }

    if (contributions.length === 0) {
        contributionBody.innerHTML = '<tr><td colspan="4" class="empty-message">Aucune cotisation enregistrée pour le moment.</td></tr>';
        return;
    }

    // Effacer le contenu existant et ajouter les nouvelles lignes
    contributionBody.innerHTML = '';
    contributions.forEach(c => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${c.nom || '-'}</td>
            <td>${c.telephone || '-'}</td>
            <td>${formatXAF(c.montant)}</td>
            <td>${new Date(c.date_de_cotisation).toLocaleDateString()}</td>
        `;
        contributionBody.appendChild(row);
    });
}

/**
 * Gère la soumission du formulaire de cotisation.
 */
async function handleFormSubmission(e) {
    e.preventDefault();

    const { nom, telephone, montant } = contributionFormInputs;
    const nomValue = nom.value.trim();
    const telephoneValue = telephone.value.trim();
    const montantValue = parseFloat(montant.value);

    if (!nomValue || !telephoneValue || isNaN(montantValue) || montantValue <= 0) {
        alert('Veuillez compléter tous les champs correctement (le montant doit être un nombre positif).');
        return;
    }

    // Désactiver le bouton et indiquer l'état de chargement
    const submitButton = contributionForm.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = 'Enregistrement...';

    try {
        const { error } = await supabase
            .from('cotisations')
            .insert([{ nom: nomValue, telephone: telephoneValue, montant: montantValue }]);

        if (error) {
            throw new Error(error.message);
        }

        // Succès
        alert('Cotisation enregistrée avec succès !');
        contributionForm.reset();
        loadContributions(); // Recharger les données pour refléter le changement
    } catch (err) {
        console.error('Erreur lors de l’enregistrement :', err);
        alert('Erreur lors de l’enregistrement : ' + err.message);
    } finally {
        // Réactiver le bouton après la requête
        submitButton.disabled = false;
        submitButton.textContent = 'Enregistrer';
    }
}

// Écouteur d'événement sur la soumission du formulaire
if (contributionForm) {
    contributionForm.addEventListener('submit', handleFormSubmission);
} else {
    console.warn("Le formulaire avec l'ID 'cotisation-form' n'a pas été trouvé.");
}

// Abonnement en temps réel aux cotisations
supabase
    .channel('cotisations-realtime')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'cotisations' }, () => {
        console.log("Mise à jour en temps réel des cotisations...");
        loadContributions();
    })
    .subscribe();

/* ================== DÉMARRAGE DE LA PAGE ================== */
document.addEventListener('DOMContentLoaded', () => {
    loadProjects();
    loadContributions();
});