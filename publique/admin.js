  // Données de démonstration
        const requestsData = [
            {
                name: "Ahmed Mahamat",
                phone: "60604660",
                email: "ahmed@example.td",
                interest: "Adhésion",
                date: "15/07/2025",
                status: "En attente",
                message: "Je souhaite adhérer au groupe pour investir dans l'immobilier."
            },
            {
                name: "Fatime Ousmane",
                phone: "61234567",
                email: "fatime@example.td",
                interest: "Plus d'infos",
                date: "14/07/2025",
                status: "Approuvée",
                message: "J'aimerais avoir plus d'informations sur les modalités d'investissement."
            },
            {
                name: "Hassan Abakar",
                phone: "65789012",
                email: "hassan@example.td",
                interest: "Adhésion",
                date: "13/07/2025",
                status: "En attente",
                message: "Je suis intéressé par l'adhésion au groupe GESS INVEST."
            },
            {
                name: "Aïcha Hassan",
                phone: "62345678",
                email: "aicha@example.td",
                interest: "Proposition",
                date: "12/07/2025",
                status: "Rejetée",
                message: "Proposition d'un nouveau projet immobilier à N'Djamena."
            },
            {
                name: "Moussa Ali",
                phone: "63456789",
                email: "moussa@example.td",
                interest: "Adhésion",
                date: "11/07/2025",
                status: "Approuvée",
                message: "Demande d'adhésion au groupe."
            }
        ];

        // Navigation entre les sections
        document.querySelectorAll('.nav-links li a').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Remove active class from all links
                document.querySelectorAll('.nav-links li a').forEach(item => {
                    item.classList.remove('active');
                });
                
                // Add active class to clicked link
                this.classList.add('active');
                
                // Get target section
                const sectionId = this.getAttribute('data-section');
                
                // Hide all sections
                document.querySelectorAll('#dashboard, #members, #settings, #statistics').forEach(section => {
                    section.style.display = 'none';
                });
                
                // Show the selected section
                if (sectionId === 'dashboard') {
                    document.getElementById('dashboard').style.display = 'block';
                } else if (sectionId === 'members') {
                    document.getElementById('members').style.display = 'block';
                } else if (sectionId === 'settings') {
                    document.getElementById('settings').style.display = 'block';
                } else if (sectionId === 'statistics') {
                    document.getElementById('statistics').style.display = 'block';
                    initStatisticsCharts();
                } else if (sectionId === 'requests') {
                    document.getElementById('dashboard').style.display = 'block';
                }
            });
        });
        
        // Tabs in settings
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                // Remove active class from all tabs
                document.querySelectorAll('.tab-btn').forEach(tab => {
                    tab.classList.remove('active');
                });
                
                // Add active class to clicked tab
                this.classList.add('active');
                
                // Get target tab
                const tabId = this.getAttribute('data-tab');
                
                // Hide all tab contents
                document.querySelectorAll('.tab-content').forEach(content => {
                    content.classList.remove('active');
                });
                
                // Show the selected tab content
                document.getElementById(`${tabId}-tab`).classList.add('active');
            });
        });
        
        // Download members list
        document.getElementById('downloadMembers').addEventListener('click', function() {
            // Créer un fichier Excel
            const members = [
                { Nom: 'Ahmed Mahamat', Téléphone: '60604660', Email: 'ahmed@example.td', Parts: 15, 'Membre depuis': '15/06/2025' },
                { Nom: 'Moussa Ali', Téléphone: '63456789', Email: 'moussa@example.td', Parts: 22, 'Membre depuis': '12/05/2025' },
                { Nom: 'Fatime Ousmane', Téléphone: '61234567', Email: 'fatime@example.td', Parts: 18, 'Membre depuis': '20/04/2025' },
                { Nom: 'Hassan Abakar', Téléphone: '65789012', Email: 'hassan@example.td', Parts: 10, 'Membre depuis': '05/07/2025' }
            ];
            
            // Créer un worksheet
            const ws = XLSX.utils.json_to_sheet(members);
            
            // Créer un workbook
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Membres");
            
            // Sauvegarder le fichier
            XLSX.writeFile(wb, "membres_gess_invest.xlsx");
            
            showNotification("Téléchargement réussi", "La liste des membres a été téléchargée avec succès.", "success");
        });
        
        // Export data
        document.getElementById('exportData').addEventListener('click', function() {
            // Créer un workbook avec plusieurs feuilles
            const wb = XLSX.utils.book_new();
            
            // Feuille 1: Statistiques
            const statsData = [
                { Métrique: "Membres actifs", Valeur: 42 },
                { Métrique: "Fonds collectés (XAF)", Valeur: "8.2M" },
                { Métrique: "Taux d'approbation", Valeur: "92%" },
                { Métrique: "Croissance mensuelle", Valeur: "+28%" }
            ];
            const ws1 = XLSX.utils.json_to_sheet(statsData);
            XLSX.utils.book_append_sheet(wb, ws1, "Statistiques");
            
            // Feuille 2: Demandes
            const ws2 = XLSX.utils.json_to_sheet(requestsData);
            XLSX.utils.book_append_sheet(wb, ws2, "Demandes");
            
            // Sauvegarder le fichier
            XLSX.writeFile(wb, "statistiques_gess_invest.xlsx");
            
            showNotification("Export réussi", "Les données statistiques ont été exportées avec succès.", "success");
        });
        
        // Initialize charts for dashboard
        function initDashboardCharts() {
            // Requests status chart
            const requestsCtx = document.getElementById('requestsChart').getContext('2d');
            new Chart(requestsCtx, {
                type: 'doughnut',
                data: {
                    labels: ['En attente', 'Approuvées', 'Rejetées'],
                    datasets: [{
                        data: [8, 14, 2],
                        backgroundColor: [
                            'rgba(243, 156, 18, 0.7)',
                            'rgba(46, 204, 113, 0.7)',
                            'rgba(231, 76, 60, 0.7)'
                        ],
                        borderColor: [
                            'rgba(243, 156, 18, 1)',
                            'rgba(46, 204, 113, 1)',
                            'rgba(231, 76, 60, 1)'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
            
            // Monthly chart
            const monthlyCtx = document.getElementById('monthlyChart').getContext('2d');
            new Chart(monthlyCtx, {
                type: 'line',
                data: {
                    labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil'],
                    datasets: [{
                        label: 'Nouvelles adhésions',
                        data: [3, 5, 7, 8, 12, 15, 24],
                        fill: false,
                        borderColor: 'rgba(52, 152, 219, 1)',
                        tension: 0.1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }
        
        // Initialize charts for statistics section
        function initStatisticsCharts() {
            // Region distribution chart
            const regionCtx = document.getElementById('regionChart').getContext('2d');
            new Chart(regionCtx, {
                type: 'bar',
                data: {
                    labels: ['N\'Djamena', 'Moundou', 'Sarh', 'Abéché', 'Doba'],
                    datasets: [{
                        label: 'Investissements (millions XAF)',
                        data: [3.2, 1.8, 1.2, 0.9, 1.1],
                        backgroundColor: 'rgba(52, 152, 219, 0.7)',
                        borderColor: 'rgba(52, 152, 219, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
            
            // Project performance chart
            const projectCtx = document.getElementById('projectChart').getContext('2d');
            new Chart(projectCtx, {
                type: 'radar',
                data: {
                    labels: ['Rentabilité', 'Risque', 'Durée', 'Croissance', 'Satisfaction'],
                    datasets: [{
                        label: 'Projet Résidence Liberté',
                        data: [85, 65, 70, 80, 90],
                        fill: true,
                        backgroundColor: 'rgba(46, 204, 113, 0.2)',
                        borderColor: 'rgba(46, 204, 113, 1)',
                        pointBackgroundColor: 'rgba(46, 204, 113, 1)',
                        pointBorderColor: '#fff',
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: 'rgba(46, 204, 113, 1)'
                    }, {
                        label: 'Projet Complexe Salam',
                        data: [70, 75, 85, 65, 80],
                        fill: true,
                        backgroundColor: 'rgba(155, 89, 182, 0.2)',
                        borderColor: 'rgba(155, 89, 182, 1)',
                        pointBackgroundColor: 'rgba(155, 89, 182, 1)',
                        pointBorderColor: '#fff',
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: 'rgba(155, 89, 182, 1)'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    elements: {
                        line: {
                            borderWidth: 3
                        }
                    }
                }
            });
            
            // Age distribution chart
            const ageCtx = document.getElementById('ageChart').getContext('2d');
            new Chart(ageCtx, {
                type: 'pie',
                data: {
                    labels: ['18-25 ans', '26-35 ans', '36-45 ans', '46-55 ans', '56+ ans'],
                    datasets: [{
                        data: [12, 35, 28, 18, 7],
                        backgroundColor: [
                            'rgba(52, 152, 219, 0.7)',
                            'rgba(46, 204, 113, 0.7)',
                            'rgba(155, 89, 182, 0.7)',
                            'rgba(241, 196, 15, 0.7)',
                            'rgba(230, 126, 34, 0.7)'
                        ],
                        borderColor: [
                            'rgba(52, 152, 219, 1)',
                            'rgba(46, 204, 113, 1)',
                            'rgba(155, 89, 182, 1)',
                            'rgba(241, 196, 15, 1)',
                            'rgba(230, 126, 34, 1)'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
            
            // Funds collection chart
            const fundsCtx = document.getElementById('fundsChart').getContext('2d');
            new Chart(fundsCtx, {
                type: 'line',
                data: {
                    labels: ['2020', '2021', '2022', '2023', '2024', '2025'],
                    datasets: [{
                        label: 'Fonds collectés (millions XAF)',
                        data: [2.1, 3.4, 4.2, 5.8, 6.7, 8.2],
                        fill: false,
                        borderColor: 'rgba(26, 188, 156, 1)',
                        tension: 0.1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
            
            // Projects status chart
            const projectsCtx = document.getElementById('projectsChart').getContext('2d');
            new Chart(projectsCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Terminés', 'En cours', 'Planifiés'],
                    datasets: [{
                        data: [8, 12, 5],
                        backgroundColor: [
                            'rgba(46, 204, 113, 0.7)',
                            'rgba(52, 152, 219, 0.7)',
                            'rgba(243, 156, 18, 0.7)'
                        ],
                        borderColor: [
                            'rgba(46, 204, 113, 1)',
                            'rgba(52, 152, 219, 1)',
                            'rgba(243, 156, 18, 1)'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
        }
        
        // Action buttons
        document.querySelectorAll('.btn-approve').forEach((btn, index) => {
            btn.addEventListener('click', function() {
                const row = this.closest('tr');
                row.querySelector('.status').textContent = 'Approuvée';
                row.querySelector('.status').className = 'status approved';
                
                // Mettre à jour les données
                requestsData[index].status = "Approuvée";
                
                // Envoyer une notification au membre
                const request = requestsData[index];
                const message = `Cher ${request.name}, votre demande d'adhésion à GESS INVEST a été approuvée. Bienvenue parmi nous !`;
                sendNotificationToMember(request, message);
            });
        });
        
        document.querySelectorAll('.btn-reject').forEach((btn, index) => {
            btn.addEventListener('click', function() {
                const row = this.closest('tr');
                row.querySelector('.status').textContent = 'Rejetée';
                row.querySelector('.status').className = 'status rejected';
                
                // Mettre à jour les données
                requestsData[index].status = "Rejetée";
            });
        });
        
        document.querySelectorAll('.btn-view').forEach((btn, index) => {
            btn.addEventListener('click', function() {
                const request = requestsData[index];
                showRequestDetails(request);
            });
        });
        
        // Stats cards click actions
        document.querySelectorAll('.stat-card').forEach(card => {
            card.addEventListener('click', function() {
                const id = this.id;
                let message = "";
                
                if (id === 'totalRequests') message = "Affichage de toutes les demandes";
                if (id === 'pendingRequests') message = "Filtrage des demandes en attente";
                if (id === 'approvedRequests') message = "Filtrage des demandes approuvées";
                if (id === 'rejectedRequests') message = "Filtrage des demandes rejetées";
                
                showNotification("Action", message, "info");
            });
        });
        
        // Filtrage des demandes
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const filter = this.getAttribute('data-filter');
                
                // Mettre à jour le bouton actif
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                // Filtrer les lignes
                const rows = document.querySelectorAll('table tbody tr');
                rows.forEach(row => {
                    if (filter === 'all') {
                        row.style.display = '';
                    } else {
                        const status = row.getAttribute('data-status');
                        row.style.display = status === filter ? '' : 'none';
                    }
                });
            });
        });
        
        // Modal functions
        function showRequestDetails(request) {
            document.getElementById('detail-name').textContent = request.name;
            document.getElementById('detail-phone').textContent = request.phone;
            document.getElementById('detail-email').textContent = request.email;
            document.getElementById('detail-interest').textContent = request.interest;
            document.getElementById('detail-date').textContent = request.date;
            document.getElementById('detail-status').textContent = request.status;
            document.getElementById('detail-message').textContent = request.message;
            
            document.getElementById('requestDetailModal').style.display = 'block';
        }
        
        // Fermer la modal
        document.querySelector('.close-modal').addEventListener('click', function() {
            document.getElementById('requestDetailModal').style.display = 'none';
        });
        
        // Fermer en cliquant en dehors
        window.addEventListener('click', function(event) {
            if (event.target === document.getElementById('requestDetailModal')) {
                document.getElementById('requestDetailModal').style.display = 'none';
            }
        });
        
        // Envoyer notification depuis la modal
        document.getElementById('sendNotification').addEventListener('click', function() {
            const name = document.getElementById('detail-name').textContent;
            const email = document.getElementById('detail-email').textContent;
            const phone = document.getElementById('detail-phone').textContent;
            const status = document.getElementById('detail-status').textContent;
            
            if (status === "Approuvée") {
                const message = `Cher ${name}, votre demande d'adhésion à GESS INVEST a été approuvée. Bienvenue parmi nous !`;
                sendNotificationToMember({name, email, phone}, message);
            } else {
                showNotification("Notification", "La demande doit être approuvée avant d'envoyer une notification.", "warning");
            }
        });
        
        // Fonction pour envoyer une notification au membre
        function sendNotificationToMember(member, message) {
            // Dans une application réelle, on utiliserait une API pour envoyer par email ou WhatsApp
            // Ici, nous simulons juste l'envoi
            
            const notification = `
                <div class="notification success">
                    <i class="fas fa-check-circle notification-icon"></i>
                    <div class="notification-content">
                        <div class="notification-title">Notification envoyée</div>
                        <div class="notification-message">
                            ${message}<br>
                            Destinataire: ${member.name} (${member.email}, ${member.phone})
                        </div>
                    </div>
                    <button class="close-notification">&times;</button>
                </div>
            `;
            
            // Ajouter la notification au panneau
            const panel = document.getElementById('notificationPanel');
            panel.insertAdjacentHTML('afterbegin', notification);
            
            // Fermer la notification
            panel.querySelector('.close-notification').addEventListener('click', function() {
                this.closest('.notification').remove();
            });
            
            // Supprimer automatiquement après 5 secondes
            setTimeout(() => {
                const notif = panel.querySelector('.notification');
                if (notif) notif.remove();
            }, 5000);
        }
        
        // Fonction pour afficher une notification
        function showNotification(title, message, type) {
            const notification = `
                <div class="notification ${type}">
                    <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle'} notification-icon"></i>
                    <div class="notification-content">
                        <div class="notification-title">${title}</div>
                        <div class="notification-message">${message}</div>
                    </div>
                    <button class="close-notification">&times;</button>
                </div>
            `;
            
            // Ajouter la notification au panneau
            const panel = document.getElementById('notificationPanel');
            panel.insertAdjacentHTML('afterbegin', notification);
            
            // Fermer la notification
            panel.querySelector('.close-notification').addEventListener('click', function() {
                this.closest('.notification').remove();
            });
            
            // Supprimer automatiquement après 5 secondes
            setTimeout(() => {
                const notif = panel.querySelector('.notification');
                if (notif) notif.remove();
            }, 5000);
        }
        
        // Simuler une notification mensuelle
        function simulateMonthlyNotification() {
            const members = [
                { name: "Ahmed Mahamat", email: "ahmed@example.td", phone: "60604660", shares: 15, total: 150000 },
                { name: "Moussa Ali", email: "moussa@example.td", phone: "63456789", shares: 22, total: 220000 },
                { name: "Fatime Ousmane", email: "fatime@example.td", phone: "61234567", shares: 18, total: 180000 },
                { name: "Hassan Abakar", email: "hassan@example.td", phone: "65789012", shares: 10, total: 100000 }
            ];
            
            members.forEach(member => {
                const message = `Cher ${member.name}, votre contribution mensuelle est de ${member.shares} parts (${member.total.toLocaleString()} XAF). Total cumulé: ${(member.shares * 10000).toLocaleString()} XAF.`;
                
                // Simuler l'envoi
                setTimeout(() => {
                    sendNotificationToMember(member, message);
                }, Math.random() * 5000);
            });
        }
        
        // Initialize charts when page loads
        document.addEventListener('DOMContentLoaded', function() {
            initDashboardCharts();
            
            // Simuler une notification mensuelle (dans la réalité, ce serait planifié)
            setTimeout(simulateMonthlyNotification, 3000);
        });