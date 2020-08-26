var AssetPool = require("./models/assetpool");
var User = require("./models/user");
var Class = require("./models/class");
var mongoose = require("mongoose");

function seedAssets(userid){
    User.findById(userid).populate("assetPool").exec(function(err, foundUser){
        if (err) {
            console.log(err);
        } else {
            Class.findOne({idNumber: foundUser.classID}).populate("assetPool").exec(function(err, foundClass){
                if (err) {
                    console.log(err);
                } else {
                    var assetarray = [];
                    foundClass.assetPool.forEach(function(asset){
                        var newAsset = {
                            belong: foundClass.idNumber,
                            projectname: asset.projectname,
                            initialcost: asset.initialcost,
                            lifetime: asset.lifetime, 
                            weeklygain: asset.weeklygain,
                            maintenancecost: asset.maintenancecost,
                            salvage: asset.salvage,
                            situation: asset.situation
                        };
                        assetarray.push(newAsset);
                    });
                    AssetPool.create(assetarray, function(err, assets){
                        if (err) {
                            console.log(err);
                        } else {
                            assets.forEach(function(assetfrompool){
                                foundUser.assetPool.push(assetfrompool);
                            });
                            foundUser.save(function(err, doc){
                                if (err) {
                                    console.log(err);
                                } else {
                                    console.log(foundUser.username + "'a assetpool yüklendi.");
                                }
                            });
                        }
                    });                    
                }
            });
        }        
    });   
}
module.exports = seedAssets;