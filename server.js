const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const dialogflow = require("@google-cloud/dialogflow");
const { v4: uuid } = require("uuid");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// Webhook de WhatsApp
app.post("/webhook", async (req, res) => {
    try {
        const message = req.body.entry[0].changes[0].value.messages[0];
        const senderId = message.from;
        const text = message.text.body;

        console.log("Mensaje recibido:", text);

        // Procesar mensaje con Dialogflow
        const response = await processDialogflow(text, senderId);

        // Enviar respuesta a WhatsApp
        await sendMessageToWhatsApp(senderId, response);

        res.sendStatus(200);
    } catch (error) {
        console.error("Error en el webhook:", error);
        res.sendStatus(500);
    }
});

// Función para enviar mensaje a Dialogflow
async function processDialogflow(text, sessionId) {
    try {
        const sessionClient = new dialogflow.SessionsClient({
            keyFilename: "./credentials.json", // Asegúrate de tener este archivo en Railway
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
        console.error("Error al conectar con Dialogflow:", error);
        return "Lo siento, no puedo responder en este momento.";
    }
}

// Función para enviar mensaje a WhatsApp
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
        console.log("Mensaje enviado a WhatsApp:", message);
    } catch (error) {
        console.error("Error al enviar mensaje a WhatsApp:", error.response?.data || error);
    }
}

// Endpoint de prueba
app.get("/", (req, res) => {
    res.send("Chatbot de WhatsApp con Dialogflow está activo.");
});

// Servidor corriendo
app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});