var Pool = require("./models/pool");
var Constonlypool = require("./models/costonlypool");
var User = require("./models/user");
var Class = require("./models/class");

function cleanpool(idnumarasi){
    Class.findById(idnumarasi, function(err, sinif){
        if (err) {
            console.log(err);
        } else {
            User.find({classID: sinif.idNumber}, function(err, users){
                if (err) {
                    console.log(err);
                } else {
                    users.forEach(function(foundUser){
                        foundUser.pool.forEach(function(deal){
                            Pool.findByIdAndDelete(deal._id, function(err, silinecek){
                                if (err) {
                                    console.log(err);
                                } else {
                                    console.log("1 pool silindi.\n");
                                }
                            });
                        });
                        foundUser.costonlypool.forEach(function(cdeal){
                            Constonlypool.findByIdAndDelete(cdeal._id, function(err, silinecek){
                                if (err) {
                                    console.log(err);
                                } else {
                                    console.log("1 cost-only pool silindi.\n");
                                }
                            });
                        });
                        foundUser.pool.splice(0,foundUser.pool.length);
                        foundUser.costonlypool.splice(0,foundUser.costonlypool.length);
                        foundUser.save();
                        
                    });
                }
            });
        }
    });
}
module.exports = cleanpool;

