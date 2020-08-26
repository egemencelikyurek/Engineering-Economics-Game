var User        = require("./models/user");
var mongoose    = require("mongoose");
var Class       = require("./models/class");
var moment      = require('moment');

function changeint(idNumber){
    Class.findById(idNumber, function(err, foundClass) {
        if (err) {
            console.log(err);
        } else {
            var rndm = Math.random();
            var next = Math.random();
            var change = Math.random()*0.5 + 1;
            if(rndm >= foundClass.trend && (foundClass.interestRate - change/100) >= 0){
                foundClass.interestRate -= change/100;
                foundClass.intForLoan -= change/100;
                console.log(change + " kadar azaldi.");
            }else{
                foundClass.interestRate += change/100;
                foundClass.intForLoan += change/100;
                console.log(change + " kadar artti.");
            }
            foundClass.trend = next;
            foundClass.changeDate = moment();
            foundClass.save();
        }
    });
}

module.exports = changeint;