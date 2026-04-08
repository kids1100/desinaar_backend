exports.verifyWebhook = (req, res) => {
    const VERIFY_TOKEN = "mytoken123";

    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
        console.log("✅ Webhook verified");
        res.status(200).send(challenge);
    } else {
        res.sendStatus(403);
    }
};

exports.receiveMessage = (req, res) => {
    console.log("📩 Incoming message:");
    console.log(JSON.stringify(req.body, null, 2));

    res.sendStatus(200);
};