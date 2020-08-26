var User        = require("./models/user");
var Deal        = require("./models/deal");
var mongoose    = require("mongoose");
var Class       = require("./models/class");
var Loan        = require("./models/loan");
var Costonly    = require("./models/costonly");
var Asset       = require("./models/asset");

function exe(idNumber){
    Class.findById(idNumber, function(err, sinif){
        if(err){
            console.log(err);
        }
        else{
            console.log("=== EXECUTION FOR CLASS ID:" + sinif.idNumber + "===");
            sinif.currentWeek ++;
            sinif.save();
            var earning = 0;
            var costs = 0;
            var loancost = 0;
            var assetcost = 0;
            var bankearning = 0;
            var salvage = 0;
            User.find({classID: sinif.idNumber}).populate("deals").populate("costonly").populate("loans").populate("assets").exec(function(err, users){
                if (err) {
                    console.log(err);
                } else {
                    users.forEach(function(user){
                        if(user.deals.length != 0){
                            user.deals.forEach(function(deal){
                                if(deal.lifetime>0){
                                    earning += deal.weeklyincome;
                                    costs += deal.weeklycost; 
                                    deal.lifetime--;
                                    deal.save();
                                    if(deal.lifetime == 0){
                                        salvage += deal.salvage;
                                        Deal.findByIdAndDelete(deal._id, function(err){
                                            if (err) {
                                                console.log(err);
                                            } else {
                                                console.log("Deal silindi");
                                            }
                                        });
                                    }
                                }
                            });
                        }
                        if(user.loans.length != 0){
                            user.loans.forEach(function(loan){
                                if(loan.lifetime > 0){
                                    loancost += loan.weeklyPayment ;
                                    loan.lifetime--;
                                    loan.save();
                                    if(loan.lifetime == 0){
                                        Loan.findByIdAndDelete(loan._id, function(err){
                                            if(err){
                                                console.log(err);
                                            }else{
                                                console.log("Loan silindi.");
                                            }
                                        })
                                    }
                                }
                            }); 
                        }
                        if(user.costonly.length != 0){
                            user.costonly.forEach(function(cdeal){
                                costs += cdeal.weeklycost;
                                if((sinif.currentWeek - cdeal.weeknumber)%2 == 0){
                                     costs += cdeal.maintenancecost;
                                }
                                console.log(cdeal);
                                cdeal.lifetime--;
                                cdeal.save(function(err, doc){
                                    if(err){
                                        console.log(err);
                                    }
                                });
                                if(cdeal.lifetime == 0){
                                    salvage += cdeal.salvage;
                                    Costonly.findByIdAndDelete(cdeal._id, function(err, doc){
                                        if(err){
                                            console.log(err);
                                        }else{
                                            console.log("cost-only silindi.");
                                        }
                                    })
                                }
                            });
                        }
                        if(user.assets.length != 0){
                            user.assets.forEach(function(asset){
                                if(asset.lifetime > 0){
                                    if((sinif.currentWeek - 1)%2 == 0){
                                        assetcost += asset.maintenancecost;
                                   }
                                    earning += asset.weeklygain;
                                    asset.lifetime--;
                                    asset.save();
                                    if(asset.lifetime == 0){
                                        salvage += asset.salvage;
                                        Asset.findByIdAndDelete(asset._id, function(err, doc){
                                            if (err) {
                                                console.log(err);
                                            } else {
                                                console.log("Asset silindi");
                                            }
                                        });
                                        
                                    }
                                }
                            });
                        }
                        if(user.accountBalance > 0){
                            bankearning = user.accountBalance * sinif.interestRate;
                        }
                        user.money = user.money + earning;
                        user.money = user.money + bankearning;
                        user.money = user.money + salvage;
                        if(user.istokenused == 1){
                            assetcost = assetcost*0,5;
                            costs = costs*0,5;
                            user.istokenused = 0;
                        }
                        user.money = user.money - loancost;
                        user.money = user.money - assetcost;
                        user.money = user.money - costs;
                        
                        var obj = {
                            week: sinif.currentWeek - 1,
                            a : earning,
                            b : bankearning,
                            c : salvage,
                            z : loancost,
                            y : assetcost,
                            x : costs
                        }
                        user.reports.push(obj);
                        // costonlynin costu yazılacak.
                        user.save();
                        earning = 0;
                        bankearning = 0;
                        salvage = 0;
                        loancost = 0;
                        assetcost = 0;                      
                        costs = 0;
                    });
                }
            });
        } 
    });
}

module.exports = exe;