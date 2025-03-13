const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const dialogflow = require("@google-cloud/dialogflow");
const { v4: uuid } = require("uuid");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// ✅ VERIFICACIÓN DEL WEBHOOK PARA META
app.get("/webhook", (req, res) => {
    const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;

    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
        console.log("✅ WEBHOOK VERIFICADO");
        res.status(200).send(challenge);
    } else {
        console.log("❌ WEBHOOK NO VERIFICADO: Token incorrecto");
        res.sendStatus(403);
    }
});

// ✅ WEBHOOK PARA RECIBIR MENSAJES DE WHATSAPP
app.post("/webhook", async (req, res) => {
    try {
        if (!req.body.entry) {
            console.log("⚠️ No hay datos en la solicitud");
            return res.sendStatus(400);
        }

        const messageData = req.body.entry[0].changes[0].value;
        if (!messageData.messages) {
            console.log("⚠️ No hay mensajes en la solicitud");
            return res.sendStatus(200);
        }

        const message = messageData.messages[0];
        const senderId = message.from;
        const text = message.text.body;

        console.log("📩 Mensaje recibido:", text);

        // Procesar mensaje con Dialogflow
        const response = await processDialogflow(text, senderId);

        // Enviar respuesta a WhatsApp
        await sendMessageToWhatsApp(senderId, response);

        res.sendStatus(200);
    } catch (error) {
        console.error("❌ Error en el webhook:", error);
        res.sendStatus(500);
    }
});

// ✅ FUNCION PARA PROCESAR MENSAJE EN DIALOGFLOW
async function processDialogflow(text, sessionId) {
    try {
        const sessionClient = new dialogflow.SessionsClient({
            keyFilename: "./credentials.json",
        });

        const sessionPath = sessionClient.projectAgentSessionPath(
            process.env.DIALOGFLOW_PROJECT_ID,
            sessionId
        );

        const request = {
            session: sessionPath,
            queryInput: {
                text: {
                    text: text,
                    languageCode: "es",
                },
            },
        };

        const responses = await sessionClient.detectIntent(request);
        const result = responses[0].queryResult;
        return result.fulfillmentText;
    } catch (error) {
        console.error("❌ Error en Dialogflow:", error);
        return "Lo siento, no puedo responder en este momento.";
    }
}

// ✅ FUNCION PARA ENVIAR MENSAJE A WHATSAPP
async function sendMessageToWhatsApp(recipient, message) {
    try {
        await axios.post(
            `https://graph.facebook.com/v17.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
            {
                messaging_product: "whatsapp",
                to: recipient,
                text: { body: message },
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
                    "Content-Type": "application/json",
                },
            }
        );
        console.log("📤 Mensaje enviado a WhatsApp:", message);
    } catch (error) {
        console.error("❌ Error al enviar mensaje a WhatsApp:", error.response?.data || error);
    }
}

// ✅ ENDPOINT DE PRUEBA
app.get("/", (req, res) => {
    res.send("✅ Chatbot de WhatsApp con Dialogflow está activo.");
});

// ✅ INICIAR SERVIDOR
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});
