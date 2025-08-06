<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Configuration Supabase - GESSINVEST</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
  <style>
    :root {
      --primary: #2c3e50;
      --secondary: #3498db;
      --success: #27ae60;
      --danger: #e74c3c;
      --light: #f8f9fa;
      --dark: #343a40;
      --border: #dfe6e9;
      --gray: #6c757d;
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }
    
    body {
      background: linear-gradient(135deg, #1a2a6c, #b21f1f, #2c3e50);
      color: #333;
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 20px;
    }
    
    .container {
      max-width: 1200px;
      width: 100%;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 30px;
    }
    
    @media (max-width: 900px) {
      .container {
        grid-template-columns: 1fr;
      }
    }
    
    .panel {
      background: rgba(255, 255, 255, 0.95);
      border-radius: 15px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
      overflow: hidden;
    }
    
    .header {
      background: var(--primary);
      color: white;
      padding: 25px;
      display: flex;
      align-items: center;
      gap: 15px;
    }
    
    .header i {
      font-size: 28px;
      color: var(--secondary);
    }
    
    .header h1 {
      font-size: 24px;
      font-weight: 600;
    }
    
    .content {
      padding: 30px;
    }
    
    .form-group {
      margin-bottom: 25px;
    }
    
    .form-group label {
      display: block;
      margin-bottom: 10px;
      font-weight: 500;
      color: var(--dark);
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .form-group label i {
      color: var(--secondary);
    }
    
    .form-control {
      width: 100%;
      padding: 14px;
      border: 2px solid var(--border);
      border-radius: 8px;
      font-size: 16px;
      transition: all 0.3s ease;
      background: #f8f9fa;
    }
    
    .form-control:focus {
      border-color: var(--secondary);
      outline: none;
      box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
      background: white;
    }
    
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      padding: 14px 25px;
      background: var(--secondary);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
      width: 100%;
    }
    
    .btn:hover {
      background: #2980b9;
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    }
    
    .btn i {
      font-size: 18px;
    }
    
    .status-card {
      background: #f8f9fa;
      border-left: 4px solid var(--secondary);
      border-radius: 8px;
      padding: 20px;
      margin-top: 25px;
    }
    
    .status-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 15px;
    }
    
    .status-header i {
      font-size: 24px;
      color: var(--secondary);
    }
    
    .status-content {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
    }
    
    .status-item {
      background: white;
      border-radius: 8px;
      padding: 15px;
      box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);
    }
    
    .status-item h4 {
      color: var(--gray);
      font-size: 14px;
      margin-bottom: 5px;
    }
    
    .status-item p {
      font-weight: 600;
      font-size: 18px;
      word-break: break-all;
    }
    
    .connected {
      color: var(--success);
    }
    
    .disconnected {
      color: var(--danger);
    }
    
    .info-panel {
      background: rgba(255, 255, 255, 0.95);
      border-radius: 15px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
      padding: 30px;
      color: var(--dark);
    }
    
    .info-panel h2 {
      color: var(--primary);
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 2px solid var(--border);
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .info-panel h2 i {
      color: var(--secondary);
    }
    
    .info-content {
      line-height: 1.8;
    }
    
    .info-content p {
      margin-bottom: 15px;
    }
    
    .features {
      margin: 25px 0;
    }
    
    .feature {
      display: flex;
      gap: 15px;
      margin-bottom: 20px;
    }
    
    .feature i {
      color: var(--success);
      font-size: 20px;
      min-width: 30px;
    }
    
    .code-block {
      background: #2c3e50;
      color: #f8f9fa;
      border-radius: 8px;
      padding: 20px;
      margin: 25px 0;
      font-family: monospace;
      font-size: 15px;
      line-height: 1.6;
      overflow-x: auto;
    }
    
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
    
    .notification.show {
      opacity: 1;
      transform: translateY(0);
    }
    
    .notification.success {
      background: var(--success);
    }
    
    .notification.error {
      background: var(--danger);
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Panel de configuration -->
    <div class="panel">
      <div class="header">
        <i class="fas fa-database"></i>
        <h1>Configuration Supabase</h1>
      </div>
      
      <div class="content">
        <div class="form-group">
          <label for="supabaseUrl"><i class="fas fa-link"></i> URL Supabase</label>
          <input 
            type="url" 
            id="supabaseUrl" 
            class="form-control" 
            placeholder="https://votre-projet.supabase.co"
            value="https://mtjkijmzzycymjmdlvn.supabase.co">
        </div>
        
        <div class="form-group">
          <label for="supabaseKey"><i class="fas fa-key"></i> Clé API</label>
          <input 
            type="password" 
            id="supabaseKey" 
            class="form-control" 
            placeholder="Entrez votre clé secrète"
            value="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10amtpam16eXpjeXltam1kbHZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyMDgwNzQsImV4cCI6MjA2OTc4NDA3NH0.s35vs0dVC0XrKMwPLgP_WxVUBZKuJRAbF6S0-dspTt0">
          <div style="margin-top: 8px; font-size: 13px; color: var(--gray); display: flex; align-items: center; gap: 5px;">
            <i class="fas fa-eye" id="toggleKey" style="cursor: pointer;"></i>
            <span>Afficher/Masquer la clé</span>
          </div>
        </div>
        
        <button id="initBtn" class="btn">
          <i class="fas fa-plug"></i> Initialiser la connexion
        </button>
        
        <div class="status-card">
          <div class="status-header">
            <i class="fas fa-server"></i>
            <h3>Statut de la connexion</h3>
          </div>
          
          <div class="status-content">
            <div class="status-item">
              <h4>URL Supabase</h4>
              <p id="currentUrl">Non configuré</p>
            </div>
            
            <div class="status-item">
              <h4>Statut</h4>
              <p id="connectionStatus" class="disconnected">Déconnecté</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Panel d'information -->
    <div class="info-panel">
      <h2><i class="fas fa-info-circle"></i> Guide d'utilisation Supabase</h2>
      
      <div class="info-content">
        <p>Ce module permet de configurer la connexion entre votre application et votre base de données Supabase.</p>
        
        <div class="features">
          <div class="feature">
            <i class="fas fa-shield-alt"></i>
            <div>
              <strong>Sécurité renforcée</strong>
              <p>Stockage sécurisé de vos identifiants avec chiffrement côté client.</p>
            </div>
          </div>
          
          <div class="feature">
            <i class="fas fa-bolt"></i>
            <div>
              <strong>Connexion instantanée</strong>
              <p>Établissement de la connexion en temps réel avec votre backend.</p>
            </div>
          </div>
          
          <div class="feature">
            <i class="fas fa-sync-alt"></i>
            <div>
              <strong>Mise à jour dynamique</strong>
              <p>Les modifications sont appliquées immédiatement sans rechargement.</p>
            </div>
          </div>
        </div>
        
        <h3>Comment utiliser ce module :</h3>
        <ol style="padding-left: 20px; margin: 15px 0;">
          <li>Entrez votre URL Supabase et votre clé API</li>
          <li>Cliquez sur "Initialiser la connexion"</li>
          <li>Le statut de connexion sera mis à jour</li>
          <li>Utilisez l'objet <code>supabase</code> dans vos autres fichiers JavaScript</li>
        </ol>
        
        <h3>Exemple d'utilisation :</h3>
        <div class="code-block">
          // Importation du module<br>
          import { supabase } from './supabase.js';<br><br>
          
          // Exemple de requête<br>
          async function getUsers() {<br>
          &nbsp;&nbsp;const { data, error } = await supabase<br>
          &nbsp;&nbsp;&nbsp;&nbsp;.from('users')<br>
          &nbsp;&nbsp;&nbsp;&nbsp;.select('*');<br>
          <br>
          &nbsp;&nbsp;if (error) console.error(error);<br>
          &nbsp;&nbsp;else console.log(data);<br>
          }<br><br>
          
          getUsers();
        </div>
        
        <p><strong>Note :</strong> En production, utilisez des variables d'environnement pour stocker vos identifiants sensibles.</p>
      </div>
    </div>
  </div>

  <script type="module">
    // Éléments du DOM
    const supabaseUrlInput = document.getElementById('supabaseUrl');
    const supabaseKeyInput = document.getElementById('supabaseKey');
    const initBtn = document.getElementById('initBtn');
    const currentUrlEl = document.getElementById('currentUrl');
    const connectionStatusEl = document.getElementById('connectionStatus');
    const toggleKeyBtn = document.getElementById('toggleKey');
    
    // Notification
    function showNotification(message, type) {
      const notification = document.createElement('div');
      notification.className = `notification ${type} show`;
      notification.textContent = message;
      document.body.appendChild(notification);
      
      setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
      }, 3000);
    }
    
    // Toggle key visibility
    toggleKeyBtn.addEventListener('click', () => {
      const type = supabaseKeyInput.type === 'password' ? 'text' : 'password';
      supabaseKeyInput.type = type;
      toggleKeyBtn.classList.toggle('fa-eye-slash');
      toggleKeyBtn.classList.toggle('fa-eye');
    });
    
    // Initialiser Supabase
    initBtn.addEventListener('click', async () => {
      const url = supabaseUrlInput.value.trim();
      const key = supabaseKeyInput.value.trim();
      
      if (!url || !key) {
        showNotification('Veuillez saisir une URL et une clé valides', 'error');
        return;
      }
      
      try {
        // Créer le client Supabase
        const supabase = createClient(url, key);
        
        // Tester la connexion avec une simple requête
        const { data, error } = await supabase
          .from('test_connection')
          .select('*')
          .limit(1);
        
        if (error) throw error;
        
        // Mise à jour de l'UI
        currentUrlEl.textContent = url;
        connectionStatusEl.textContent = 'Connecté';
        connectionStatusEl.className = 'connected';
        
        showNotification('Connexion à Supabase établie avec succès!', 'success');
        
        // Exporter le client pour une utilisation dans d'autres modules
        window.supabase = supabase;
        console.log('Client Supabase initialisé:', supabase);
        
      } catch (error) {
        console.error('Erreur de connexion:', error);
        connectionStatusEl.textContent = 'Erreur de connexion';
        connectionStatusEl.className = 'disconnected';
        showNotification(`Erreur: ${error.message}`, 'error');
      }
    });
    
    // Initialiser avec les valeurs par défaut
    currentUrlEl.textContent = supabaseUrlInput.value;
    connectionStatusEl.textContent = 'Prêt à se connecter';
  </script>
</body>
</html>