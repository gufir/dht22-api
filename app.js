const express = require('express');
const mqtt = require('mqtt');
const WebSocket = require('ws');

const app = express();

const host = '192.168.43.192';
const port = '1883';

const client = mqtt.connect(`mqtt://${host}:${port}`,{
    username:'pi',
    password:'raspberry'
});

app.use(express.json());

// Set up WebSocket server
const wss = new WebSocket.Server({ port: 3001 });

// Subscribe to a topic
client.subscribe('sensorDHT22');
client.on('connect', function () {
  console.log('MQTT client connected');
});

// Handle incoming messages
let sensorData = {};
client.on('message', function (topic, message) {
  if (topic === 'sensorDHT22') {
    temperature = message;
    // console.log(temperature.toString());
    sensorData = JSON.parse(temperature.toString());

    // Send sensor data to WebSocket clients
    wss.clients.forEach(function each(client) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(sensorData));
      }
    });
  }
});

app.get('/sensorDHT22', function (req, res) {
    res.json(sensorData);
  });

app.listen(3000, function () {
  console.log('API server listening on port 3000');
});