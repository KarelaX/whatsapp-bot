const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;  // ¡IMPORTANTE! Usa process.env.PORT

app.use(express.json());

// Ruta de prueba
app.get("/", (req, res) => {
    res.send("¡Servidor en Railway funcionando correctamente! 🚀");
});

// Endpoint para Webhooks de WhatsApp API
app.post("/webhook", (req, res) => {
    console.log("Mensaje recibido:", JSON.stringify(req.body, null, 2));
    res.sendStatus(200);
});

// Mantener el servidor corriendo
app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});
