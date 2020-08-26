var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var userSchema = new mongoose.Schema({
    username: String,
    password: String,
    classID: Number,
    usertype: String,
    schoolID: Number,
    deals: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Deal"
    }],
    pool: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Pool"
    }],
    loans: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Loan"
    }],
    assets: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Asset"
    }],
    assetPool: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "AssetPool"
    }],
    costonly: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Costonly"
    }],
    costonlypool: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Costonlypool"
    }],
    money: Number,
    accountBalance: Number,
    token: Number,
    total: Number,
    istokenused: Number,
    reports: [{
        week: Number,
        a: Number,
        b: Number,
        c: Number,
        z: Number,
        y: Number,
        x: Number
    }]
});

userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("User", userSchema);