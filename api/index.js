// -------------- DEPENDENCY --------------//
const mysql = require('mysql2/promise');
const express = require('express');
const cors = require('cors');
const path = require('path');
const WebSocket = require('ws');
const port = 2021;
const css = path.join(__dirname, '../assets/css');
const app = express();

// Middlewares
app.use(express.static(path.join(__dirname, '../assets/public')));
app.use(express.static(css));
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // Añadir para parsear JSON
app.use(cors());

const images = path.join(__dirname, '../assets/images');
app.use(express.static(images));
const js = path.join(__dirname, '../assets/js');
app.use(express.static(js));
// ---------------------------------------//

const DBConfig = {
  host: 'sql5.freesqldatabase.com',
  user: 'sql5775584',
  password: 'wfviz8GkTM',
  database: 'sql5775584',
  port: 3306
};

// Crear servidor HTTP y WebSocket
const server = app.listen(port, () => {
  console.log(`Servicio corriendo en el puerto => ${port}`);
});

const wss = new WebSocket.Server({ server });

// Mantener track de todos los clientes conectados
const clients = new Set();

wss.on('connection', (ws) => {
  clients.add(ws);
  
  ws.on('close', () => {
    clients.delete(ws);
  });
});

// Función para broadcastear mensajes a todos los clientes
function broadcastMessage(message) {
  const data = JSON.stringify(message);
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}

async function insert(user, msg, token) {
  const connection = await mysql.createConnection(DBConfig);
  try {
    const [result] = await connection.query(
      'INSERT INTO test (user, msg, token) VALUES (?, ?, ?)',
      [user, msg, token]
    );
    return result;
  } finally {
    await connection.end();
  }
}

async function obtenerTodos() {
  const connection = await mysql.createConnection(DBConfig);
  try {
    const [rows] = await connection.query('SELECT * FROM test');
    return rows;
  } finally {
    await connection.end();
  }
}

// Endpoint para enviar mensajes
app.post('/send', async (req, res) => {
  try {
    const user = req.body.username1 || req.body.user;
    const msg = req.body.msg;
    const token = req.body.token;
    
    console.log('Datos recibidos:', { user, msg, token });
    
    if (!msg || msg.trim() === '') {
      return res.status(400).json({ error: 'El mensaje no puede estar vacío' });
    }
    
    if (!user || !token) {
      return res.status(400).json({ error: 'Faltan credenciales' });
    }
    const result = await insert(user, msg, token);
    console.log('Mensaje insertado:', result);
    const newMessage = { user, msg, token }; 
    broadcastMessage({ type: 'new_message', data: newMessage });
    
    res.status(200).json({ success: true, message: 'Mensaje enviado' });
  } catch (error) {
    console.error('Error al insertar mensaje:', error);
    res.status(500).json({ 
      error: 'Error al insertar en la base de datos',
      details: error.message 
    });
  }
});

app.get('/messages', async (req, res) => {
  try {
    const messages = await obtenerTodos();
    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener mensajes' });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../assets/public/index.html'));
});