const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

/*
LICENSE FILE FORMAT (licenses.json)

{
  "ABC-123-XYZ": {
    "placeId": 123456789,
    "active": true
  }
}
*/

const LICENSE_FILE = path.join(__dirname, "licenses.json");

// --------------------
// HELPERS
// --------------------
function loadLicenses() {
	if (!fs.existsSync(LICENSE_FILE)) {
		return {};
	}
	return JSON.parse(fs.readFileSync(LICENSE_FILE, "utf8"));
}

function saveLicenses(data) {
	fs.writeFileSync(LICENSE_FILE, JSON.stringify(data, null, 2));
}

// --------------------
// ROOT ROUTE (FIXES Cannot GET /)
// --------------------
app.get("/", (req, res) => {
	res.send("License server is running.");
});

// --------------------
// LICENSE VERIFY ROUTE
// --------------------
app.post("/verify", (req, res) => {
	const { licenseKey, placeId } = req.body;

	if (!licenseKey || !placeId) {
		return res.status(400).json({
			valid: false,
			reason: "Missing licenseKey or placeId"
		});
	}

	const licenses = loadLicenses();
	const entry = licenses[licenseKey];

	// License does not exist
	if (!entry) {
		return res.json({
			valid: false,
			reason: "License not found"
		});
	}

	// Disabled license
	if (entry.active !== true) {
		return res.json({
			valid: false,
			reason: "License inactive"
		});
	}

	// Locked to another game
	if (entry.placeId !== placeId) {
		return res.json({
			valid: false,
			reason: "License not valid for this PlaceId"
		});
	}

	// SUCCESS
	return res.json({
		valid: true
	});
});

// --------------------
// START SERVER
// --------------------
app.listen(PORT, () => {
	console.log(`License server running on port ${PORT}`);
});
