var mongoose = require("mongoose");

var classSchema = new mongoose.Schema({
    idNumber: Number,
    name: String,
    creator: String,
    interestRate: Number,
    intForLoan: Number,
    maxWeek: Number,
    createDate: Date,
    startDate: Date,
    currentWeek: Number,
    changeDate: Date,
    trend: Number,
    users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    weeksOfSemester: [Date],
    assetPool: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "AssetPool"
    }],
    pool: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Pool"
    }],

    cpool: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Costonlypool"
    }],
    coStart: Number,
    raStart: Number
});

module.exports = mongoose.model("Class", classSchema);
