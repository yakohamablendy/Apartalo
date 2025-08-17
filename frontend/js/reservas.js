// ===== RESERVAS.JS - LÓGICA DEL SISTEMA DE RESERVAS (CORREGIDO) =====

document.addEventListener('DOMContentLoaded', () => {
    if (!window.apartalo.isAuthenticated()) {
        window.location.href = `login.html?redirect=reservas.html`;
        return;
    }

    const reserva = { fecha: null, hora: null, personas: null, mesa: null };

    const steps = {
        step1: document.getElementById('step1'), step2: document.getElementById('step2'), step3: document.getElementById('step3'),
    };
    const contents = {
        content1: document.getElementById('stepContent1'), content2: document.getElementById('stepContent2'), content3: document.getElementById('stepContent3'),
    };
    const inputs = {
        fecha: document.getElementById('fechaReserva'), personas: document.getElementById('numeroPersonas'),
        nombre: document.getElementById('nombreCompleto'), telefono: document.getElementById('telefono'),
        email: document.getElementById('email'), comentarios: document.getElementById('comentarios'),
    };
    const containers = {
        timeSlots: document.getElementById('timeSlots'), mesas: document.getElementById('mesasContainer'),
    };
    const buttons = {
        nextToTables: document.getElementById('nextToTables'), nextToForm: document.getElementById('nextToForm'),
        backToDateTime: document.getElementById('backToDateTime'), backToTables: document.getElementById('backToTables'),
        confirmar: document.getElementById('confirmarReserva'),
    };

    function init() {
        setMinDate();
        generateTimeSlots();
        bindEvents();
        cargarDatosUsuario();
        goToStep(1);
    }

    function setMinDate() {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        inputs.fecha.min = `${yyyy}-${mm}-${dd}`;
    }

    function generateTimeSlots() {
        const slots = ['18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00'];
        containers.timeSlots.innerHTML = slots.map(time => `
            <div class="time-slot" data-time="${time}"><strong>${time}</strong></div>`).join('');
    }
    
    function cargarDatosUsuario() {
        const user = window.apartalo.getUser();
        if (user) {
            inputs.nombre.value = user.nombre || '';
            inputs.email.value = user.email || '';
            inputs.telefono.value = user.telefono || '';
        }
    }

    function bindEvents() {
        inputs.fecha.addEventListener('change', validarPaso1);
        inputs.personas.addEventListener('change', validarPaso1);
        containers.timeSlots.addEventListener('click', e => {
            const slot = e.target.closest('.time-slot');
            if (slot && !slot.classList.contains('unavailable')) {
                document.querySelectorAll('.time-slot.selected').forEach(s => s.classList.remove('selected'));
                slot.classList.add('selected');
                reserva.hora = slot.dataset.time;
                validarPaso1();
            }
        });
        containers.mesas.addEventListener('click', e => {
            const card = e.target.closest('.mesa-card');
            if (card && !card.classList.contains('ocupada')) {
                document.querySelectorAll('.mesa-card.selected').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                reserva.mesa = JSON.parse(card.dataset.mesa);
                validarPaso2();
            }
        });
        buttons.nextToTables.addEventListener('click', () => { goToStep(2); cargarMesasDisponibles(); });
        buttons.nextToForm.addEventListener('click', () => { goToStep(3); actualizarResumen(); });
        buttons.backToDateTime.addEventListener('click', () => goToStep(1));
        buttons.backToTables.addEventListener('click', () => goToStep(2));
        buttons.confirmar.addEventListener('click', confirmarReserva);
    }

    function goToStep(stepNumber) {
        Object.values(contents).forEach(c => c.classList.add('d-none'));
        contents[`content${stepNumber}`].classList.remove('d-none');
        Object.values(steps).forEach(s => s.classList.remove('active', 'completed'));
        for (let i = 1; i <= 3; i++) {
            if (i < stepNumber) steps[`step${i}`].classList.add('completed');
            else if (i === stepNumber) steps[`step${i}`].classList.add('active');
        }
    }

    function validarPaso1() {
        reserva.fecha = inputs.fecha.value;
        reserva.personas = inputs.personas.value;
        buttons.nextToTables.disabled = !(reserva.fecha && reserva.personas && reserva.hora);
    }

    function validarPaso2() {
        buttons.nextToForm.disabled = !reserva.mesa;
    }

    async function cargarMesasDisponibles() {
        window.apartalo.showLoading(true);
        const url = `/mesas/disponibles?fecha=${reserva.fecha}&hora=${reserva.hora}&capacidad=${reserva.personas}`;
        try {
            const mesas = await window.apartalo.makeRequest(url);
            renderizarMesas(mesas);
        } catch (error) {
            window.apartalo.showAlert(error.message || 'No se pudieron cargar las mesas.', 'danger');
            containers.mesas.innerHTML = `<div class="col-12"><p class="text-center text-danger">${error.message}</p></div>`;
        } finally {
            window.apartalo.showLoading(false);
        }
    }

    function renderizarMesas(mesas) {
        if (!Array.isArray(mesas)) {
            console.error("Error: la respuesta del servidor no es una lista de mesas.", mesas);
            containers.mesas.innerHTML = `<div class="col-12"><p class="text-center text-danger">Hubo un problema al procesar la respuesta del servidor.</p></div>`;
            return;
        }
        if (mesas.length === 0) {
            containers.mesas.innerHTML = `<div class="col-12"><p class="text-center text-muted">No hay mesas disponibles que cumplan con tus criterios.</p></div>`;
            return;
        }
        containers.mesas.innerHTML = mesas.map(mesa => `
            <div class="col-md-6 col-lg-4">
                <div class="mesa-card" data-mesa='${JSON.stringify(mesa)}'>
                    <div class="mesa-icon"><i class="fas fa-chair"></i></div>
                    <h5>Mesa ${mesa.numero}</h5>
                    <p class="mb-1 text-muted"><i class="fas fa-users"></i> ${mesa.capacidad} personas</p>
                    <p class="mb-0 text-muted"><i class="fas fa-map-marker-alt"></i> ${mesa.ubicacion}</p>
                </div>
            </div>`).join('');
    }

    function actualizarResumen() {
        const fechaObj = new Date(reserva.fecha + 'T00:00:00');
        document.getElementById('summaryFecha').textContent = fechaObj.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        document.getElementById('summaryHora').textContent = reserva.hora;
        document.getElementById('summaryMesa').textContent = `Mesa ${reserva.mesa.numero} (${reserva.mesa.ubicacion})`;
        document.getElementById('summaryPersonas').textContent = `${reserva.personas} personas`;
    }

    async function confirmarReserva() {
        // --- CORRECCIÓN CLAVE AQUÍ ---
        // Nos aseguramos de que los nombres de los campos coincidan con lo que el backend espera.
        const reservaData = {
            mesa_id: reserva.mesa.id,      // Nombre corregido
            fecha: reserva.fecha,         // Nombre corregido
            hora: reserva.hora,           // Nombre corregido
            personas: reserva.personas,   // Nombre corregido
            comentarios: inputs.comentarios.value.trim()
        };

        window.apartalo.showLoading(true);
        try {
            const response = await window.apartalo.makeRequest('/reservas', {
                method: 'POST',
                body: JSON.stringify(reservaData)
            });
            window.apartalo.showAlert(response.message || "Reserva creada con éxito", 'success');
            setTimeout(() => window.location.href = 'historial.html', 2500);
        } catch (error) {
            window.apartalo.showAlert(error.message || 'Ocurrió un error al confirmar la reserva.', 'danger');
        } finally {
            window.apartalo.showLoading(false);
        }
    }

    init();
});