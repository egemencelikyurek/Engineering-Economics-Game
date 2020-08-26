var mongoose = require("mongoose");

var loanSchema = new mongoose.Schema({
    amount: Number,
    term: Number,
    lifetime: Number,
    weeklyPayment: Number,
    classID: Number,
    startedWeek: Number
});

module.exports = mongoose.model("Loan", loanSchema);