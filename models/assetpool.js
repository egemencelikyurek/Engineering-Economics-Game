var mongoose = require("mongoose");

var assetSchema = new mongoose.Schema({
    belong: Number,
    projectname: String,
    initialcost: Number,
    weeklygain: Number,
    maintenancecost: Number,
    lifetime: Number,
    salvage: Number,
    situation: String,
});

module.exports = mongoose.model("AssetPool", assetSchema);