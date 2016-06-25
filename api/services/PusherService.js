// PusherService.js
var Pusher = require('pusher');

module.exports = {

  trigger(channel, event, data) {
    var pusher = new Pusher({
		  appId: '216969',
		  key: 'f5d91269ef4e8b70abac',
		  secret: 'f65767f48630e2088835',
		  cluster: 'eu',
		  encrypted: true
		});

    pusher.trigger(channel, event, data);
  },

};
