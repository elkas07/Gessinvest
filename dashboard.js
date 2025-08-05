<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dashboard Cotisations - GESSINVEST</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    :root {
      --primary: #2c3e50;
      --secondary: #3498db;
      --success: #27ae60;
      --danger: #e74c3c;
      --light: #f8f9fa;
      --dark: #343a40;
      --border: #dfe6e9;
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }
    
    body {
      background-color: #f0f5ff;
      color: #333;
      line-height: 1.6;
      padding: 20px;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
    }
    
    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      padding: 15px 0;
      border-bottom: 1px solid var(--border);
    }
    
    .logo {
      display: flex;
      align-items: center;
    }
    
    .logo i {
      font-size: 32px;
      color: var(--secondary);
      margin-right: 10px;
    }
    
    .logo h1 {
      font-size: 24px;
      font-weight: 600;
      color: var(--primary);
    }
    
    .logo span {
      color: var(--secondary);
    }
    
    /* Cards */
    .card-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    
    .card {
      background: white;
      border-radius: 12px;
      padding: 25px;
      box-shadow: 0 5px 15px rgba(0,0,0,0.05);
      transition: all 0.3s ease;
    }
    
    .card:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.1);
    }
    
    .card h3 {
      font-size: 16px;
      color: #777;
      margin-bottom: 15px;
      font-weight: 500;
    }
    
    .card .number {
      font-size: 32px;
      font-weight: 700;
      margin-bottom: 10px;
    }
    
    .card .trend {
      display: flex;
      align-items: center;
      color: var(--success);
      font-size: 14px;
    }
    
    .card .trend.down {
      color: var(--danger);
    }
    
    .card .trend i {
      margin-right: 5px;
    }
    
    /* Form Styles */
    .form-container {
      background: white;
      border-radius: 12px;
      padding: 25px;
      margin-bottom: 30px;
      box-shadow: 0 5px 15px rgba(0,0,0,0.05);
    }
    
    .form-title {
      font-size: 20px;
      margin-bottom: 20px;
      color: var(--primary);
      display: flex;
      align-items: center;
    }
    
    .form-title i {
      margin-right: 10px;
      color: var(--secondary);
    }
    
    .form-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 20px;
    }
    
    .form-group {
      margin-bottom: 15px;
    }
    
    .form-group label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
      color: #555;
    }
    
    .form-group input, .form-group select {
      width: 100%;
      padding: 12px 15px;
      border: 1px solid var(--border);
      border-radius: 8px;
      font-size: 16px;
      transition: all 0.3s ease;
    }
    
    .form-group input:focus, .form-group select:focus {
      border-color: var(--secondary);
      outline: none;
      box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
    }
    
    button {
      background: var(--secondary);
      color: white;
      border: none;
      padding: 12px 25px;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    button:hover {
      background: #2980b9;
      transform: translateY(-2px);
    }
    
    button i {
      margin-right: 8px;
    }
    
    /* Table Styles */
    .table-container {
      background: white;
      border-radius: 12px;
      padding: 25px;
      box-shadow: 0 5px 15px rgba(0,0,0,0.05);
    }
    
    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      flex-wrap: wrap;
      gap: 15px;
    }
    
    .table-header h2 {
      font-size: 20px;
      color: var(--primary);
      display: flex;
      align-items: center;
    }
    
    .table-header h2 i {
      margin-right: 10px;
      color: var(--secondary);
    }
    
    .search-box {
      position: relative;
      width: 300px;
      max-width: 100%;
    }
    
    .search-box input {
      width: 100%;
      padding: 10px 15px 10px 40px;
      border-radius: 30px;
      border: 1px solid var(--border);
      outline: none;
      font-size: 14px;
    }
    
    .search-box i {
      position: absolute;
      left: 15px;
      top: 12px;
      color: #777;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    
    th {
      text-align: left;
      padding: 15px;
      font-weight: 600;
      color: var(--dark);
      border-bottom: 2px solid var(--border);
    }
    
    td {
      padding: 15px;
      border-bottom: 1px solid var(--border);
    }
    
    .actions {
      display: flex;
      gap: 8px;
    }
    
    .action-btn {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: none;
      cursor: pointer;
      transition: all 0.3s ease;
      background: #f8f9fa;
    }
    
    .action-btn.delete {
      color: var(--danger);
    }
    
    .action-btn:hover {
      opacity: 0.8;
      transform: scale(1.05);
    }
    
    .chart-container {
      background: white;
      border-radius: 12px;
      padding: 25px;
      margin-top: 30px;
      box-shadow: 0 5px 15px rgba(0,0,0,0.05);
    }
    
    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    
    .chart-header h2 {
      font-size: 20px;
      color: var(--primary);
      display: flex;
      align-items: center;
    }
    
    .chart-header h2 i {
      margin-right: 10px;
      color: var(--secondary);
    }
    
    footer {
      text-align: center;
      padding: 30px 0;
      color: #777;
      font-size: 14px;
      margin-top: 30px;
    }
    
    /* Responsive */
    @media (max-width: 768px) {
      .form-row {
        grid-template-columns: 1fr;
      }
      
      .table-header {
        flex-direction: column;
        align-items: flex-start;
      }
      
      .search-box {
        width: 100%;
      }
      
      table {
        display: block;
        overflow-x: auto;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div class="logo">
        <i class="fas fa-chart-pie"></i>
        <h1>GESS<span>INVEST</span> Dashboard</h1>
      </div>
      <div class="user-info">
        <div class="user-details">
          <h3>Thomas Martin</h3>
          <p>Administrateur</p>
        </div>
      </div>
    </header>
    
    <!-- Statistiques -->
    <section class="card-grid">
      <div class="card">
        <h3>Total Cotisations</h3>
        <div class="number" id="total-cotisations">0 FCFA</div>
        <div class="trend">
          <i class="fas fa-arrow-up"></i> 12% depuis le mois dernier
        </div>
      </div>
      <div class="card">
        <h3>Cotisations ce mois</h3>
        <div class="number" id="month-cotisations">0 FCFA</div>
        <div class="trend">
          <i class="fas fa-arrow-up"></i> 8% depuis le mois dernier
        </div>
      </div>
      <div class="card">
        <h3>Membres cotisants</h3>
        <div class="number" id="total-membres">0</div>
        <div class="trend down">
          <i class="fas fa-arrow-down"></i> 3% depuis le mois dernier
        </div>
      </div>
      <div class="card">
        <h3>Moyenne par membre</h3>
        <div class="number" id="average-cotisation">0 FCFA</div>
        <div class="trend">
          <i class="fas fa-arrow-up"></i> 5% depuis le mois dernier
        </div>
      </div>
    </section>
    
    <!-- Formulaire d'enregistrement -->
    <section class="form-container">
      <h2 class="form-title"><i class="fas fa-plus-circle"></i> Nouvelle Cotisation</h2>
      <form id="cotisation-form">
        <div class="form-row">
          <div class="form-group">
            <label for="nom">Nom complet</label>
            <input type="text" id="nom" placeholder="Entrez le nom complet" required>
          </div>
          <div class="form-group">
            <label for="telephone">Téléphone</label>
            <input type="tel" id="telephone" placeholder="Entrez le numéro de téléphone" required>
          </div>
          <div class="form-group">
            <label for="montant">Montant (FCFA)</label>
            <input type="number" id="montant" placeholder="Entrez le montant" min="1000" step="500" required>
          </div>
        </div>
        <button type="submit"><i class="fas fa-save"></i> Enregistrer la cotisation</button>
      </form>
    </section>
    
    <!-- Tableau des cotisations -->
    <section class="table-container">
      <div class="table-header">
        <h2><i class="fas fa-table"></i> Historique des Cotisations</h2>
        <div class="search-box">
          <i class="fas fa-search"></i>
          <input type="text" id="search" placeholder="Rechercher par nom ou téléphone...">
        </div>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>Nom</th>
            <th>Téléphone</th>
            <th>Montant</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody id="cotisation-body">
          <!-- Les données seront chargées ici dynamiquement -->
        </tbody>
      </table>
    </section>
    
    <!-- Graphique des cotisations -->
    <section class="chart-container">
      <div class="chart-header">
        <h2><i class="fas fa-chart-line"></i> Évolution des Cotisations</h2>
      </div>
      <canvas id="cotisation-chart" height="300"></canvas>
    </section>
    
    <footer>
      GESSINVEST © 2025 – Tous droits réservés
    </footer>
  </div>
  
  <script>
    // Fonction principale exécutée au chargement
    document.addEventListener('DOMContentLoaded', async () => {
      // Initialisation des données
      await chargerCotisations();
      await initialiserGraphique();
      
      // Événements
      document.getElementById('cotisation-form').addEventListener('submit', enregistrerCotisation);
      document.getElementById('search').addEventListener('input', rechercherCotisation);
    });
    
    // Simuler les données pour la démonstration
    const cotisations = [
      { id: 1, nom: "Marie Dupont", telephone: "06 12 34 56 78", montant: 50000, date: "2025-07-15" },
      { id: 2, nom: "Jean Martin", telephone: "07 89 12 34 56", montant: 75000, date: "2025-07-18" },
      { id: 3, nom: "Sophie Bernard", telephone: "06 45 78 91 23", montant: 60000, date: "2025-07-20" },
      { id: 4, nom: "Pierre Leroy", telephone: "07 12 34 56 78", montant: 45000, date: "2025-07-22" },
      { id: 5, nom: "Julie Petit", telephone: "06 78 91 23 45", montant: 80000, date: "2025-07-25" },
      { id: 6, nom: "Thomas Moreau", telephone: "06 11 22 33 44", montant: 55000, date: "2025-07-28" },
      { id: 7, nom: "Lucie Dubois", telephone: "07 55 66 77 88", montant: 70000, date: "2025-07-30" },
      { id: 8, nom: "Michel Lambert", telephone: "06 99 88 77 66", montant: 65000, date: "2025-08-02" },
    ];
    
    // 👉 Fonction : Enregistrer une cotisation
    async function enregistrerCotisation(e) {
      e.preventDefault();
      
      const nom = document.getElementById('nom').value.trim();
      const telephone = document.getElementById('telephone').value.trim();
      const montant = parseFloat(document.getElementById('montant').value);
      
      if (!nom || !telephone || isNaN(montant)) {
        afficherNotification("Merci de remplir tous les champs correctement", "error");
        return;
      }
      
      // Simuler l'enregistrement dans une base de données
      const nouvelleCotisation = {
        id: Date.now(),
        nom,
        telephone,
        montant,
        date: new Date().toISOString().split('T')[0]
      };
      
      cotisations.unshift(nouvelleCotisation);
      
      afficherNotification("Cotisation enregistrée avec succès !", "success");
      document.getElementById('cotisation-form').reset();
      
      // Mise à jour des données
      await chargerCotisations();
      await initialiserGraphique();
    }
    
    // 👉 Fonction : Charger les cotisations et les afficher dans le tableau
    async function chargerCotisations(filtre = '') {
      const tbody = document.getElementById('cotisation-body');
      tbody.innerHTML = '';
      
      let totalCotisations = 0;
      let membresUniques = new Set();
      
      // Filtrer les cotisations si un terme de recherche est fourni
      const cotisationsFiltrees = filtre ? 
        cotisations.filter(c => 
          c.nom.toLowerCase().includes(filtre.toLowerCase()) || 
          c.telephone.includes(filtre)
        ) : 
        cotisations;
      
      // Trier par date (plus récent en premier)
      cotisationsFiltrees.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      // Afficher chaque cotisation
      cotisationsFiltrees.forEach(cotisation => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${cotisation.nom}</td>
          <td>${cotisation.telephone}</td>
          <td><strong>${formatMontant(cotisation.montant)} FCFA</strong></td>
          <td>${formatDate(cotisation.date)}</td>
          <td class="actions">
            <button class="action-btn delete" title="Supprimer" onclick="supprimerCotisation(${cotisation.id})">
              <i class="fas fa-trash"></i>
            </button>
          </td>
        `;
        tbody.appendChild(tr);
        
        // Calculer les totaux
        totalCotisations += cotisation.montant;
        membresUniques.add(cotisation.telephone);
      });
      
      // Mise à jour des statistiques
      document.getElementById('total-cotisations').textContent = formatMontant(totalCotisations) + ' FCFA';
      document.getElementById('total-membres').textContent = membresUniques.size;
      
      // Calculer la moyenne
      const moyenne = membresUniques.size > 0 ? totalCotisations / membresUniques.size : 0;
      document.getElementById('average-cotisation').textContent = formatMontant(moyenne) + ' FCFA';
      
      // Cotisations du mois (simulé)
      const cotisationsMois = cotisations
        .filter(c => new Date(c.date).getMonth() === new Date().getMonth())
        .reduce((sum, c) => sum + c.montant, 0);
      
      document.getElementById('month-cotisations').textContent = formatMontant(cotisationsMois) + ' FCFA';
    }
    
    // 👉 Fonction : Rechercher dans les cotisations
    function rechercherCotisation(event) {
      const valeur = event.target.value.trim();
      chargerCotisations(valeur);
    }
    
    // 👉 Fonction : Supprimer une cotisation
    function supprimerCotisation(id) {
      if (!confirm('Êtes-vous sûr de vouloir supprimer cette cotisation ?')) {
        return;
      }
      
      const index = cotisations.findIndex(c => c.id === id);
      if (index !== -1) {
        cotisations.splice(index, 1);
        afficherNotification("Cotisation supprimée avec succès", "success");
        chargerCotisations();
        initialiserGraphique();
      }
    }
    
    // 👉 Fonction : Initialiser le graphique
    async function initialiserGraphique() {
      const ctx = document.getElementById('cotisation-chart').getContext('2d');
      
      // Données pour le graphique (simulées)
      const mois = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
      const cotisationsParMois = Array(12).fill(0);
      
      // Simuler des données pour le graphique
      cotisations.forEach(c => {
        const moisIndex = new Date(c.date).getMonth();
        cotisationsParMois[moisIndex] += c.montant;
      });
      
      // Créer le graphique
      if (window.cotisationChart) {
        window.cotisationChart.destroy();
      }
      
      window.cotisationChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: mois,
          datasets: [{
            label: 'Cotisations (FCFA)',
            data: cotisationsParMois,
            backgroundColor: 'rgba(52, 152, 219, 0.7)',
            borderColor: 'rgba(52, 152, 219, 1)',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  return formatMontant(context.raw) + ' FCFA';
                }
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: function(value) {
                  return formatMontant(value) + ' FCFA';
                }
              }
            }
          }
        }
      });
    }
    
    // Fonctions utilitaires
    function formatMontant(montant) {
      return new Intl.NumberFormat('fr-FR').format(montant);
    }
    
    function formatDate(dateStr) {
      const date = new Date(dateStr);
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }
    
    function afficherNotification(message, type) {
      // Créer la notification
      const notification = document.createElement('div');
      notification.className = `notification ${type}`;
      notification.textContent = message;
      
      // Styles pour la notification
      notification.style.position = 'fixed';
      notification.style.top = '20px';
      notification.style.right = '20px';
      notification.style.padding = '15px 25px';
      notification.style.borderRadius = '8px';
      notification.style.color = 'white';
      notification.style.fontWeight = '500';
      notification.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
      notification.style.zIndex = '1000';
      notification.style.opacity = '0';
      notification.style.transform = 'translateY(-50px)';
      notification.style.transition = 'all 0.3s ease';
      
      if (type === 'success') {
        notification.style.background = '#27ae60';
      } else {
        notification.style.background = '#e74c3c';
      }
      
      document.body.appendChild(notification);
      
      // Animation d'apparition
      setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
      }, 10);
      
      // Disparaître après 3 secondes
      setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-20px)';
        setTimeout(() => notification.remove(), 300);
      }, 3000);
    }
  </script>
</body>
</html>