document.addEventListener('DOMContentLoaded', async function() {
    // Función para generar datos de ejemplo para el gráfico
    function generateChartData() {
        const data = [];
        const labels = [];
        const today = new Date();
        
        // Generar datos para los últimos 7 días
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            labels.push(date.toLocaleDateString('es-ES', { weekday: 'short' }));
        
            // Obtener datos del localStorage
            const storedData = localStorage.getItem(`visits_${date.toISOString().split('T')[0]}`) || 0;
            data.push(parseInt(storedData));
        }
        return { labels, data };
    }

    // Función para actualizar el gráfico
    function updateChart(chart, newData) {
        chart.data.datasets[0].data = newData;
        chart.update();
    }

    // Función para guardar datos de solicitud
    function saveRequestData() {
        const today = new Date().toISOString().split('T')[0];
        const currentCount = parseInt(localStorage.getItem(`requests_${today}`) || 0);
        localStorage.setItem(`requests_${today}`, currentCount + 1);
        return currentCount + 1;
    }

    // Inicializar el gráfico
    function initializeChart() {
        const ctx = document.getElementById('requestsChart');
        if (!ctx) return null;

        const chartData = generateChartData();
        return new Chart(ctx, {
            type: 'line',
            data: {
                labels: chartData.labels,
                datasets: [{
                    label: 'Visitas Diarias',
                    data: chartData.data,
                    fill: true,
                    backgroundColor: 'rgba(74, 144, 226, 0.2)',
                    borderColor: 'rgb(74, 144, 226)',
                    tension: 0.4,
                    pointBackgroundColor: 'rgb(74, 144, 226)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgb(74, 144, 226)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }

    // Añadir esta función después de la función initializeChart:
    function incrementDailyVisits() {
        const today = new Date().toISOString().split('T')[0];
        const currentCount = parseInt(localStorage.getItem(`visits_${today}`) || 0);
        localStorage.setItem(`visits_${today}`, currentCount + 1);
        
        const chart = Chart.getChart('requestsChart');
        if (chart) {
            const newData = [...chart.data.datasets[0].data];
            newData[newData.length - 1] = currentCount + 1;
            updateChart(chart, newData);
        }
    }

    // Manejar el envío del formulario
    const supportForm = document.getElementById('supportForm');
    if (supportForm) {
        supportForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const supportType = this.querySelector('select[name="supportType"]').value;
            
            if (!supportType) {
                showNotification('Por favor selecciona un tipo de apoyo', 'error');
                return;
            }
            
            // Guardar y actualizar datos
            const newCount = saveRequestData();
            const chart = Chart.getChart('requestsChart');
            if (chart) {
                const newData = [...chart.data.datasets[0].data];
                newData[newData.length - 1] = newCount;
                updateChart(chart, newData);
            }
            
            showNotification('Solicitud enviada correctamente. Nos pondremos en contacto pronto.', 'success');
            this.reset();
        });
    }

    // Inicializar el gráfico después de que todo esté cargado
    const chart = initializeChart();

    // Resto del código existente para emociones y notificaciones
    document.querySelectorAll('.emotion-grid div').forEach(emotion => {
        emotion.addEventListener('click', function() {
            document.querySelectorAll('.emotion-grid div').forEach(e => {
                e.classList.remove('selected');
            });
            
            this.classList.add('selected');
            
            const emotionText = this.textContent.trim();
            showNotification(`Has seleccionado que te sientes: ${emotionText}`);
            
            localStorage.setItem('lastEmotion', emotionText);
            localStorage.setItem('lastEmotionDate', new Date().toLocaleDateString());
        });
    });

    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }

    // Cargar emoción guardada
    const lastEmotion = localStorage.getItem('lastEmotion');
    const lastDate = localStorage.getItem('lastEmotionDate');
    
    if (lastEmotion && lastDate === new Date().toLocaleDateString()) {
        showNotification(`Ya registraste tu emoción hoy: ${lastEmotion}`);
        
        document.querySelectorAll('.emotion-grid div').forEach(emotion => {
            if (emotion.textContent.trim() === lastEmotion) {
                emotion.classList.add('selected');
            }
        });
    }

    // Banner de emergencia
    const emergencyBanner = document.querySelector('.emergency-banner');
    if (emergencyBanner) {
        setInterval(() => {
            emergencyBanner.classList.add('pulse');
            setTimeout(() => {
                emergencyBanner.classList.remove('pulse');
            }, 1000);
        }, 5000);
    }

    incrementDailyVisits();
});