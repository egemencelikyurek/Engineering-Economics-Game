var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var flash = require("connect-flash");
var User = require("./models/user");
var Deal = require("./models/deal");
var Pool = require("./models/pool");
var Loan = require("./models/loan");
var AssetPool = require("./models/assetpool");
var Asset = require("./models/asset");
var Class = require("./models/class");
var methodOverride = require("method-override");
var passport = require("passport");
var LocalStrategy = require("passport-local");
var passportLocalMongoose = require("passport-local-mongoose");
var eSession = require("express-session");
var exe = require("./execution");
var generateAssets = require("./generateassets");
var seedAssets = require("./seedAssets");
var randomAsset = require("./randomasset");
var moment = require('moment');
var $ = require("jquery");
var changeint = require("./changeint");
var Costonlypool = require("./models/costonlypool");
var Costonly = require("./models/costonly");
var seedDeals = require("./seedDeals");
var seedcDeals = require("./seedcDeals");
const { compile } = require("ejs");
var cleanpool = require("./cleanpool");



mongoose.connect("mongodb://localhost/project", { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });
app.use(eSession({
    secret: "cok cok gizli",
    resave: false,
    saveUninitialized: false
}));
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride("_method"));
app.use(flash());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(function (req, res, next) {
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    res.locals.warning = req.flash("warning");
    res.locals.moment = moment;
    next();
});
app.use(function (req, res, next) {
    if (!req.user) {
        next();
    }
    else {
        Class.findOne({ idNumber: req.user.classID }, function (err, currentClass) {
            if (err) {
                console.log(err);
            } else {
                res.locals.currentClass = currentClass;
                next();
            }
        });
    }

});
// ====== EXECUTION =======
setInterval(function () {
    Class.find({}).populate("pool").populate("cpool").exec(function (err, foundClasses) {
        if (err) {
            console.log(err);
        } else {
            var index;
            foundClasses.forEach(function (foundClass) {
                for (var i = 0; i < foundClass.weeksOfSemester.length; i++) {
                    if (moment().isBetween(foundClass.weeksOfSemester[i], foundClass.weeksOfSemester[i + 1])) {
                        index = i + 1;
                    }
                }
                if (index > foundClass.currentWeek) {
                    exe(foundClass._id);
                    cleanpool(foundClass._id);
                }
                index = 0;
                if (moment() - foundClass.changeDate >= 10800000) {
                    changeint(foundClass._id);
                }
                if (foundClass.currentWeek == 1 && foundClass.users.length != 0 && foundClass.assetPool.length == 0) {
                    generateAssets(foundClass._id);
                }
                /*
                if (foundClass.currentWeek >= 2 && foundClass.users.length != 0 && foundClass.pool.length == 0  && foundClass.currentWeek <= foundClass.maxWeek){
                    generateDeals(foundClass._id);
                }
                if (foundClass.currentWeek >= foundClass.coStart && foundClass.users.length != 0 && foundClass.cpool.length == 0  && foundClass.currentWeek <= foundClass.maxWeek){
                    generatecDeals(foundClass._id);
                } */
                User.find({ classID: foundClass.idNumber, usertype: "Student" }, function (err, users) {
                    if (err) {
                        console.log(err);
                    } else {
                        users.forEach(function (user) {
                            if (foundClass.currentWeek == 1 && foundClass.users.length != 0 && user.assetPool.length == 0 && foundClass.assetPool.length != 0 && foundClass.currentWeek <= foundClass.maxWeek) {
                                seedAssets(user._id);
                            }
                            if (foundClass.currentWeek >= 2 && foundClass.users.length != 0 && foundClass.pool.length != 0 && user.pool.length == 0 && foundClass.currentWeek <= foundClass.maxWeek) {
                                seedDeals(user._id);
                            }
                            if (foundClass.currentWeek >= foundClass.coStart && foundClass.users.length != 0 && foundClass.cpool.length != 0 && user.costonlypool.length == 0 && foundClass.currentWeek <= foundClass.maxWeek) {
                                seedcDeals(user._id);
                            }
                        });
                    }
                });
                User.find({ classID: foundClass.idNumber, usertype: "Student" }, function (err, users) {
                    if (err) {
                        console.log(err);
                    } else {
                        users.forEach(function (user) {
                            if (foundClass.currentWeek >= 2 && foundClass.assetPool.length != 0 && foundClass.users.length != 0 && user.assets.length < 4) {
                                randomAsset(user._id);
                            }
                        });
                    }
                });
            });
        }
    });
}, 15000);
// ========
// USER ROUTES
// ========
// LANDING PAGE
app.get("/", function (req, res) {
    res.render("landing");
});
// INSTRUCTIONS
app.get("/instructions", function (req, res) {
    res.render("info");
});
// INDEX PAGE
app.get("/main", isLoggedIn, function (req, res) {
    User.findById(req.user.id).populate("pool").populate("assetPool").populate("costonlypool").exec(function (err, user) {
        if (err) {
            console.log(err);
        } else {
            if (req.user.usertype == "Instructor") {
                res.redirect("/main_admin");
            } else if (req.user.usertype == "Student") {
                res.render("user/index", { user: user });
            }
        }
    });
});
// PORTFOLIO PAGE
app.get("/portfolio", isLoggedIn, function (req, res) {
    User.findById(req.user.id).populate("deals").populate("assets").populate("costonly").exec(function (err, user) {
        if (err) {
            console.log(err);
        } else {
            res.render("user/portfolio", { user: user });
        }
    })

});
// LEADERBOARD
app.get("/leaderboard", isLoggedIn, function (req, res) {
    Class.findOne({ idNumber: req.user.classID }, function (err, currentClass) {
        if (err) {
            console.log(err);
        } else {
            User.find({ usertype: "Student", classID: currentClass.idNumber }).exec(function (err, users) {
                if (err) {
                    console.log(err);
                }
                else {
                    users.forEach(function (user) {
                        user.total = user.money + user.accountBalance;
                        user.save();
                    });
                    res.render("user/leaderboard", {
                        users: users.sort(function (a, b) {
                            var x = a.total;
                            var y = b.total;
                            return x < y ? 1 : x > y ? -1 : 0;
                        })
                    });
                }
            });
        }
    });
});
// BANK
app.get("/bank", isLoggedIn, function (req, res) {
    res.render("user/account");
});
// Deposit
app.put("/bank/deposit", isLoggedIn, function (req, res) {
    var amount = parseFloat(req.body.deposit);
    User.findById(req.user.id, function (err, user) {
        if (err) {
            console.log(err);
        } else {
            user.money = user.money - amount;
            user.accountBalance = user.accountBalance + amount;
            user.save();
            req.flash("success", "You have succesfully deposited your money.")
            res.redirect("/bank");
        }

    });
});
// Withdraw
app.put("/bank/withdraw", isLoggedIn, function (req, res) {
    var amount = parseFloat(req.body.withdraw);
    User.findById(req.user.id, function (err, user) {
        if (err) {
            console.log(err);
        } else {
            user.money = user.money + amount;
            user.accountBalance = user.accountBalance - amount;
            user.save();
            req.flash("success", "You have succesfully withdrawn your money.")
            res.redirect("/bank");
        }

    });
});
// Show Loan Page
app.get("/loan", isLoggedIn, function (req, res) {
    res.render("user/loan")
});
// Loan
app.post("/loan", isLoggedIn, function (req, res) {
    Class.findOne({ idNumber: req.user.classID }, function (err, currentClass) {
        if (err) {
            console.log(err);
        } else {
            var intForLoan = currentClass.intForLoan;
            var amount = req.body.loan; var term = req.body.term;
            var totalWeeklyPayment = (amount * intForLoan * Math.pow((1 + intForLoan), term)) / (Math.pow((1 + intForLoan), term) - 1);
            var newLoan = { amount: req.body.loan, term: req.body.term, lifetime: req.body.term, weeklyPayment: totalWeeklyPayment, startedWeek: currentClass.currentWeek };
            User.findById(req.user.id, function (err, user) {
                if (err) {
                    console.log(err);
                } else {
                    Loan.create(newLoan, function (err, createdLoan) {
                        if (err) {
                            console.log(err);
                        } else {
                            user.money += createdLoan.amount;
                            user.loans.push(createdLoan);
                            user.save();
                            req.flash("success", "You have credited. Good luck!")
                            res.redirect("/loan");
                        }
                    });
                }

            });
        }
    });


});
// Your Loans
app.get("/yourloans", isLoggedIn, function (req, res) {
    User.findById(req.user.id).populate("loans").exec(function (err, user) {
        res.render("user/yourloans", { user: user });
    });
});
// Adding Assets
app.post("/add/asset/:id", isLoggedIn, function (req, res) {
    AssetPool.findById(req.params.id, function (err, chosenAsset) {
        if (err) {
            console.log(err);
        } else {
            User.findById(req.user.id).populate("assetPool").exec(function (err, user) {
                if (err) {
                    console.log(err);
                } else {
                    user.assetPool.forEach(function (asset) {
                        if (asset.projectname == chosenAsset.projectname) {
                            asset.situation = "pasif";
                            asset.save();
                        }
                    });
                    chosenAsset.situation = "secildi";
                    chosenAsset.save();
                    var newAsset = { projectname: chosenAsset.projectname, initialcost: chosenAsset.initialcost, lifetime: chosenAsset.lifetime, maintenancecost: chosenAsset.maintenancecost, salvage: chosenAsset.salvage, situation: chosenAsset.situation, weeklygain: chosenAsset.weeklygain};
                    user.money = user.money - chosenAsset.initialcost;

                    Asset.create(newAsset, function (err, created) {
                        if (err) {
                            console.log(err);
                        } else {
                            user.assets.push(created);
                            user.save();
                            req.flash("success", "You have chosen your " + chosenAsset.projectname);
                            res.redirect("/main");
                        }
                    });
                }
            });
        }
    });
});
// ADDING PROJECT TO PORTFOLIO
app.post("/add/project/:id", isLoggedIn, function (req, res) {
    User.findById(req.user.id, function (err, user) {
        if (err) {
            console.log(err);
        } else {
            Pool.findById(req.params.id, function (err, deal) {
                if (err) {
                    console.log(err);
                } else {
                    if (deal.initialcost > user.money) {
                        req.flash("error", "You don't have enough money for this investment");
                        res.redirect("/main");
                    }
                    else {
                        var newDeal = {
                            projectname: deal.projectname,
                            initialcost: deal.initialcost,
                            weeklyincome: deal.weeklyincome,
                            weeklycost: deal.weeklycost,
                            salvage: deal.salvage,
                            lifetime: deal.lifetime,
                        };
                        user.money = user.money - deal.initialcost;
                        var index = user.pool.indexOf(req.params.id);
                        user.pool.splice(index, 1);
                        Deal.create(newDeal, function (err, created) {
                            if (err) {
                                console.log(err);
                            } else {
                                user.deals.push(created);
                                user.save();
                                req.flash("success", "You have added a project to your portfolio");
                                res.redirect("/main");
                            }
                        });
                    }
                }
            });
        }
    });
});
app.post("/add/cproject/:id", isLoggedIn, function (req, res) {
    User.findById(req.user.id).populate("costonlypool").exec(function (err, user) {
        if (err) {
            console.log(err);
        } else {
            Costonlypool.findById(req.params.id, function (err, deal) {
                if (err) {
                    console.log(err);
                } else {
                    if (deal.initialcost > user.money) {
                        req.flash("error", "You don't have enough money for this investment");
                        res.redirect("/main");
                    }
                    else {
                        user.costonlypool.forEach(function (a) {
                            a.situation = "pasif";
                            a.save();
                        });
                        deal.situation = "secildi";
                        deal.save();
                        var newDeal = {
                            projectname: deal.projectname,
                            initialcost: deal.initialcost,
                            weeklycost: deal.weeklycost,
                            maintenancecost: deal.maintenancecost,
                            lifetime: deal.lifetime,
                            salvage: deal.salvage,
                            situation: deal.situation
                        };
                        user.money = user.money - deal.initialcost;
                        Costonly.create(newDeal, function (err, created) {
                            if (err) {
                                console.log(err);
                            } else {
                                user.costonly.push(created);
                                user.save();
                                req.flash("success", "You have added a project to your portfolio");
                                res.redirect("/main");
                            }
                        });
                    }
                }
            });
        }
    });
});
app.get("/balance", isLoggedIn, function (req, res) {
    User.findById(req.user.id).populate("assets").populate("loans").populate("deals").exec(function (err, user) {
        if (err) {
            console.log(err);
        } else {
            res.render("user/balance", { user: user });
        }
    });
});
app.put("/usetoken", isLoggedIn, function (req, res) {
    User.findById(req.user.id, function (err, user) {
        if (err) {
            console.log(err);
        } else {
            Class.findOne({idNumber: user.classID}, function(err, foundClass){
                if (err) {
                    console.log(err);
                } else {
                    if (req.body.choice == 1) {
                        var newLoan = {
                            amount: 20000,
                            term: foundClass.maxWeek-foundClass.currentWeek-1,
                            lifetime: foundClass.maxWeek-foundClass.currentWeek-1,
                            weeklyPayment: 20000/(foundClass.maxWeek-foundClass.currentWeek-1),
                            classID: foundClass.idNumber,
                            startedWeek: foundClass.currentWeek
                        }
                        Loan.create(newLoan, function(err, createdLoan){
                            if (err) {
                                console.log(err);
                            } else {
                                user.token--;
                                user.money += 20000;
                                user.loans.push(createdLoan);
                                user.save();
                            }
                        });
                    } else if (req.body.choice == 2) {
                        user.istokenused = 1;
                        user.token--;
                        user.save();
                    } else if (req.body.choice == 3) {
                        user.money += 5000;
                        user.token--;
                        user.save();
                    }
                    res.redirect("/main");
                }

            })
            
        }
    });
});
// ========
// INSTR ROUTES
// ========
app.get("/permission", function (req, res) {
    res.render("permission");
});
app.get("/register_admin", function (req, res) {
    res.render("instructor/register");
});
app.post("/register_admin", function (req, res) {
    var newUser = { username: req.body.username, usertype: "Instructor", };
    User.register(newUser, req.body.password, function (err, user) {
        if (err) {
            console.log(err);
        } else {
            passport.authenticate("local")(req, res, function () {
                res.redirect("/main");
            });
        }
    });
});
app.get("/yourclasses", isAdmin, function (req, res) {
    Class.find({ creator: req.user.username }).populate("users").exec(function (err, foundClasses) {
        if (err) {
            console.log(err);
        } else {
            res.render("instructor/yourclasses", { foundClasses: foundClasses });
        }
    });
});
app.get("/class/:id", isAdmin, function (req, res) {
    Class.findById(req.params.id).populate("users").populate("pool").populate("cpool").populate("assetPool").exec(function (err, foundClass) {
        if (err) {
            console.log(err);
        } else {
            User.find({ usertype: "Student", classID: foundClass.idNumber }).sort([["money", -1]]).exec(function (err, users) {
                if (err) {
                    console.log(err);
                } else {
                    var sorted = [];
                    users.forEach(function (user) {
                        sorted.push(user);
                        user.total = user.money + user.accountBalance;
                        user.save();
                    });
                    res.render("instructor/class", {
                        foundClass: foundClass, users: users.sort(function (a, b) {
                            var x = a.total;
                            var y = b.total;
                            return x < y ? 1 : x > y ? -1 : 0;
                        }), sorted: sorted.sort(function (a, b) {
                            var x = a.username.toLowerCase();
                            var y = b.username.toLowerCase();
                            return x < y ? -1 : x > y ? 1 : 0;
                        })
                    });
                }
            });

        }

    });
});
app.put("/class/addmoney/:id/", isAdmin, function (req, res) {

    Class.findById(req.params.id).populate("users").exec(function (err, foundClass) {
        if (err) {
            console.log(err);
        } else {
            var addedMoney = Number(req.body.addmoney);
            foundClass.users.forEach(function (user) {
                user.money += addedMoney;
                user.save();
            });
            req.flash("success", "You have added " + addedMoney + " amount of money to all users on this class.");
            res.redirect("/class/" + req.params.id);
        }

    });
});
app.put("/class/subtractmoney/:id/", isAdmin, function (req, res) {
    Class.findById(req.params.id).populate("users").exec(function (err, foundClass) {
        if (err) {
            console.log(err);
        } else {
            var subtractedMoney = req.body.subtractmoney;
            foundClass.users.forEach(function (user) {
                user.money -= subtractedMoney;
                user.save();
            });
            req.flash("success", "You have subtracted" + subtractedMoney + " amount of money from all users on this class.");
            res.redirect("/class/" + req.params.id);
        }
    });
});
app.put("/class/addtoken/:id", isAdmin, function (req, res) {
    User.findById(req.params.id, function (err, foundUser) {
        if (err) {
            console.log(err);
        } else {
            foundUser.token++;
            foundUser.save();
            Class.findOne({ idNumber: foundUser.classID }, function (err, foundClass) {
                if (err) {
                    console.log(err);
                } else {
                    req.flash("success", "You have added a token to " + foundUser.username);
                    res.redirect("/class/" + foundClass._id);
                }
            });
        }
    });
});
app.put("/class/subtracttoken/:id", isAdmin, function (req, res) {
    User.findById(req.params.id, function (err, foundUser) {
        if (err) {
            console.log(err);
        } else {
            foundUser.token--;
            foundUser.save();
            Class.findOne({ idNumber: foundUser.classID }, function (err, foundClass) {
                if (err) {
                    console.log(err);
                } else {
                    req.flash("success", "You have subtracted a token from " + foundUser.username);
                    res.redirect("/class/" + foundClass._id);
                }
            });
        }
    });
});
app.get("/main_admin", isAdmin, function (req, res) {
    res.render("instructor/index");
});
app.post("/createClass", isAdmin, function (req, res) {
    var random = Math.floor(Math.random() * 9000) + 1000;
    var trend = Math.random();
    var createDate = moment();
    var startDate = moment(req.body.date);
    var changeDate = moment(req.body.date);
    var a = req.body.time.split(":");
    startDate.set("hour", a[0]);
    startDate.set("minute", a[1]);
    changeDate.set("hour", a[0]);
    changeDate.set("minute", a[1]);
    var weeks = [];
    var d = startDate.clone();
    weeks.push(d.clone());
    for (var i = 0; i < req.body.maxWeek; i++) {
        weeks.push(d.add(1, "week").clone());
    }
    var newClass = { idNumber: random, name: req.body.name, intForLoan: req.body.intForLoan / 100, maxWeek: req.body.maxWeek, weeksOfSemester: weeks, interestRate: req.body.interest / 100, currentWeek: 0, creator: req.user.username, startDate: startDate, createDate: createDate, changeDate: changeDate, trend: trend, coStart: req.body.coStart, raStart: req.body.raStart };
    Class.create(newClass, function (err, createdClass) {
        if (err) {
            console.log(err);
        } else {
            req.flash("success", "You created a class with id: " + createdClass.idNumber + ". Please check 'Your Classes' tab above to see details");
            res.redirect("/main_admin");
        }
    });
});
app.post("/addgain/:id", function (req, res) {
    Class.findById(req.params.id, function (err, foundClass) {
        if (err) {
            console.log(err);
        } else {
            var newQuestion = {
                belong: foundClass.idNumber,
                projectname: req.body.projectname,
                initialcost: req.body.initialcost,
                weeklyincome: req.body.weeklyincome,
                weeklycost: req.body.weeklycost,
                lifetime: req.body.lifetime,
                salvage: req.body.salvage,
                weeknumber: req.body.weeknum
            }
            Pool.create(newQuestion, function (err, createdPool) {
                if (err) {
                    console.log(err);
                } else {
                    foundClass.pool.push(createdPool);
                    foundClass.save();
                    req.flash("success", "You have added a question to the class.");
                    res.redirect("/class/" + foundClass._id);

                }
            });
        }
    });
});
app.post("/addcostonly/:id", function (req, res) {
    Class.findById(req.params.id, function (err, foundClass) {
        if (err) {
            console.log(err);
        } else {
            var newQuestion = {
                belong: foundClass.idNumber,
                projectname: req.body.projectname2,
                initialcost: req.body.initialcost2,
                maintenancecost: req.body.maintenancecost2,
                weeklycost: req.body.weeklycost2,
                lifetime: req.body.lifetime2,
                salvage: req.body.salvage2,
                weeknumber: req.body.weeknum2
            }
            Costonlypool.create(newQuestion, function (err, createdPool) {
                if (err) {
                    console.log(err);
                } else {
                    foundClass.cpool.push(createdPool);
                    foundClass.save();
                    req.flash("success", "You have added a question to the class.");
                    res.redirect("/class/" + foundClass._id);

                }
            });
        }
    });
});
app.post("/addasset/:id", function (req, res) {
    Class.findById(req.params.id, function (err, foundClass) {
        if (err) {
            console.log(err);
        } else {
            var newAsset = {
                belong: foundClass.idNumber,
                projectname: req.body.projectname3,
                initialcost: req.body.initialcost3,
                maintenancecost: req.body.maintenancecost3,
                weeklygain: req.body.weeklygain3,
                lifetime: req.body.lifetime3,
                salvage: req.body.salvage3
            }
            AssetPool.create(newAsset, function (err, createdasset) {
                if (err) {
                    console.log(err);
                } else {
                    foundClass.assetPool.push(createdasset);
                    foundClass.save();
                    req.flash("success", "You have added an asset to the class.");
                    res.redirect("/class/" + foundClass._id);
                }
            });
        }
    });
});
app.delete("/deleteasset/:idd/:id", function (req, res) {
    Class.findById(req.params.idd).populate("assetPool").exec(function (err, foundClass) {
        if (err) {
            console.log(err);
        } else {
            AssetPool.findByIdAndDelete(req.params.id, function (err, deleted) {
                if (err) {
                    console.log(err);
                } else {
                    for (var i = 0; i < foundClass.assetPool.length; i++) {
                        if (foundClass.assetPool[i]._id.equals(deleted._id)) {
                            var index = i
                            foundClass.assetPool.splice(index, 1);
                            foundClass.save();
                        }
                    }
                    req.flash("success", "You have deleted an assset.");
                    res.redirect("/class/" + foundClass._id);
                }
            });
        }
    });
});
app.delete("/deletegain/:idd/:id", function (req, res) {
    Class.findById(req.params.idd).populate("pool").exec(function (err, foundClass) {
        if (err) {
            console.log(err);
        } else {
            Pool.findByIdAndDelete(req.params.id, function (err, deleted) {
                if (err) {
                    console.log(err);
                } else {
                    for (var i = 0; i < foundClass.pool.length; i++) {
                        if (foundClass.pool[i]._id.equals(deleted._id)) {
                            var index = i
                            foundClass.pool.splice(index, 1);
                            foundClass.save();
                        }
                    }
                    req.flash("success", "You have deleted the question.");
                    res.redirect("/class/" + foundClass._id);
                }
            });
        }
    });
});
app.delete("/deletecostonly/:idd/:id", function (req, res) {
    Class.findById(req.params.idd).populate("cpool").exec(function (err, foundClass) {
        if (err) {
            console.log(err);
        } else {
            Costonlypool.findByIdAndDelete(req.params.id, function (err, deleted) {
                if (err) {
                    console.log(err);
                } else {
                    for (var i = 0; i < foundClass.cpool.length; i++) {
                        if (foundClass.cpool[i]._id.equals(deleted._id)) {
                            var index = i
                            foundClass.cpool.splice(index, 1);
                            foundClass.save();
                        }
                    }
                    req.flash("success", "You have deleted the question.");
                    res.redirect("/class/" + foundClass._id);
                }
            });
        }
    });
});

// ===========
// AUTH ROUTES
// ===========

// Show Signup Form
app.get("/register", function (req, res) {
    res.render("user/register");
});
// Register
app.post("/register", function (req, res) {
    if (req.body.password == req.body.passwordRepeat) {
        Class.findOne({ idNumber: req.body.classID }, function (err, foundClass) {
            if (err) {
                console.log(err);
            } else {
                var newUser = new User({ username: req.body.username, classID: req.body.classID, money: 40000, accountBalance: 0, schoolID: req.body.schoolID, usertype: "Student", token: 0, istokenused: 0 });
                User.register(newUser, req.body.password, function (err, user) {
                    if (err) {
                        console.log(err);
                        res.render("user/register");
                    }
                    else {
                        passport.authenticate("local")(req, res, function () {
                            foundClass.users.push(user);
                            foundClass.save();
                            res.redirect("/main");
                        });
                    }
                });
            }
        });

    } else {
        req.flash("error", "Your passwords don't match. Please try again.");
        res.redirect("/register");
    }
});
// Show Login Page
app.get("/login", function (req, res) {
    res.render("user/login");
});
// Login
app.post("/login", passport.authenticate("local", {
    successRedirect: "/main",
    failureRedirect: "/login",
    failureFlash: true,
}), function (req, res) {
});
// Logout
app.get("/logout", function (req, res) {
    req.logout();
    req.flash("success", "You have successfully logged out")
    res.redirect("/");
});
// MiddleWare
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        next();
    }
    else {
        req.flash("error", "You don't have permission to view this page. Please login.")
        res.redirect("/login");
    }
}
function isAdmin(req, res, next) {
    if (req.isAuthenticated()) {
        if (req.user.usertype == "Instructor") {
            next();
        }
        else {
            req.
                // req.flash("error", "You don't have permission to view this page. Please login as instructor.")
                res.render("/permission");
        }
    }
    else {
        req.flash("error", "Please login to view this page.")
        res.redirect("/login");
    }
}
var port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log("Server Has Started!");
});
