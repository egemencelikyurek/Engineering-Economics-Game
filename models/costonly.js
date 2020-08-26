var mongoose = require("mongoose");

var costonlySchema = new mongoose.Schema({
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

module.exports = mongoose.model("Costonly", costonlySchema);