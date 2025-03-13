const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

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

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});
