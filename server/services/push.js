const PushNotifications = new require('node-pushnotifications');
const push = new PushNotifications({
  apn: {
    production: true,
    token: {
      key: './keys/AuthKey_9VHKUKR3N2.p8',
      keyId: '9VHKUKR3N2',
      teamId: '2H53L3FV23',
    },
    // gcm: {
    //   id: null,
    // }
  }
});

module.exports = {
  send: (registrationId, data) => {
    return push.send(registrationId, {
      body: data.body,
      title: data.title,
      topic: 'com.rd.catch'
    });
  }
}
