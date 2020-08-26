var mongoose = require("mongoose");

var poolSchema = mongoose.Schema({
    belong: Number,
    projectname: String,
    initialcost: Number,
    weeklyincome: Number,
    weeklycost: Number,
    lifetime: Number,
    salvage: Number,
    weeknumber: Number
});

module.exports = mongoose.model("Pool", poolSchema);