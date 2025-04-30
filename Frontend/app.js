const loginForm = document.getElementById('loginForm');
const eventsGrid = document.getElementById('eventsGrid');
const qrModal = document.getElementById('qrModal');
const closeQrModal = document.getElementById('closeQrModal');

if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
}

if (closeQrModal) {
    closeQrModal.addEventListener('click', () => {
        qrModal.style.display = 'none';
    });
}

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            localStorage.setItem('token', data.token);
            window.location.href = '/events';
        } else {
            alert(data.message || 'Login failed');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred during login');
    }
}

async function loadEvents() {
    if (!eventsGrid) return;
    
    try {
        const response = await fetch('/api/events');
        const events = await response.json();
        
        eventsGrid.innerHTML = '';
        
        events.forEach(event => {
            const eventCard = document.createElement('div');
            eventCard.className = 'event-card';
            eventCard.innerHTML = `
                <img src="${event.image || 'https://via.placeholder.com/300x180'}" alt="${event.title}" class="event-image">
                <div class="event-content">
                    <h3 class="event-title">${event.title}</h3>
                    <div class="event-meta">
                        <i class="fas fa-calendar-alt"></i>
                        <span>${new Date(event.date).toLocaleDateString()}</span>
                    </div>
                    <div class="event-meta">
                        <i class="fas fa-clock"></i>
                        <span>${event.time}</span>
                    </div>
                    <div class="event-meta">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${event.location}</span>
                    </div>
                    <p class="event-description">${event.description}</p>
                    <div class="event-footer">
                        <span class="event-status">${event.attendees.length}/${event.capacity} Registered</span>
                        <button class="btn btn-primary" data-event-id="${event._id}">Register</button>
                    </div>
                </div>
            `;
            eventsGrid.appendChild(eventCard);
        });
   
        document.querySelectorAll('[data-event-id]').forEach(button => {
            button.addEventListener('click', handleRegistration);
        });
    } catch (error) {
        console.error('Error loading events:', error);
    }
}

async function handleRegistration(e) {
    const eventId = e.target.getAttribute('data-event-id');
    
    try {
        const response = await fetch(`/api/events/${eventId}/register`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            document.getElementById('qrModal').style.display = 'flex';
            document.getElementById('qrImage').src = data.qrCode;
        } else {
            alert(data.message || 'Registration failed');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred during registration');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    
    if (token && (window.location.pathname === '/login' || window.location.pathname === '/register')) {
        window.location.href = '/events';
    } else if (!token && !['/login', '/register'].includes(window.location.pathname)) {
        window.location.href = '/login';
    }
    
    if (window.location.pathname === '/events') {
        loadEvents();
    }
});