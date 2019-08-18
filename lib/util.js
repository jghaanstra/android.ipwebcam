const Homey = require('homey');
const fetch = require('node-fetch');
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

exports.getBufferSnapshot = function (url, username, password) {
  return new Promise(function (resolve, reject) {
    fetch(url, {
        method: 'GET',
        headers: {'Authorization': 'Basic ' + Buffer.from(username + ":" + password).toString('base64')},
        timeout: 10000
      })
      .then(checkStatus)
      .then(res => res.buffer())
      .then(buffer => {
        return resolve(buffer);
      })
      .catch(err => {
        return reject(err);
      });
  })
}

exports.getStreamSnapshot = function (url, username, password) {
  return new Promise(function (resolve, reject) {
    fetch(url, {
        method: 'GET',
        headers: {'Authorization': 'Basic ' + Buffer.from(username + ":" + password).toString('base64')},
        timeout: 10000
      })
      .then(checkStatus)
      .then(res => {
        return resolve(res);
      })
      .catch(err => {
        return reject(err);
      });
  })
}

exports.getIpwebcam = function (address, port, username, password) {
  return new Promise(function (resolve, reject) {
    fetch('http://'+ address +':'+ port +'/sensors.json', {
        method: 'GET',
        headers: {'Authorization': 'Basic ' + Buffer.from(username + ":" + password).toString('base64')},
        timeout: 10000
      })
      .then(checkStatus)
      .then(res => res.json())
      .then(json => {
        var lux = 0;

        if (json.hasOwnProperty("motion_active") && !isEmpty(json.motion_active.data)) {
          if (json.motion_active.data[0][1][0] == 1) {
            var motion = true;
          } else {
            var motion = false;
          }
		    } else {
          return reject('err_sensor_motion');
        }

        if (json.hasOwnProperty("sound_event") && !isEmpty(json.sound_event.data)) {
          if (json.sound_event.data[0][1][0] == 1) {
            var sound = true;
          } else {
            var sound = false;
          }
		    } else {
          return reject('err_sensor_sound');
        }

        if (json.hasOwnProperty("light") && !isEmpty(json.light.data)) {
          var lux = json.light.data[0][1][0];
        } else {
          var lux = 0;
          //return reject('err_sensor_light'); do not throw error to support devices with missing image sensor
        }

        if (json.hasOwnProperty("battery_level") && !isEmpty(json.battery_level.data)) {
          var battery = json.battery_level.data[0][1][0];
        } else {
          return reject('err_sensor_battery');
        }

        var result = {
          battery: battery,
          motionalarm: motion,
          soundalarm: sound,
          lux: lux
        }

        return resolve(result);
      })
      .catch(err => {
        return reject(err);
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
    } else {
      callback (false, "OK");
    }
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
    var options = {
      method: 'GET',
      headers: {'Authorization': 'Basic ' + Buffer.from(username + ":" + password).toString('base64')},
      timeout: 4000
    }

    fetch('http://'+ address +':'+ port +'/settings/night_vision?set=' + args.nightvision +'', options)
      .then(checkStatus)
      .then(res => res.text())
      .then(body => {

        if (args.nightvision == 'on') {
          fetch('http://'+ address +':'+ port +'/settings/night_vision_gain?set='+ args.nightvision_gain +'', options)
            .then(checkStatus)
            .then(res => res.text())
            .then(body => {

              fetch('http://'+ address +':'+ port +'/settings/night_vision_average?set='+ args.nightvision_exposure +'', options)
                .then(checkStatus)
                .then(res => res.text())
                .then(body => {
                  return resolve(args.nightvision_exposure);
                })
                .catch(err => {
                  return reject(err);
                });

            })
            .catch(err => {
              return reject(err);
            });

        } else {
          return resolve(args.nightvision);
        }
      })
      .catch(err => {
        return reject(err);
      });
  })
}

exports.singleCommand = function (address, port, username, password, args, path) {
  return new Promise(function (resolve, reject) {
    fetch('http://'+ address +':'+ port +'/'+ path, {
        method: 'GET',
        headers: {'Authorization': 'Basic ' + Buffer.from(username + ":" + password).toString('base64')},
        timeout: 4000
      })
      .then(checkStatus)
      .then(res => res.text())
      .then(body => {
        return resolve(path);
      })
      .catch(err => {
        return reject(err);
      });
  })
}

function checkStatus(res) {
  if (res.ok) { // res.status >= 200 && res.status < 300
    return res;
  } else {
    throw new Error(res.status);
  }
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
