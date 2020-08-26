var mongoose = require("mongoose");

var costonlypoolSchema = new mongoose.Schema({
    belong: Number,
    projectname: String,
    initialcost: Number,
    weeklycost: Number,
    maintenancecost: Number,
    lifetime: Number,
    salvage: Number,
    situation: String,
    weeknumber: Number
});

module.exports = mongoose.model("Costonlypool", costonlypoolSchema);