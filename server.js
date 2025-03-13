const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

const VERIFY_TOKEN = "MiSuperToken12345!";

app.use(express.json());

// Endpoint de verificación del webhook
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

// Manejo de eventos de WhatsApp
app.post("/webhook", (req, res) => {
    let body = req.body;

    if (body.object === "whatsapp_business_account") {
        body.entry.forEach(entry => {
            entry.changes.forEach(change => {
                if (change.field === "messages" || change.field === "message_echoes") {
                    console.log("📩 Mensaje recibido:", JSON.stringify(change.value, null, 2));
                }
            });
        });
        res.sendStatus(200);
    } else {
        res.sendStatus(404);
    }
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});
