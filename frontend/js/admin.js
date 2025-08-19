

document.addEventListener('DOMContentLoaded', () => {
    const user = window.apartalo.getUser();
    
    if (!user || user.rol !== 'admin') {
        document.body.innerHTML = ''; 
        window.apartalo.showAlert('Acceso denegado. Se requiere rol de administrador.', 'danger');
        setTimeout(() => { window.location.href = '/index.html'; }, 2000);
        return; 
    }

    cargarTodasLasReservas();
});

async function cargarTodasLasReservas() {
    const loadingDiv = document.getElementById('loading-admin');
    const tableContainer = document.getElementById('admin-table-container');

    try {
        const reservas = await window.apartalo.makeRequest('/admin/reservas');
        renderizarTablaAdmin(reservas);

        loadingDiv.classList.add('d-none');
        tableContainer.classList.remove('d-none');

    } catch (error) {
        loadingDiv.innerHTML = `<p class="text-danger">Error al cargar las reservas.</p>`;
        window.apartalo.showAlert(error.message, 'danger');
    }
}

function renderizarTablaAdmin(reservas) {
    const tbody = document.getElementById('reservas-admin-tbody');
    tbody.innerHTML = '';

    if (!reservas || reservas.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">No se encontraron reservas.</td></tr>';
        return;
    }

    reservas.forEach(r => {
        const fechaFormateada = new Date(r.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
        const horaFormateada = r.hora.slice(0, 5);
        
        const fila = `
            <tr>
                <td><strong>${r.id}</strong></td>
                <td>${r.nombre_cliente}</td>
                <td>${fechaFormateada}</td>
                <td>${horaFormateada}</td>
                <td>${r.numero_mesa}</td>
                <td>${r.personas}</td>
                <td>
                    <select class="form-select form-select-sm status-select" data-reserva-id="${r.id}">
                        <option value="confirmada" ${r.estado === 'confirmada' ? 'selected' : ''}>Confirmada</option>
                        <option value="completada" ${r.estado === 'completada' ? 'selected' : ''}>Completada</option>
                        <option value="cancelada" ${r.estado === 'cancelada' ? 'selected' : ''}>Cancelada</option>
                    </select>
                </td>
            </tr>
        `;
        tbody.innerHTML += fila;
    });

    document.querySelectorAll('.status-select').forEach(select => {
        select.addEventListener('change', handleStatusChange);
    });
}

async function handleStatusChange(event) {
    const selectElement = event.target;
    const reservaId = selectElement.dataset.reservaId;
    const nuevoEstado = selectElement.value;

    try {
        const response = await window.apartalo.makeRequest(`/admin/reservas/${reservaId}/estado`, {
            method: 'PUT',
            body: JSON.stringify({ estado: nuevoEstado })
        });
        window.apartalo.showAlert(response.message, 'success');
    } catch (error) {
        window.apartalo.showAlert(error.message, 'danger');
        cargarTodasLasReservas(); 
    }
}