// ===== LOGIN.JS - LÓGICA DEL FORMULARIO DE INICIO DE SESIÓN =====

document.addEventListener('DOMContentLoaded', () => {
    // Si el usuario ya está autenticado, lo redirigimos
    if (window.apartalo.isAuthenticated()) {
        window.location.href = 'historial.html';
        return;
    }

    // Referencias a los elementos del DOM
    const loginForm = document.getElementById('login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const loginBtn = document.getElementById('login-btn');
    const togglePassword = document.getElementById('toggle-password');

    // Evento para el botón de mostrar/ocultar contraseña
    if (togglePassword) {
        togglePassword.addEventListener('click', () => {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            togglePassword.innerHTML = type === 'password' ? 
                '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
        });
    }
    
    // Evento principal para el envío del formulario
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Prevenir el comportamiento por defecto
        handleLogin();
    });

    // Función que maneja la lógica de inicio de sesión
    async function handleLogin() {
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        // Validaciones
        if (!window.apartalo.validateEmail(email) || !window.apartalo.validateRequired(password)) {
            window.apartalo.showAlert('Por favor, ingresa un email y contraseña válidos.', 'warning');
            return;
        }

        // Deshabilitar botón y mostrar estado de carga
        loginBtn.disabled = true;
        loginBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Verificando...';
        
        try {
            // 1. Usamos 'makeRequest' para contactar al backend
            const response = await window.apartalo.makeRequest('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password })
            });
            
            // 2. Usamos 'login' de la clase principal para GUARDAR los datos recibidos
            window.apartalo.login(response.token, response.user);
            
            window.apartalo.showAlert('¡Bienvenido de vuelta!', 'success');
            
            // Redirigir al historial después de un login exitoso
            setTimeout(() => {
                window.location.href = 'historial.html';
            }, 1000);

        } catch (error) {
            // Manejar errores de la API (ej. credenciales incorrectas)
            window.apartalo.showAlert(error.message || 'Error al iniciar sesión.', 'danger');
            
            // Reactivar el botón si falla el login
            loginBtn.disabled = false;
            loginBtn.innerHTML = '<i class="fas fa-sign-in-alt me-2"></i>Iniciar Sesión';
        }
    }

    // Poner el foco en el campo de email al cargar la página
    emailInput.focus();
});