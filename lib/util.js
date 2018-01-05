const Homey = require('homey');
const rp = require('request-promise-native');
const nodemailer = require('nodemailer');

exports.getHomeyIp = function () {
    return new Promise(function (resolve, reject) {
        Homey.ManagerCloud.getLocalAddress()
            .then(localAddress => {
                return resolve(localAddress)
            })
            .catch(error => {
                throw new Error(error);
            })
    })
}

exports.createSnapshot = function (address, port, username, password) {
    return new Promise(function (resolve, reject) {
        var options = {
            url: "http://"+ address +":"+ port +"/shot.jpg",
            encoding: 'binary',
            auth: {
                user: username,
                pass: password
            },
            resolveWithFullResponse: true,
            timeout: 10000
        };

        rp(options)
            .then(function (response) {
                if (response.statusCode == 200) {
                    var buf = new Buffer(response.body, 'binary');
                    return resolve(buf);
                } else {
                    return reject(response.statusCode);
                }
            })
            .catch(function (error) {
                return reject(error.statusCode);
            });
    })
}

exports.getIpwebcam = function (address, port, username, password) {
    return new Promise(function (resolve, reject) {
        var options = {
            url: "http://"+ address +":"+ port +"/sensors.json",
            auth: {
                user: username,
                pass: password
            },
            resolveWithFullResponse: true,
            timeout: 4000
        };

        rp(options)
            .then(function (response) {

                if (response.statusCode == 200) {
                    var data = JSON.parse(response.body);
                    var lux = 0;

                    if(data.motion_active.data[0][1][0] == 1) {
                        var motion = true;
                    } else {
                        var motion = false;
                    }

                    if(data.sound_event.data[0][1][0] == 1) {
                        var sound = true;
                    } else {
                        var sound = false;
                    }

                    if(data.hasOwnProperty("light")) {
                        if(!isEmpty(data.light.data)) {
                            var lux = data.light.data[0][1][0];
                        } else {
                            var lux = 0;
                        }
                    } else {
                        var lux = 0;
                    }

                    var result = {
                        battery: data.battery_level.data[0][1][0],
                        motionalarm: motion,
                        soundalarm: sound,
                        lux: lux
                    }

                    return resolve(result);
                } else {
                    return reject(response.statusCode);
                }
            })
            .catch(function (error) {
                return reject(error.statusCode);
            });
    })
}

exports.testEmail = function (args, callback) {
    var transporter = nodemailer.createTransport({
        host: args.body.email_hostname,
        port: args.body.email_port,
        secure: args.body.email_secure,
        auth: {
            user: args.body.email_username,
            pass: args.body.email_password
        },
        tls: {rejectUnauthorized: false}
    });

    var mailOptions = {
        from: 'Homey IP Webcam App <' + args.body.email_sender + '>',
        to: args.body.email_sender,
        subject: 'Test Email Homey IP Webcam App',
        text: Homey.__('This is a test email which confirms your email settings in the Homey IP Webcam App are correct.'),
        html: Homey.__('<h1>Homey IP Webcam App</h1><p>This is a test email which confirms your email settings in the Homey IP Webcam App are correct.</p>')
    }

    transporter.sendMail(mailOptions, function(error, info) {
        if(error) {
            callback (error, false);
        }
        callback (false, "OK");
    });
}

exports.sendSnapshot = function (image, args) {
    return new Promise(function (resolve, reject) {
        var now = getDateTime();
        var cid = ""+ now.year + now.month + now.day +"-"+ now.hour + now.min +"";

        var transporter = nodemailer.createTransport({
            host: Homey.ManagerSettings.get('email_hostname'),
            port: Homey.ManagerSettings.get('email_port'),
            secure: Homey.ManagerSettings.get('email_secure'),
            auth: {
                user: Homey.ManagerSettings.get('email_username'),
                pass: Homey.ManagerSettings.get('email_password')
            },
            tls: {rejectUnauthorized: false}
        });

        var mailOptions = {
            from: 'Homey IP Webcam App <' + Homey.ManagerSettings.get('email_sender') + '>',
            to: args.mailto,
            subject: 'Homey IP Webcam App Snapshot - '+ now.year +'-'+ now.month +'-'+ now.day +' '+ now.hour +':'+ now.min,
            text: '',
            html: Homey.__('<h1>Homey IP Webcam App</h1><p>This snapshot was taken at ') + now.year +'-'+ now.month +'-'+ now.day +' '+ now.hour +':'+ now.min +'.</p><p><img src="cid:'+ cid +'" alt="IP Webcam Snapshot" border="0" /></p>',
            attachments: [ {
                filename: 'ipwebcam_snapshot.jpg',
                content: new Buffer(image, 'base64'),
                cid: cid
            } ]
        }

        transporter.sendMail(mailOptions, function(error, info) {
            if(error) {
                return reject(error);
            } else {
                return resolve();
            }
        });
    })
}

exports.nightvision = function (address, port, username, password, args) {
    return new Promise(function (resolve, reject) {
        var options_switch = {
            url: "http://"+ address +":"+ port +"/settings/night_vision?set="+ args.nightvision +"",
            auth: {
                user: username,
                pass: password
            },
            resolveWithFullResponse: true,
            timeout: 4000
        };

        rp(options_switch)
            .then(function (response) {
                if (response.statusCode == 200) {
                    if(args.nightvision == 'on') {
                        var options_gain = {
                            url: "http://"+ address +":"+ port +"/settings/night_vision_gain?set="+ args.nightvision_gain +"",
                            auth: {
                                user: username,
                                pass: password
                            },
                            resolveWithFullResponse: true,
                            timeout: 4000
                        };

                        rp(options_gain)
                            .then(function (response) {
                                if (response.statusCode == 200) {
                                    var options_exposure = {
                                        url: "http://"+ address +":"+ port +"/settings/night_vision_average?set="+ args.nightvision_exposure +"",
                                        auth: {
                                            user: username,
                                            pass: password
                                        },
                                        resolveWithFullResponse: true,
                                        timeout: 4000
                                    };

                                    rp(options_exposure)
                                        .then(function (response) {
                                            if (response.statusCode == 200) {
                                                return resolve(args.nightvision_exposure);
                                            } else {
                                                return reject(response.statusCode);
                                            }
                                        })
                                        .catch(function (error) {
                                            return reject(error.statusCode);
                                        });
                                } else {
                                    return reject(response.statusCode);
                                }
                            })
                            .catch(function (error) {
                                return reject(error.statusCode);
                            });


                    } else {
                        return resolve(args.nightvision);
                    }
                } else {
                    return reject(response.statusCode);
                }
            })
            .catch(function (error) {
                return reject(error.statusCode);
            });
    })
}

exports.singleCommand = function (address, port, username, password, args, path) {
    return new Promise(function (resolve, reject) {
        var options_switch = {
            url: "http://"+ address +":"+ port +"/"+ path +"",
            auth: {
                user: username,
                pass: password
            },
            resolveWithFullResponse: true,
            timeout: 4000
        };

        rp(options_switch)
            .then(function (response) {
                if (response.statusCode == 200) {
                    return resolve(path);
                } else {
                    return reject(response.statusCode);
                }
            })
            .catch(function (error) {
                return reject(error.statusCode);
            });
    })
}

function getDateTime() {
    var date = new Date();

    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;

    var min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;

    var year = date.getFullYear();

    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;

    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;

    return { year: year, month: month, day: day, hour: hour, min: min };
}

function isEmpty(obj) {
    for(var prop in obj) {
        if(obj.hasOwnProperty(prop))
            return false;
    }
    return true;
}
