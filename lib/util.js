'use strict';

const fetch = require('node-fetch');
const nodemailer = require('nodemailer');

class Util {

  constructor(opts) {
    this.homey = opts.homey;
  }

  getBufferSnapshot(url, username, password, returntype = 'buffer') {
    return new Promise((resolve, reject) => {
      fetch(url, {
          method: 'GET',
          headers: {'Authorization': 'Basic ' + Buffer.from(username + ":" + password).toString('base64')},
          timeout: 10000
        })
        .then(this.checkStatus)
        .then(res => res.buffer())
        .then(buffer => {
          if (returntype == 'base64') {
            const image = 'data:image/jpeg;base64,' + buffer.toString('base64');
            return resolve(image);
          } else {
            return resolve(buffer);
          }
        })
        .catch(error => {
          return reject(error);
        });
    })
  }

  getStreamSnapshot(url, username, password) {
    return new Promise((resolve, reject) => {
      fetch(url, {
          method: 'GET',
          headers: {'Authorization': 'Basic ' + Buffer.from(username + ":" + password).toString('base64')},
          timeout: 10000
        })
        .then(this.checkStatus)
        .then(res => {
          return resolve(res);
        })
        .catch(error => {
          return reject(error);
        });
    })
  }

  getIpwebcam(address, port, username, password) {
    return new Promise((resolve, reject) => {
      fetch('http://'+ address +':'+ port +'/sensors.json', {
          method: 'GET',
          headers: {'Authorization': 'Basic ' + Buffer.from(username + ":" + password).toString('base64')},
          timeout: 10000
        })
        .then(this.checkStatus)
        .then(res => res.json())
        .then(json => {
          var lux = 0;

          if (json.hasOwnProperty("motion_active") && !this.isEmpty(json.motion_active.data)) {
            if (json.motion_active.data[0][1][0] == 1) {
              var motion = true;
            } else {
              var motion = false;
            }
  		    } else {
            return reject('err_sensor_motion');
          }

          if (json.hasOwnProperty("sound_event") && !this.isEmpty(json.sound_event.data)) {
            if (json.sound_event.data[0][1][0] == 1) {
              var sound = true;
            } else {
              var sound = false;
            }
  		    } else {
            return reject('err_sensor_sound');
          }

          if (json.hasOwnProperty("light") && !this.isEmpty(json.light.data)) {
            var lux = json.light.data[0][1][0];
          } else {
            var lux = 0;
            //return reject('err_sensor_light'); do not throw error to support devices with missing image sensor
          }

          if (json.hasOwnProperty("battery_level") && !this.isEmpty(json.battery_level.data)) {
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
        .catch(error => {
          return reject(error);
        });
    })
  }

  testEmail(args) {
    var transporter = nodemailer.createTransport({
      host: args.email_hostname,
      port: args.email_port,
      secure: args.email_secure,
      auth: {
        user: args.email_username,
        pass: args.email_password
      },
      tls: {rejectUnauthorized: false}
    });

    var mailOptions = {
      from: 'Homey IP Webcam App <' + args.email_sender + '>',
      to: args.email_sender,
      subject: 'Test Email Homey IP Webcam App',
      text: this.homey.__('util.test_email_body_text'),
      html: this.homey.__('util.test_email_body_html')
    }

    return transporter.sendMail(mailOptions);
  }

  sendSnapshot(image, args) {
    var now = this.getDateTime();
    var cid = ""+ now.year + now.month + now.day +"-"+ now.hour + now.min +"";

    var transporter = nodemailer.createTransport({
      host: this.homey.settings.get('email_hostname'),
      port: this.homey.settings.get('email_port'),
      secure: this.homey.settings.get('email_secure'),
      auth: {
        user: this.homey.settings.get('email_username'),
        pass: this.homey.settings.get('email_password')
      },
      tls: {rejectUnauthorized: false}
    });

    var mailOptions = {
      from: 'Homey IP Webcam App <' + this.homey.settings.get('email_sender') + '>',
      to: args.mailto,
      subject: 'Homey IP Webcam App Snapshot - '+ now.year +'-'+ now.month +'-'+ now.day +' '+ now.hour +':'+ now.min,
      text: '',
      html: this.homey.__('util.email_snapshot_html') + now.year +'-'+ now.month +'-'+ now.day +' '+ now.hour +':'+ now.min +'.</p><p><img src="cid:'+ cid +'" alt="IP Webcam Snapshot" border="0" /></p>',
      attachments: [ {
        filename: 'ipwebcam_snapshot.jpg',
        content: image,
        cid: cid
      } ]
    }

    return transporter.sendMail(mailOptions);
  }

  nightvision(address, port, username, password, args) {
    return new Promise((resolve, reject) => {
      var options = {
        method: 'GET',
        headers: {'Authorization': 'Basic ' + Buffer.from(username + ":" + password).toString('base64')},
        timeout: 4000
      }

      fetch('http://'+ address +':'+ port +'/settings/night_vision?set=' + args.nightvision +'', options)
        .then(this.checkStatus)
        .then(res => res.text())
        .then(body => {

          if (args.nightvision == 'on') {
            fetch('http://'+ address +':'+ port +'/settings/night_vision_gain?set='+ args.nightvision_gain +'', options)
              .then(this.checkStatus)
              .then(res => res.text())
              .then(body => {

                fetch('http://'+ address +':'+ port +'/settings/night_vision_average?set='+ args.nightvision_exposure +'', options)
                  .then(this.checkStatus)
                  .then(res => res.text())
                  .then(body => {
                    return resolve(args.nightvision_exposure);
                  })
                  .catch(err => {
                    return reject(err);
                  });

              })
              .catch(error => {
                return reject(error);
              });

          } else {
            return resolve(args.nightvision);
          }
        })
        .catch(error => {
          return reject(error);
        });
    })
  }

  singleCommand(address, port, username, password, args, path) {
    return new Promise((resolve, reject) => {
      fetch('http://'+ address +':'+ port +'/'+ path, {
          method: 'GET',
          headers: {'Authorization': 'Basic ' + Buffer.from(username + ":" + password).toString('base64')},
          timeout: 4000
        })
        .then(this.checkStatus)
        .then(res => res.text())
        .then(body => {
          return resolve(path);
        })
        .catch(error => {
          return reject(error);
        });
    })
  }

  checkStatus = (res) => {
    if (res.ok) {
      return res;
    } else {
      if (res.status == 401) {
        throw new Error(this.homey.__('util.unauthorized'));
      } else if (res.status == 502 || res.status == 504) {
        throw new Error(this.homey.__('util.timeout'));
      } else if (res.status == 500) {
        throw new Error(this.homey.__('util.servererror'));
      } else {
        throw new Error(this.homey.__('util.unknownerror'));
      }
    }
  }

  getDateTime() {
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

  isEmpty(obj) {
    for(var prop in obj) {
      if(obj.hasOwnProperty(prop))
        return false;
    }
    return true;
  }

}

module.exports = Util;
