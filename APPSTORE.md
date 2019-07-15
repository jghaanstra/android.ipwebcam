# Android IP Webcam for Homey
Use Homey together with Android IP Webcam ( [Ad Supported Version](https://play.google.com/store/apps/details?id=com.pas.webcam) or [Pro Version](https://play.google.com/store/apps/details?id=com.pas.webcam.pro) by Pavel Khlebovich &copy;). With Android IP Webcam you can turn any smartphone or tablet into a security camera or baby monitor that detects motion and sound and luminance (depends on available sensors in your Android device). With the Homey app for Android IP Webcam you can respond to these triggers and control the camera options.

**Supported Cards**
- [TRIGGER] All default supported battery, motion alarm and generic alarm cards (generic alarm will be replaced with sound alarm once supported by Homey core)
- [ACTION] Send live snapshot through email
- [ACTION] Set motion and sound alarm threshold
- [ACTION] Turn on night vision and set gain
- [ACTION] Zoom camera
- [ACTION] Set the stream quality
- [ACTION] Turn on/off camera LED
- [ACTION] Switch front / back camera

## Instructions
### Install and configure IP Webcam
Install IP Webcam from Google Playstore. Please consider installing the Pro version to support the author of this app. Open the app and configure at least the following options.
- enable motion and sound detection (timeout of 5 seconds is usually good, sensitity is personal, try to find your optimal settings)
- enable data logging (data retention of 5 seconds is good, at least enable motion, sound, battery and light sensor)
- local broadcast (make sure you set a static IP in your router for this Android device, set the listening port in the options and optionally a usename / password)
- start the server

### Add your IP Webcam as device in Homey
After you have set up IP Webcam on your Android device you can add it as device within Homey like any other device. You will need to fill in the IP address, optional username & password and a poll frequency. The default polling frequency is 5 seconds. You can find the IP address in your Android device by clicking the cogwheel under the WiFi settings.

### Setting up email
To be able to send snapshots through email you will need to configure an email account which sends out the email. In the general settings of the Homey IP Webcam App there is a section to configure your email account. Please pay attention to the extra information when adding a Gmail account, this requires you to use a specific app password which needs to be setup within your Google account.

## Support topic
For support please use the official support topic on the forum [here](https://community.athom.com/t/122).

## Known issues
- When using multiple IP Webcameras only one global image token is registered and available. This is due to current limitations of Homey core and will hopefully become available in the future.

## Changelog
### v1.3.1 - 2019-07-15
* IMPROVEMENT: prevent errors when not all data logs are available or enabled (thanx to pmolensky for pull request)
