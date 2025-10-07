const API_URL = '/api/'; // Proxy Nginx -> VM App

// Cambiar entre secciones
function showSection(id) {
  document.querySelectorAll('main section').forEach(sec => sec.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// Cargar habitaciones
document.getElementById('btn-rooms').onclick = async () => {
  const res = await fetch(API_URL + 'rooms.php?available=true');
  const data = await res.json();
  const list = document.getElementById('rooms-list');
  list.innerHTML = data.map(r => `
    <div class="card">
      <h3>${r.type || 'Habitación'} #${r.room_number}</h3>
      <p><strong>Precio:</strong> $${r.price}</p>
      <p><strong>Vista:</strong> ${r.view_type || 'N/A'}</p>
      <p><strong>Estado:</strong> ${r.status}</p>
    </div>
  `).join('');
};

// Cargar reservas
document.getElementById('btn-reservations').onclick = async () => {
  const res = await fetch(API_URL + 'reservations.php');
  const data = await res.json();
  const list = document.getElementById('reservations-list');
  list.innerHTML = data.map(r => `
    <div class="card">
      <h3>${r.user} - ${r.hotel}</h3>
      <p>Entrada: ${r.check_in_date}</p>
      <p>Salida: ${r.check_out_date}</p>
      <p>Total: $${r.total_amount}</p>
    </div>
  `).join('');
};

// Cargar servicios
document.getElementById('btn-services').onclick = async () => {
  const res = await fetch(API_URL + 'services.php');
  const data = await res.json();
  const list = document.getElementById('services-list');
  list.innerHTML = data.map(s => `
    <div class="card">
      <h3>${s.name}</h3>
      <p>${s.description}</p>
      <p><strong>Precio:</strong> $${s.price}</p>
    </div>
  `).join('');
};

// Cargar reporte de pagos
document.getElementById('btn-report').onclick = async () => {
  const res = await fetch(API_URL + 'payments.php?report=true');
  const data = await res.json();
  document.getElementById('report-output').textContent = JSON.stringify(data, null, 2);
};

// Funcionalidad para reservas
document.getElementById('btn-new-reservation').onclick = async () => {
  const form = document.getElementById('reservation-form');
  form.style.display = form.style.display === 'none' ? 'block' : 'none';
  
  // Cargar hoteles disponibles
  if (form.style.display === 'block') {
    await loadHotelsForReservation();
    setMinDate();
  }
};

document.getElementById('cancel-reservation').onclick = () => {
  document.getElementById('reservation-form').style.display = 'none';
  document.getElementById('new-reservation-form').reset();
  clearMessages();
};

// Cargar hoteles para el select
async function loadHotelsForReservation() {
  try {
    const res = await fetch(API_URL + 'hotels.php');
    const hotels = await res.json();
    const select = document.getElementById('hotel-select');
    
    select.innerHTML = '<option value="">Seleccionar hotel...</option>';
    hotels.forEach(hotel => {
      select.innerHTML += `<option value="${hotel.id}">${hotel.name} - ${hotel.city}</option>`;
    });
  } catch (error) {
    showMessage('Error al cargar hoteles: ' + error.message, 'error');
  }
}

// Establecer fecha mínima como hoy
function setMinDate() {
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('check-in').min = today;
  document.getElementById('check-out').min = today;
}

// Validar fechas
document.getElementById('check-in').onchange = function() {
  const checkIn = new Date(this.value);
  const checkOutField = document.getElementById('check-out');
  
  // Establecer fecha mínima de salida como el día siguiente a la entrada
  const minCheckOut = new Date(checkIn);
  minCheckOut.setDate(minCheckOut.getDate() + 1);
  checkOutField.min = minCheckOut.toISOString().split('T')[0];
  
  // Si la fecha de salida ya está establecida y es anterior, limpiarla
  if (checkOutField.value && new Date(checkOutField.value) <= checkIn) {
    checkOutField.value = '';
  }
};

// Manejar envío del formulario
document.getElementById('new-reservation-form').onsubmit = async (e) => {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  const reservationData = {
    user_id: formData.get('user_id'),
    hotel_id: formData.get('hotel_id'),
    check_in_date: formData.get('check_in_date'),
    check_out_date: formData.get('check_out_date'),
    num_guests: parseInt(formData.get('num_guests')),
    total_amount: parseFloat(formData.get('total_amount'))
  };
  
  // Validaciones adicionales
  if (new Date(reservationData.check_out_date) <= new Date(reservationData.check_in_date)) {
    showMessage('La fecha de salida debe ser posterior a la fecha de entrada', 'error');
    return;
  }
  
  try {
    showMessage('Creando reserva...', 'info');
    
    const res = await fetch(API_URL + 'reservations.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reservationData)
    });
    
    const result = await res.json();
    
    if (res.ok) {
      showMessage('¡Reserva creada exitosamente!', 'success');
      document.getElementById('new-reservation-form').reset();
      document.getElementById('reservation-form').style.display = 'none';
      
      // Recargar las reservas para mostrar la nueva
      document.getElementById('btn-reservations').click();
    } else {
      showMessage('Error al crear la reserva: ' + (result.message || 'Error desconocido'), 'error');
    }
  } catch (error) {
    showMessage('Error de conexión: ' + error.message, 'error');
  }
};

// Función para mostrar mensajes
function showMessage(text, type = 'info') {
  clearMessages();
  
  const message = document.createElement('div');
  message.className = `message ${type}`;
  message.textContent = text;
  
  const reservationsSection = document.getElementById('reservations');
  const formContainer = document.getElementById('reservation-form');
  reservationsSection.insertBefore(message, formContainer);
  
  // Auto-remover después de 5 segundos para mensajes de éxito
  if (type === 'success') {
    setTimeout(() => {
      if (message.parentNode) {
        message.parentNode.removeChild(message);
      }
    }, 5000);
  }
}

// Función para limpiar mensajes
function clearMessages() {
  const messages = document.querySelectorAll('.message');
  messages.forEach(msg => {
    if (msg.parentNode) {
      msg.parentNode.removeChild(msg);
    }
  });
}
