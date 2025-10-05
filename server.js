require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint de salud
app.get('/health', (req, res) => {
  res.json({ ok: true, service: 'Hospitech Frontend', time: new Date().toISOString() });
});

// Servir index.html por defecto
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, '127.0.0.1', () => {
  console.log(`Frontend Hospitech escuchando en http://127.0.0.1:${PORT}`);
});
