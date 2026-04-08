const axios = require("axios");

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || "mytoken123";
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const API_VERSION = process.env.WHATSAPP_API_VERSION || "v20.0";

exports.verifyWebhook = (req, res) => {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
        console.log("✅ Webhook verified");
        return res.status(200).send(challenge);
    }

    return res.sendStatus(403);
};

exports.receiveMessage = async (req, res) => {
    try {
        console.log("📩 Incoming message:");
        console.log(JSON.stringify(req.body, null, 2));

        const entry = req.body.entry?.[0];
        const change = entry?.changes?.[0];
        const value = change?.value;
        const message = value?.messages?.[0];

        if (!message) {
            return res.sendStatus(200);
        }

        const from = message.from;
        const messageType = message.type;
        const textBody = message?.text?.body?.trim();

        console.log("📱 From:", from);
        console.log("📝 Type:", messageType);
        console.log("💬 Text:", textBody);

        if (!ACCESS_TOKEN || !PHONE_NUMBER_ID) {
            console.log("⚠️ WhatsApp token or phone number id missing in env");
            return res.sendStatus(200);
        }

        let replyText = "Hello 👋 Welcome to Desi Naar! How can I help you today?";

        if (messageType === "text" && textBody) {
            const lowerText = textBody.toLowerCase();

            if (lowerText.includes("hi") || lowerText.includes("hello")) {
                replyText =
                    "Hello 👋 Welcome to Desi Naar!\n\nPlease choose an option:\n1. New Collection\n2. Price Inquiry\n3. Order Support\n4. Size Help";
            } else if (lowerText === "1") {
                replyText =
                    "Please visit our latest collection here:\nhttps://desinaar.com/";
            } else if (lowerText === "2") {
                replyText =
                    "Please send the product name or screenshot. I will help you with the price.";
            } else if (lowerText === "3") {
                replyText =
                    "Please share the product name, size, color, and quantity for order support.";
            } else if (lowerText === "4") {
                replyText =
                    "Please tell me your preferred size or body measurements. I will help you choose the right fit.";
            }
        }

        await axios.post(
            `https://graph.facebook.com/${API_VERSION}/${PHONE_NUMBER_ID}/messages`,
            {
                messaging_product: "whatsapp",
                to: from,
                type: "text",
                text: {
                    body: replyText,
                },
            },
            {
                headers: {
                    Authorization: `Bearer ${ACCESS_TOKEN}`,
                    "Content-Type": "application/json",
                },
            }
        );

        console.log("✅ Reply sent successfully");
        return res.sendStatus(200);
    } catch (error) {
        console.error(
            "❌ Error in receiveMessage:",
            error.response?.data || error.message
        );
        return res.sendStatus(500);
    }
};