// ===== HISTORIAL.JS - LÓGICA DE LA PÁGINA DE HISTORIAL (CORREGIDO) =====

document.addEventListener('DOMContentLoaded', () => {
    // --- INICIALIZACIÓN ---
    verificarAutenticacion();
    cargarDatosUsuario();
    cargarReservasUsuario();
    
    // --- EVENTOS ---
    document.getElementById('listaReservas').addEventListener('click', (e) => {
        if (e.target.closest('.btn-cancelar')) { // Usar closest para mayor robustez
            const reservaId = e.target.closest('.btn-cancelar').dataset.reservaId;
            iniciarCancelacion(reservaId);
        }
    });

    document.getElementById('btnConfirmarCancelacion').addEventListener('click', confirmarCancelacion);
});


function verificarAutenticacion() {
    if (!window.apartalo.isAuthenticated()) {
        window.location.href = 'login.html';
    }
}

function cargarDatosUsuario() {
    const user = window.apartalo.getUser();
    if (user) {
        document.getElementById('userName').textContent = user.nombre;
        document.getElementById('userEmail').textContent = user.email;
    }
}

async function cargarReservasUsuario() {
    const user = window.apartalo.getUser();
    if (!user || !user.id) return;

    const loadingDiv = document.getElementById('loadingReservas');
    const sinReservasDiv = document.getElementById('sinReservas');
    const container = document.getElementById('listaReservas');
    
    loadingDiv.style.display = 'block';
    sinReservasDiv.classList.add('d-none'); 
    container.classList.add('d-none');    

    try {
        const reservas = await window.apartalo.makeRequest(`/reservas/usuario/${user.id}`);
        mostrarReservas(reservas);
    } catch (error) {
        loadingDiv.style.display = 'none';
        sinReservasDiv.classList.remove('d-none'); 
        window.apartalo.showAlert(error.message || 'No se pudieron cargar las reservas.', 'danger');
    }
}

function mostrarReservas(reservas) {
    const loadingDiv = document.getElementById('loadingReservas');
    const sinReservasDiv = document.getElementById('sinReservas');
    const container = document.getElementById('listaReservas');

    loadingDiv.style.display = 'none';
    
    // ===== INICIO DE LA CORRECCIÓN =====
    if (!reservas || reservas.length === 0) {
        sinReservasDiv.classList.remove('d-none'); 
        container.classList.add('d-none');         
        return;
    }

    container.innerHTML = '';

    reservas.forEach(reserva => {
        const fechaObjeto = new Date(reserva.fecha);
        const fechaUtc = new Date(fechaObjeto.getTime() + fechaObjeto.getTimezoneOffset() * 60000);

        const fechaFormateada = fechaUtc.toLocaleDateString('es-ES', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });

        const horaFormateada = reserva.hora.slice(0, 5);
        
        const estadoInfo = {
            confirmada: { class: 'success', text: 'CONFIRMADA' },
            cancelada: { class: 'danger', text: 'CANCELADA' },
            completada: { class: 'info', text: 'COMPLETADA' }
        };
        const estadoActual = reserva.estado.toLowerCase();
        const estado = estadoInfo[estadoActual] || { class: 'secondary', text: reserva.estado.toUpperCase() };
        
        const reservaHTML = `
            <div class="card mb-3 shadow-sm">
                <div class="card-body">
                    <div class="row align-items-center">
                        <div class="col-md-8">
                            <div class="d-flex align-items-center mb-2">
                                <h6 class="mb-0">${fechaFormateada}</h6>
                                <span class="badge bg-${estado.class} ms-3">${estado.text}</span>
                            </div>
                            <div class="row text-muted small">
                                <div class="col-sm-6 col-md-4"><i class="fas fa-clock me-1"></i> ${horaFormateada}</div>
                                <div class="col-sm-6 col-md-4"><i class="fas fa-chair me-1"></i> Mesa ${reserva.numero_mesa}</div>
                                <div class="col-sm-6 col-md-4"><i class="fas fa-users me-1"></i> ${reserva.personas} personas</div>
                            </div>
                        </div>
                        <div class="col-md-4 text-md-end mt-2 mt-md-0">
                            ${estadoActual === 'confirmada' ? `
                                <button class="btn btn-outline-danger btn-sm btn-cancelar" data-reserva-id="${reserva.id}">
                                    <i class="fas fa-times me-1"></i>Cancelar
                                </button>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>`;
        container.innerHTML += reservaHTML;
    });

    container.classList.remove('d-none');     
    sinReservasDiv.classList.add('d-none');   
    // ===== FIN DE LA CORRECIÓN =====
}

function iniciarCancelacion(reservaId) {
    const btnConfirmar = document.getElementById('btnConfirmarCancelacion');
    btnConfirmar.setAttribute('data-reserva-id', reservaId);
    
    const modal = new bootstrap.Modal(document.getElementById('modalCancelar'));
    modal.show();
}

async function confirmarCancelacion() {
    const btnConfirmar = document.getElementById('btnConfirmarCancelacion');
    const reservaId = btnConfirmar.getAttribute('data-reserva-id');

    try {
        const response = await window.apartalo.makeRequest(`/reservas/${reservaId}`, {
            method: 'DELETE' 
        });
        
        window.apartalo.showAlert(response.message, 'success');
        
        const modal = bootstrap.Modal.getInstance(document.getElementById('modalCancelar'));
        modal.hide();
        cargarReservasUsuario();

    } catch (error) {
        window.apartalo.showAlert(error.message, 'danger');
    }
}