const { addonBuilder } = require("stremio-addon-sdk")

// Docs: https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/api/responses/manifest.md
const manifest = {
	"id": "community.netflixlistings",
	"version": "0.0.1",
	"catalogs": [],
	"resources": [],
	"types": [
		"movie",
		"series",
		"channel",
		"tv"
	],
	"name": "netflix-listings",
	"description": "To provide a feed of the latest netflix shows."
}
const builder = new addonBuilder(manifest)

module.exports = builder.getInterface()