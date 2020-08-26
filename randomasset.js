var AssetPool = require("./models/assetpool");
var Asset = require("./models/asset");
var User = require("./models/user");
var Class = require("./models/class");
var mongoose = require("mongoose");

function randomAsset(userid){
    var o =[
    {name: "CNC", c:0, i:[]},
    {name:"Conveyor",c:0, i:[]},
    {name: "Sensor",c:0, i:[]},
    {name: "Server",c:0, i:[]}];
    User.findById(userid).populate("assets").populate("assetPool").exec(function(err, user){
        if (err) {
            console.log(err);
        } else {
            user.assetPool.forEach(function(asset){
                o.forEach(function(obje){
                    if(asset.projectname == obje.name){
                        var index = user.assetPool.indexOf(asset);
                        obje.i.push(index);
                    }
                });
            });
            user.assets.forEach(function(asset){
                o.forEach(function(obje){
                    if(asset.projectname == obje.name){
                        obje.c++;
                    }
                });
            });
            var toplam = 0;
            o.forEach(function(obje){
                toplam += obje.c;
            });
            var a = 4- toplam;
            console.log(user.username + " kullanicisi icin a sayisi:" + a);
            o.forEach(function(obje){
                if(obje.c == 0){
                    var randomasset = user.assetPool[obje.i[randomm()]];
                    var newAsset = {projectname: randomasset.projectname, belong: randomasset.belong, lifetime: randomasset.lifetime-1, salvage: randomasset.salvage, weeklygain: randomasset.weeklygain, initialcost: randomasset.initialcost, maintenancecost: randomasset.maintenancecost}
                    Asset.create(newAsset, function(err,createdAsset){
                        if (err) {
                            console.log(err);
                        } else {
                            user.money -= createdAsset.initialcost
                            createdAsset.situation = "secildi";
                            createdAsset.save();
                            user.assets.push(createdAsset);
                            console.log(user.username + " kullanıcısına" + createdAsset.initialcost + "costlu" + createdAsset.projectname + "eklendi"); 
                            if(a > 0 ){
                                a--;
                                console.log(user.username + " icin a sayisi azaltildi yeni a sayisi="+a);  
                            }
                            if(a == 0){
                                user.save(function(err,doc){
                                    if (err) {
                                        console.log(err);
                                    } else {
                                        console.log("kaydettim.");
                                    }
                                });    
                            }
                        }
                    });
                }
            });
        }  
    });        
}
function randomm(){
    return Math.floor(Math.random()*4);
}

module.exports = randomAsset;