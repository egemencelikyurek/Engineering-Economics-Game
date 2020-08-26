var AssetPool = require("./models/assetpool");
var User = require("./models/user");
var Class = require("./models/class");
var mongoose = require("mongoose");


function generateassets(idnumarasi) {
    console.log("======Fonksiyon cagrildi ama henuz bisey yapilmadi=========")
    Class.findById(idnumarasi).populate("users").populate("assetPool").exec(function (err, foundClass) {
        if (err) {
            console.log(err);
        } else {
            var assetarray = [];
            var types = ["CNC", "Conveyor", "Sensor", "Server"];
            types.forEach(function (tippp) {
                for (var i = 0; i < 4; i++) {
                    var initial = Math.floor(Math.random() * 900 + 4700);
                    var expenses = Math.floor(Math.random() * 300 + 200);
                    var salvage = Math.floor(initial * (Math.random() / 5));
                    var lifetime = foundClass.maxWeek - foundClass.currentWeek
                    var newAsset = { initialCost: initial, expenses: expenses, salvage: salvage, name: tippp, lifetime: lifetime, belong: foundClass.idNumber };
                    assetarray.push(newAsset);
                }
            });
            AssetPool.create(assetarray, function (err, createdAssets) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("icerdeyim babam.");
                    createdAssets.forEach(function (asset) {
                        foundClass.assetPool.push(asset);
                    });
                    foundClass.save();
                    console.log("SINIF ASSETPOOLUNA ASSET EKLENDI.");
                }
            });
        }
    });
}
module.exports = generateassets;