const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

const API_SECRET = "CHANGE_THIS_SECRET";

// TEMP license storage
const licenses = {
    "ABC-123-XYZ": {
        userId: null,
        expires: "2026-01-01"
    }
};

app.post("/verify", (req, res) => {
    const { license, userId, placeId, secret } = req.body;

    if (secret !== API_SECRET) {
        return res.json({ valid: false, reason: "Unauthorized" });
    }

    const data = licenses[license];
    if (!data) {
        return res.json({ valid: false, reason: "Invalid license" });
    }

    // Bind license on first use
    if (!data.userId) {
        data.userId = userId;
    }

    if (data.userId !== userId) {
        return res.json({ valid: false, reason: "License already bound" });
    }

    return res.json({ valid: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("License server running on port " + PORT);
});
