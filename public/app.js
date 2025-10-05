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
