var mongoose = require("mongoose");
var User = require("./models/user");
var Class = require("./models/class");
var Costonlypool = require("./models/costonlypool");

function seedcDeals(idnumarasi) {
    User.findById(idnumarasi).populate("costonlypool").exec(function (err, foundUser) {
        if (err) {
            console.log(err);
        } else {
            Class.findOne({ idNumber: foundUser.classID }).populate("cpool").exec(function (err, foundClass) {
                if (err) {
                    console.log(err);
                } else {
                    var deals = [];
                    foundClass.cpool.forEach(function (b) {
                        if (b.weeknumber == foundClass.currentWeek) {
                            var newPool = {
                                projectname: b.projectname,
                                initialcost: b.initialcost,
                                maintenancecost: b.maintenancecost,
                                weeklycost: b.weeklycost,
                                lifetime: b.lifetime,
                                salvage: b.salvage,
                                weeknumber: b.weeknumber
                            }
                            deals.push(newPool);
                        }
                    });
                    if(deals.length != 0){
                        Costonlypool.create(deals, function (err, createdPool) {
                            if (err) {
                                console.log(err);
                            } else {
                                createdPool.forEach(function (dealfrompool) {
                                    foundUser.costonlypool.push(dealfrompool);
                                });
                                foundUser.save(function (err, doc) {
                                    if (err) {
                                        console.log(err);
                                    } else {
                                        console.log(foundUser.username + "'a cost-only pool yüklendi");
                                    }
                                });
                            }
                        });
                    }
                    
                }
            });
        }
    });
}

module.exports = seedcDeals;

