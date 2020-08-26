var mongoose = require("mongoose");

var dealSchema = new mongoose.Schema({
    projectname: String,
    initialcost: Number,
    weeklyincome: Number,
    weeklycost: Number,
    lifetime: Number,
    salvage: Number
});

module.exports = mongoose.model("Deal", dealSchema);