document.addEventListener('DOMContentLoaded', () => {
    // Verificar si ya está logueado
    if (window.apartalo && window.apartalo.token) {
        window.location.href = 'historial.html';
        return;
    }

    const registroForm = document.getElementById('registro-form');
    const nombreInput = document.getElementById('nombre');
    const telefonoInput = document.getElementById('telefono');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const termsInput = document.getElementById('terms');
    const registroBtn = document.getElementById('registro-btn');
    
    const togglePassword = document.getElementById('toggle-password');
    const toggleConfirmPassword = document.getElementById('toggle-confirm-password');

    
    togglePassword.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        togglePassword.innerHTML = type === 'password' ? 
            '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
    });

    toggleConfirmPassword.addEventListener('click', () => {
        const type = confirmPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        confirmPasswordInput.setAttribute('type', type);
        toggleConfirmPassword.innerHTML = type === 'password' ? 
            '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
    });

    
    confirmPasswordInput.addEventListener('input', () => {
        if (confirmPasswordInput.value && passwordInput.value !== confirmPasswordInput.value) {
            confirmPasswordInput.setCustomValidity('Las contraseñas no coinciden');
        } else {
            confirmPasswordInput.setCustomValidity('');
        }
    });

    passwordInput.addEventListener('input', () => {
        if (confirmPasswordInput.value && passwordInput.value !== confirmPasswordInput.value) {
            confirmPasswordInput.setCustomValidity('Las contraseñas no coinciden');
        } else {
            confirmPasswordInput.setCustomValidity('');
        }
    });

   
    telefonoInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length >= 6) {
            value = value.substring(0, 3) + '-' + value.substring(3, 6) + '-' + value.substring(6, 10);
        } else if (value.length >= 3) {
            value = value.substring(0, 3) + '-' + value.substring(3);
        }
        e.target.value = value;
    });

    
    registroForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleRegistro();
    });

    
    async function handleRegistro() {
        const formData = {
            nombre: nombreInput.value.trim(),
            telefono: telefonoInput.value.trim(),
            email: emailInput.value.trim(),
            password: passwordInput.value,
            confirmPassword: confirmPasswordInput.value
        };

        
        registroForm.classList.remove('was-validated');
        clearValidationErrors();

        
        let isValid = validateForm(formData);

        if (!isValid) {
            registroForm.classList.add('was-validated');
            return;
        }

       
        registroBtn.disabled = true;
        registroBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Creando cuenta...';
        window.apartalo.showLoading(true);

        try {
            const userData = {
                nombre: formData.nombre,
                email: formData.email,
                password: formData.password,
                telefono: formData.telefono
            };

            const response = await window.apartalo.register(userData);
            
            window.apartalo.showAlert(
                '¡Cuenta creada exitosamente! Puedes iniciar sesión ahora.', 
                'success'
            );
            
            // Redirect after success
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);

        } catch (error) {
            console.error('Error en registro:', error);
            window.apartalo.showAlert(
                error.message || 'Error al crear la cuenta. Intenta nuevamente.',
                'danger'
            );
        } finally {
            // Reset button
            registroBtn.disabled = false;
            registroBtn.innerHTML = '<i class="fas fa-user-plus me-2"></i>Crear Cuenta';
            window.apartalo.showLoading(false);
        }
    }

    function validateForm(data) {
        let isValid = true;

       
        if (!window.apartalo.validateRequired(data.nombre) || data.nombre.length < 2) {
            nombreInput.classList.add('is-invalid');
            isValid = false;
        }

       
        const phoneRegex = /^\d{3}-\d{3}-\d{4}$/;
        if (!phoneRegex.test(data.telefono)) {
            telefonoInput.classList.add('is-invalid');
            isValid = false;
        }

        
        if (!window.apartalo.validateEmail(data.email)) {
            emailInput.classList.add('is-invalid');
            isValid = false;
        }

        
        if (!window.apartalo.validateRequired(data.password) || data.password.length < 6) {
            passwordInput.classList.add('is-invalid');
            isValid = false;
        }

       
        if (data.password !== data.confirmPassword) {
            confirmPasswordInput.classList.add('is-invalid');
            confirmPasswordInput.setCustomValidity('Las contraseñas no coinciden');
            isValid = false;
        }

        
        if (!termsInput.checked) {
            termsInput.classList.add('is-invalid');
            isValid = false;
        }

        return isValid;
    }

    function clearValidationErrors() {
        [nombreInput, telefonoInput, emailInput, passwordInput, confirmPasswordInput, termsInput]
            .forEach(input => input.classList.remove('is-invalid'));
    }

   
    nombreInput.focus();
});