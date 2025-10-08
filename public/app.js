const API_URL = '/api/'; // Proxy Nginx -> VM App

let currentEditingUser = null;
let currentEditingHotel = null;

// Cambiar entre secciones
function showSection(id) {
  document.querySelectorAll('main section').forEach(sec => sec.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  
  // Limpiar formularios y resetear estados
  hideAllForms();
  clearMessages();
}

function hideAllForms() {
  const forms = ['user-form', 'hotel-form', 'reservation-form', 'payment-form'];
  forms.forEach(formId => {
    const form = document.getElementById(formId);
    if (form) {
      form.style.display = 'none';
      const actualForm = form.querySelector('form');
      if (actualForm) actualForm.reset();
    }
  });
}

// ===== GESTIÓN DE USUARIOS =====
document.getElementById('btn-users').onclick = loadUsers;
document.getElementById('btn-new-user').onclick = () => {
  currentEditingUser = null;
  document.getElementById('user-form-title').textContent = 'Crear nuevo usuario';
  toggleForm('user-form');
};
document.getElementById('cancel-user').onclick = () => {
  currentEditingUser = null;
  hideForm('user-form');
};

async function loadUsers() {
  try {
    const res = await fetch(API_URL + 'users.php');
    const users = await res.json();
    const list = document.getElementById('users-list');
    
    list.innerHTML = users.map(user => `
      <div class="card">
        <h3>${user.full_name}</h3>
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>Teléfono:</strong> ${user.phone || 'N/A'}</p>
        <p><strong>Rol:</strong> ${user.role}</p>
        <p><strong>Estado:</strong> ${user.is_active ? 'Activo' : 'Inactivo'}</p>
        <div class="card-actions">
          <button class="btn-small btn-edit" onclick="editUser('${user.id}')">Editar</button>
          <button class="btn-small btn-delete" onclick="deleteUser('${user.id}')">Eliminar</button>
        </div>
      </div>
    `).join('');
  } catch (error) {
    showMessage('Error al cargar usuarios: ' + error.message, 'error');
  }
}

async function editUser(userId) {
  try {
    const res = await fetch(API_URL + `users.php?id=${userId}`);
    const user = await res.json();
    
    currentEditingUser = userId;
    document.getElementById('user-form-title').textContent = 'Editar usuario';
    
    // Llenar formulario
    document.getElementById('user-email').value = user.email;
    document.getElementById('user-fullname').value = user.full_name;
    document.getElementById('user-phone').value = user.phone || '';
    document.getElementById('user-address').value = user.address || '';
    document.getElementById('user-birth').value = user.date_of_birth || '';
    document.getElementById('user-role').value = user.role;
    document.getElementById('user-active').value = user.is_active;
    
    showForm('user-form');
  } catch (error) {
    showMessage('Error al cargar usuario: ' + error.message, 'error');
  }
}

async function deleteUser(userId) {
  if (!confirm('¿Estás seguro de eliminar este usuario?')) return;
  
  try {
    const res = await fetch(API_URL + `users.php?id=${userId}`, {
      method: 'DELETE'
    });
    
    if (res.ok) {
      showMessage('Usuario eliminado exitosamente', 'success');
      loadUsers();
    } else {
      const error = await res.json();
      showMessage('Error al eliminar usuario: ' + error.message, 'error');
    }
  } catch (error) {
    showMessage('Error de conexión: ' + error.message, 'error');
  }
}

document.getElementById('new-user-form').onsubmit = async (e) => {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  const userData = {
    email: formData.get('email'),
    password_hash: formData.get('password_hash'),
    full_name: formData.get('full_name'),
    phone: formData.get('phone'),
    address: formData.get('address'),
    date_of_birth: formData.get('date_of_birth'),
    role: formData.get('role'),
    is_active: parseInt(formData.get('is_active'))
  };
  
  try {
    const url = currentEditingUser ? 
      API_URL + `users.php?id=${currentEditingUser}` : 
      API_URL + 'users.php';
    
    const method = currentEditingUser ? 'PUT' : 'POST';
    
    const res = await fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    
    if (res.ok) {
      showMessage(currentEditingUser ? 'Usuario actualizado exitosamente' : 'Usuario creado exitosamente', 'success');
      hideForm('user-form');
      loadUsers();
      currentEditingUser = null;
    } else {
      const error = await res.json();
      showMessage('Error: ' + error.message, 'error');
    }
  } catch (error) {
    showMessage('Error de conexión: ' + error.message, 'error');
  }
};

// ===== GESTIÓN DE HOTELES =====
document.getElementById('btn-hotels').onclick = loadHotels;
document.getElementById('btn-new-hotel').onclick = () => {
  currentEditingHotel = null;
  document.getElementById('hotel-form-title').textContent = 'Crear nuevo hotel';
  toggleForm('hotel-form');
};
document.getElementById('cancel-hotel').onclick = () => {
  currentEditingHotel = null;
  hideForm('hotel-form');
};

async function loadHotels() {
  try {
    const res = await fetch(API_URL + 'hotels.php');
    const hotels = await res.json();
    const list = document.getElementById('hotels-list');
    
    list.innerHTML = hotels.map(hotel => `
      <div class="card">
        <h3>${hotel.name}</h3>
        <p><strong>Ciudad:</strong> ${hotel.city}, ${hotel.country}</p>
        <p><strong>Dirección:</strong> ${hotel.address}</p>
        <p><strong>Teléfono:</strong> ${hotel.phone || 'N/A'}</p>
        <p><strong>Email:</strong> ${hotel.email || 'N/A'}</p>
        <p><strong>Estrellas:</strong> ${'⭐'.repeat(hotel.star_rating || 0)}</p>
        <p><strong>Descripción:</strong> ${hotel.description || 'N/A'}</p>
        <div class="card-actions">
          <button class="btn-small btn-edit" onclick="editHotel('${hotel.id}')">Editar</button>
          <button class="btn-small btn-delete" onclick="deleteHotel('${hotel.id}')">Eliminar</button>
        </div>
      </div>
    `).join('');
  } catch (error) {
    showMessage('Error al cargar hoteles: ' + error.message, 'error');
  }
}

async function editHotel(hotelId) {
  try {
    const res = await fetch(API_URL + `hotels.php?id=${hotelId}`);
    const hotel = await res.json();
    
    currentEditingHotel = hotelId;
    document.getElementById('hotel-form-title').textContent = 'Editar hotel';
    
    // Llenar formulario
    document.getElementById('hotel-name').value = hotel.name;
    document.getElementById('hotel-address').value = hotel.address;
    document.getElementById('hotel-city').value = hotel.city;
    document.getElementById('hotel-country').value = hotel.country;
    document.getElementById('hotel-phone').value = hotel.phone || '';
    document.getElementById('hotel-email').value = hotel.email || '';
    document.getElementById('hotel-description').value = hotel.description || '';
    document.getElementById('hotel-rating').value = hotel.star_rating || 3;
    
    showForm('hotel-form');
  } catch (error) {
    showMessage('Error al cargar hotel: ' + error.message, 'error');
  }
}

async function deleteHotel(hotelId) {
  if (!confirm('¿Estás seguro de eliminar este hotel?')) return;
  
  try {
    const res = await fetch(API_URL + `hotels.php?id=${hotelId}`, {
      method: 'DELETE'
    });
    
    if (res.ok) {
      showMessage('Hotel eliminado exitosamente', 'success');
      loadHotels();
    } else {
      const error = await res.json();
      showMessage('Error al eliminar hotel: ' + error.message, 'error');
    }
  } catch (error) {
    showMessage('Error de conexión: ' + error.message, 'error');
  }
}

document.getElementById('new-hotel-form').onsubmit = async (e) => {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  const hotelData = {
    name: formData.get('name'),
    address: formData.get('address'),
    city: formData.get('city'),
    country: formData.get('country'),
    phone: formData.get('phone'),
    email: formData.get('email'),
    description: formData.get('description'),
    star_rating: parseInt(formData.get('star_rating'))
  };
  
  try {
    const url = currentEditingHotel ? 
      API_URL + `hotels.php?id=${currentEditingHotel}` : 
      API_URL + 'hotels.php';
    
    const method = currentEditingHotel ? 'PUT' : 'POST';
    
    const res = await fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(hotelData)
    });
    
    if (res.ok) {
      showMessage(currentEditingHotel ? 'Hotel actualizado exitosamente' : 'Hotel creado exitosamente', 'success');
      hideForm('hotel-form');
      loadHotels();
      currentEditingHotel = null;
    } else {
      const error = await res.json();
      showMessage('Error: ' + error.message, 'error');
    }
  } catch (error) {
    showMessage('Error de conexión: ' + error.message, 'error');
  }
};

// ===== GESTIÓN DE HABITACIONES =====
document.getElementById('btn-rooms').onclick = () => loadRooms();
document.getElementById('btn-available-rooms').onclick = () => loadRooms(true);

async function loadRooms(availableOnly = false) {
  try {
    const url = availableOnly ? 
      API_URL + 'rooms.php?available=true' : 
      API_URL + 'rooms.php';
    
    const res = await fetch(url);
    const rooms = await res.json();
    const list = document.getElementById('rooms-list');
    
    list.innerHTML = rooms.map(room => `
      <div class="card">
        <h3>${room.type || 'Habitación'} #${room.room_number}</h3>
        <p><strong>Hotel:</strong> ${room.hotel_name || 'N/A'}</p>
        <p><strong>Precio:</strong> $${room.price}</p>
        <p><strong>Vista:</strong> ${room.view_type || 'N/A'}</p>
        <p><strong>Estado:</strong> <span style="color: ${room.status === 'available' ? 'green' : 'red'}">${room.status}</span></p>
        <div class="card-actions">
          <button class="btn-small btn-toggle" onclick="toggleRoomStatus('${room.id}', '${room.status}')">
            ${room.status === 'available' ? 'Marcar Ocupada' : 'Marcar Disponible'}
          </button>
        </div>
      </div>
    `).join('');
  } catch (error) {
    showMessage('Error al cargar habitaciones: ' + error.message, 'error');
  }
}

async function toggleRoomStatus(roomId, currentStatus) {
  const newStatus = currentStatus === 'available' ? 'occupied' : 'available';
  
  try {
    const res = await fetch(API_URL + `rooms.php?id=${roomId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
    
    if (res.ok) {
      showMessage('Estado de habitación actualizado', 'success');
      loadRooms();
    } else {
      const error = await res.json();
      showMessage('Error al actualizar habitación: ' + error.message, 'error');
    }
  } catch (error) {
    showMessage('Error de conexión: ' + error.message, 'error');
  }
}

// ===== GESTIÓN DE RESERVAS =====
document.getElementById('btn-reservations').onclick = loadReservations;
document.getElementById('btn-new-reservation').onclick = () => {
  toggleForm('reservation-form');
  if (document.getElementById('reservation-form').style.display !== 'none') {
    loadHotelsForReservation();
    setMinDate();
  }
};
document.getElementById('cancel-reservation').onclick = () => hideForm('reservation-form');

async function loadReservations() {
  try {
    const res = await fetch(API_URL + 'reservations.php');
    const reservations = await res.json();
    const list = document.getElementById('reservations-list');
    
    list.innerHTML = reservations.map(reservation => `
      <div class="card">
        <h3>${reservation.user || reservation.user_id} - ${reservation.hotel || reservation.hotel_id}</h3>
        <p><strong>ID:</strong> ${reservation.id}</p>
        <p><strong>Entrada:</strong> ${reservation.check_in_date}</p>
        <p><strong>Salida:</strong> ${reservation.check_out_date}</p>
        <p><strong>Huéspedes:</strong> ${reservation.num_guests}</p>
        <p><strong>Total:</strong> $${reservation.total_amount}</p>
        <p><strong>Estado:</strong> ${reservation.status || 'Confirmada'}</p>
      </div>
    `).join('');
  } catch (error) {
    showMessage('Error al cargar reservas: ' + error.message, 'error');
  }
}

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

function setMinDate() {
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('check-in').min = today;
  document.getElementById('check-out').min = today;
}

document.getElementById('check-in').onchange = function() {
  const checkIn = new Date(this.value);
  const checkOutField = document.getElementById('check-out');
  
  const minCheckOut = new Date(checkIn);
  minCheckOut.setDate(minCheckOut.getDate() + 1);
  checkOutField.min = minCheckOut.toISOString().split('T')[0];
  
  if (checkOutField.value && new Date(checkOutField.value) <= checkIn) {
    checkOutField.value = '';
  }
};

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
  
  if (new Date(reservationData.check_out_date) <= new Date(reservationData.check_in_date)) {
    showMessage('La fecha de salida debe ser posterior a la fecha de entrada', 'error');
    return;
  }
  
  try {
    showMessage('Creando reserva...', 'info');
    
    const res = await fetch(API_URL + 'reservations.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reservationData)
    });
    
    if (res.ok) {
      showMessage('¡Reserva creada exitosamente!', 'success');
      hideForm('reservation-form');
      loadReservations();
    } else {
      const result = await res.json();
      showMessage('Error al crear la reserva: ' + (result.message || 'Error desconocido'), 'error');
    }
  } catch (error) {
    showMessage('Error de conexión: ' + error.message, 'error');
  }
};

// ===== GESTIÓN DE PAGOS =====
document.getElementById('btn-new-payment').onclick = () => toggleForm('payment-form');
document.getElementById('cancel-payment').onclick = () => hideForm('payment-form');

document.getElementById('new-payment-form').onsubmit = async (e) => {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  const paymentData = {
    reservation_id: formData.get('reservation_id'),
    user_id: formData.get('user_id'),
    payment_method: formData.get('payment_method'),
    amount: parseFloat(formData.get('amount')),
    status: formData.get('status'),
    transaction_reference: formData.get('transaction_reference'),
    external_gateway: formData.get('external_gateway')
  };
  
  try {
    showMessage('Registrando pago...', 'info');
    
    const res = await fetch(API_URL + 'payments.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paymentData)
    });
    
    if (res.ok) {
      showMessage('¡Pago registrado exitosamente!', 'success');
      hideForm('payment-form');
    } else {
      const result = await res.json();
      showMessage('Error al registrar el pago: ' + (result.message || 'Error desconocido'), 'error');
    }
  } catch (error) {
    showMessage('Error de conexión: ' + error.message, 'error');
  }
};

// ===== GESTIÓN DE SERVICIOS =====
document.getElementById('btn-services').onclick = loadServices;

async function loadServices() {
  try {
    const res = await fetch(API_URL + 'services.php');
    const services = await res.json();
    const list = document.getElementById('services-list');
    
    list.innerHTML = services.map(service => `
      <div class="card">
        <h3>${service.name}</h3>
        <p>${service.description}</p>
        <p><strong>Precio:</strong> $${service.price}</p>
        <p><strong>Promocional:</strong> ${service.is_promotional ? 'Sí' : 'No'}</p>
        <div class="card-actions">
          <button class="btn-small btn-toggle" onclick="toggleServicePromotion('${service.id}', ${service.is_promotional})">
            ${service.is_promotional ? 'Quitar Promoción' : 'Hacer Promocional'}
          </button>
        </div>
      </div>
    `).join('');
  } catch (error) {
    showMessage('Error al cargar servicios: ' + error.message, 'error');
  }
}

async function toggleServicePromotion(serviceId, isCurrentlyPromotional) {
  const newPromotionalStatus = isCurrentlyPromotional ? 0 : 1;
  
  try {
    const res = await fetch(API_URL + `services.php?id=${serviceId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_promotional: newPromotionalStatus })
    });
    
    if (res.ok) {
      showMessage('Estado promocional actualizado', 'success');
      loadServices();
    } else {
      const error = await res.json();
      showMessage('Error al actualizar servicio: ' + error.message, 'error');
    }
  } catch (error) {
    showMessage('Error de conexión: ' + error.message, 'error');
  }
}

// ===== REPORTES =====
document.getElementById('btn-payment-report').onclick = loadPaymentReport;

async function loadPaymentReport() {
  try {
    const res = await fetch(API_URL + 'payments.php?report=true');
    const reportData = await res.json();
    
    displayPaymentReport(reportData);
  } catch (error) {
    showMessage('Error al cargar reporte: ' + error.message, 'error');
  }
}

function displayPaymentReport(data) {
  const summaryContainer = document.getElementById('report-summary');
  const detailsContainer = document.getElementById('report-details');
  
  // Calcular totales
  let totalGeneral = 0;
  let totalHoteles = 0;
  
  if (Array.isArray(data)) {
    totalHoteles = data.length;
    totalGeneral = data.reduce((sum, hotel) => sum + parseFloat(hotel.total_payments || 0), 0);
  }
  
  // Mostrar resumen
  summaryContainer.innerHTML = `
    <h3>Resumen de Pagos</h3>
    <div class="summary-grid">
      <div class="summary-card">
        <h4>Total General</h4>
        <div class="amount">$${totalGeneral.toFixed(2)}</div>
      </div>
      <div class="summary-card">
        <h4>Hoteles con Ingresos</h4>
        <div class="amount">${totalHoteles}</div>
      </div>
      <div class="summary-card">
        <h4>Promedio por Hotel</h4>
        <div class="amount">$${totalHoteles > 0 ? (totalGeneral / totalHoteles).toFixed(2) : '0.00'}</div>
      </div>
    </div>
  `;
  
  // Mostrar detalles por hotel
  if (Array.isArray(data) && data.length > 0) {
    detailsContainer.innerHTML = `
      <h3>Detalles por Hotel</h3>
      ${data.map(hotel => `
        <div class="hotel-report">
          <h4>${hotel.hotel_name || 'Hotel sin nombre'}</h4>
          <p><strong>Total de pagos:</strong> $${parseFloat(hotel.total_payments || 0).toFixed(2)}</p>
          <p><strong>Número de transacciones:</strong> ${hotel.transaction_count || 0}</p>
        </div>
      `).join('')}
    `;
  } else {
    detailsContainer.innerHTML = `
      <h3>Detalles por Hotel</h3>
      <p>No hay datos de pagos disponibles.</p>
    `;
  }
}

// ===== FUNCIONES AUXILIARES =====
function toggleForm(formId) {
  const form = document.getElementById(formId);
  form.style.display = form.style.display === 'none' ? 'block' : 'none';
}

function showForm(formId) {
  document.getElementById(formId).style.display = 'block';
}

function hideForm(formId) {
  document.getElementById(formId).style.display = 'none';
  const form = document.getElementById(formId).querySelector('form');
  if (form) form.reset();
}

function showMessage(text, type = 'info') {
  clearMessages();
  
  const message = document.createElement('div');
  message.className = `message ${type}`;
  message.textContent = text;
  
  const activeSection = document.querySelector('section.active');
  if (activeSection) {
    activeSection.insertBefore(message, activeSection.children[1]);
  }
  
  if (type === 'success') {
    setTimeout(() => {
      if (message.parentNode) {
        message.parentNode.removeChild(message);
      }
    }, 5000);
  }
}

function clearMessages() {
  const messages = document.querySelectorAll('.message');
  messages.forEach(msg => {
    if (msg.parentNode) {
      msg.parentNode.removeChild(msg);
    }
  });
}

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', () => {
  // Cargar datos iniciales de la sección activa
  loadRooms();
});