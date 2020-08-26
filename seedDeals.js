var mongoose = require("mongoose");
var User = require("./models/user");
var Class = require("./models/class");
var Pool = require("./models/pool");
const { create } = require("./models/pool");

function seedDeals(idnumarasi) {
    User.findById(idnumarasi).populate("pool").exec(function (err, foundUser) {
        if (err) {
            console.log(err);
        } else {
            Class.findOne({ idNumber: foundUser.classID }).populate("pool").exec(function (err, foundClass) {
                if (err) {
                    console.log(err);
                } else {
                    var deals = [];
                    foundClass.pool.forEach(function (a) {
                        if (a.weeknumber == foundClass.currentWeek) {
                            var newPool = {
                                projectname: a.projectname,
                                initialcost: a.initialcost,
                                weeklyincome: a.weeklyincome,
                                weeklycost: a.weeklycost,
                                lifetime: a.lifetime,
                                salvage: a.salvage,
                                weeknumber: a.weeknumber
                            }
                            deals.push(newPool);
                        }
                    });
                    if(deals.length != 0){
                        Pool.create(deals, function (err, createdPool) {
                            if (err) {
                                console.log(err);
                            } else {
                                createdPool.forEach(function (dealfrompool) {
                                    foundUser.pool.push(dealfrompool);
                                });
                                foundUser.save(function (err, doc) {
                                    if (err) {
                                        console.log(err);
                                    } else {
                                        console.log(foundUser.username + "'a normal pool yüklendi");
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

module.exports = seedDeals;

