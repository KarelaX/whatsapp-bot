const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

// TOKEN de verificación (debe coincidir con el ingresado en Meta)
const VERIFY_TOKEN = MiSuperToken12345!;

app.use(express.json());

// Endpoint de verificación para WhatsApp API
app.get("/webhook", (req, res) => {
    let mode = req.query["hub.mode"];
    let token = req.query["hub.verify_token"];
    let challenge = req.query["hub.challenge"];

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
        console.log("✅ Webhook verificado con éxito.");
        res.status(200).send(challenge);
    } else {
        console.log("❌ Falló la verificación del Webhook.");
        res.sendStatus(403);
    }
});

// Escuchar mensajes entrantes de WhatsApp
app.post("/webhook", (req, res) => {
    console.log("📩 Mensaje recibido:", JSON.stringify(req.body, null, 2));
    res.sendStatus(200);
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});
