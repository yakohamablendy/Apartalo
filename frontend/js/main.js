// ===== CLASE PRINCIPAL DE LA APLICACIÓN (VERSIÓN FINAL Y ROBUSTA) =====
class ApartaloApp {
    constructor() {
        // Nombres estandarizados para localStorage
        this.TOKEN_KEY = 'apartalo_token';
        this.USER_KEY = 'apartalo_user';

        // Cargar datos al iniciar
        this.token = localStorage.getItem(this.TOKEN_KEY);
        this.user = JSON.parse(localStorage.getItem(this.USER_KEY) || 'null');
        
        this.API_URL = 'http://localhost:3000/api';
        
        // Esperar a que el HTML esté listo antes de ejecutar cualquier lógica del DOM
        document.addEventListener('DOMContentLoaded', () => this.initNavbar());
    }

    isAuthenticated() {
        return !!this.token;
    }
    
    getUser() {
        return this.user;
    }

    async makeRequest(endpoint, options = {}) {
        const url = `${this.API_URL}${endpoint}`;
        const defaultOptions = { headers: { 'Content-Type': 'application/json' } };
        if (this.token) {
            defaultOptions.headers['Authorization'] = `Bearer ${this.token}`;
        }
        const finalOptions = { ...defaultOptions, ...options };
        try {
            const response = await fetch(url, finalOptions);
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Ocurrió un error en el servidor');
            }
            return data;
        } catch (error) {
            console.error(`Error en makeRequest a ${endpoint}:`, error);
            throw error;
        }
    }

    login(token, userData) {
        localStorage.setItem(this.TOKEN_KEY, token);
        localStorage.setItem(this.USER_KEY, JSON.stringify(userData));
        this.token = token;
        this.user = userData;
        // Forzar la actualización de la barra de navegación después de iniciar sesión
        this.initNavbar(); 
    }

    logout() {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
        this.token = null;
        this.user = null;
        window.location.href = '/index.html'; 
    }

    async register(userData) {
        return this.makeRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    validateEmail(email) {
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }
    
    validateRequired(value) {
        return value && value.trim() !== '';
    }

    showAlert(message, type = 'info') {
        const alertContainer = document.getElementById('alert-container');
        if (alertContainer) {
            const alertDiv = document.createElement('div');
            alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
            alertDiv.role = 'alert';
            alertDiv.innerHTML = `${message}<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>`;
            alertContainer.prepend(alertDiv);
        }
    }
    
    initNavbar() {
        const navbarContainer = document.getElementById('main-navbar');
        if (!navbarContainer) return;
        
        // Recargar los datos del usuario por si acaso
        this.token = localStorage.getItem(this.TOKEN_KEY);
        this.user = JSON.parse(localStorage.getItem(this.USER_KEY) || 'null');

        let navLinks = `<div class="container"><a class="navbar-brand fw-bold" href="/index.html"><i class="fas fa-utensils me-2"></i>APARTALO</a><button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"><span class="navbar-toggler-icon"></span></button><div class="collapse navbar-collapse" id="navbarNav"><ul class="navbar-nav ms-auto"><li class="nav-item"><a class="nav-link" href="/index.html">Inicio</a></li>`;
        
        if (this.isAuthenticated()) {
            if (this.user && this.user.rol === 'admin') {
                navLinks += `<li class="nav-item"><a class="nav-link fw-bold text-warning" href="/pages/admin.html"><i class="fas fa-shield-alt me-1"></i>Admin Panel</a></li>`;
            }
            navLinks += `<li class="nav-item"><a class="nav-link" href="/pages/reservas.html">Reservar</a></li><li class="nav-item"><a class="nav-link" href="/pages/historial.html">Mis Reservas</a></li><li class="nav-item dropdown"><a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false"><i class="fas fa-user-circle me-1"></i> ${this.user.nombre}</a><ul class="dropdown-menu dropdown-menu-end"><li><a class="dropdown-item" href="#" onclick="window.apartalo.logout()">Cerrar Sesión</a></li></ul></li>`;
        } else {
            navLinks += `<li class="nav-item"><a class="nav-link" href="/pages/login.html">Iniciar Sesión</a></li><li class="nav-item"><a class="btn btn-warning" href="/pages/registro.html">Registrarse</a></li>`;
        }
        navLinks += `</ul></div></div>`;
        navbarContainer.innerHTML = navLinks;
    }
}

// Inicializar la aplicación de forma segura
if (window) {
    window.apartalo = new ApartaloApp();
}