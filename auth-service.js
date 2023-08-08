const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    userName: { type: String, unique: true },
    password: String,
    email: String,
    loginHistory: [{ dateTime: Date, userAgent: String }]
});

let User; // to be defined on new connection (see initialize)

module.exports.initialize = function () {
    return new Promise(function (resolve, reject) {
        let db = mongoose.createConnection("mongodb+srv://dbUser:Rioshadow@17@senecaweb.e9covk4.mongodb.net/web322_week8?retryWrites=true&w=majority");

        db.on('error', (err)=>{
            reject(err);
        });

        db.once('open', ()=>{
            User = db.model("users", userSchema);
            resolve();
        });
    });
};

module.exports.registerUser = function(userData) {
    return new Promise((resolve, reject) => {
        if (userData.password !== userData.password2) {
            reject("Passwords do not match");
        } else {
            bcrypt.hash(userData.password, 10)
                .then(hash => {
                    let newUser = new User(userData);
                    newUser.password = hash;
                    newUser.save((err) => {
                        if (err) {
                            if (err.code == 11000) {
                                reject("User Name already taken");
                            } else {
                                reject("There was an error creating the user: " + err);
                            }
                        } else {
                            resolve();
                        }
                    });
                })
                .catch(err => {
                    reject("There was an error encrypting the password");
                });
        }
    });
};

module.exports.checkUser = function(userData) {
    return new Promise((resolve, reject) => {
        User.findOne({userName: userData.userName}).exec()
            .then((user) => {
                if (!user) {
                    reject("Unable to find user: " + userData.userName);
                } else {
                    bcrypt.compare(userData.password, user.password)
                        .then(result => {
                            if (result) {
                                user.loginHistory.push({dateTime: (new Date()).toString(), userAgent: userData.userAgent});
                                User.updateOne(
                                    { userName: user.userName },
                                    { $set: { loginHistory: user.loginHistory } }
                                ).exec()
                                .then(() => {
                                    resolve(user);
                                }).catch((err) => {
                                    reject("There was an error verifying the user: " + err);
                                });
                            } else {
                                reject("Incorrect Password for user: " + userData.userName);
                            }
                        })
                        .catch(err => {
                            reject("There was an error comparing the passwords");
                        });
                }
            }).catch(() => {
                reject("Unable to find user: " + userData.userName);
            });
    });
};

