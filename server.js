const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

// TOKEN de verificación (debe coincidir con el que ingresaste en Meta)
const VERIFY_TOKEN = "MiSuperToken12345!";

app.use(express.json());

// Ruta de verificación de Webhooks para Meta
app.get("/webhook", (req, res) => {
    let mode = req.query["hub.mode"];
    let token = req.query["hub.verify_token"];
    let challenge = req.query["hub.challenge"];

    if (mode && token === VERIFY_TOKEN) {
        console.log("✅ Webhook verificado con éxito.");
        res.status(200).send(challenge);
    } else {
        console.log("❌ Falló la verificación del Webhook.");
        res.sendStatus(403);
    }
});

// Ruta para recibir eventos de WhatsApp
app.post("/webhook", (req, res) => {
    let body = req.body;

    console.log("📩 Evento recibido:", JSON.stringify(body, null, 2));

    // Responder 200 para confirmar que el webhook está activo
    res.sendStatus(200);
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});
