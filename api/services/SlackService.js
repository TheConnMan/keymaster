var Slack = require('node-slack');
var slack = new Slack(sails.config.globals.keymaster.auditWebhook);

module.exports = {
  sendAuditMessage: function(credentials, username, role) {
    return new Promise(function(resolve, reject) {
      if (sails.config.globals.keymaster.auditWebhook) {
        var message = [
          username + ' has generated temporary AWS credentials',
          '    Role: *' + role + '*',
          '    Access Key: *' + credentials.AccessKeyId + '*',
          '    Expires: *' + credentials.Expiration + '*'
        ].join('\n');
        var params = {
          text: message,
          username: sails.config.globals.keymaster.auditBotName || 'Keymaster'
        };
        if (sails.config.globals.keymaster.auditChannel) {
          params.channel = sails.config.globals.keymaster.auditChannel;
        }
        slack.send(params, function(err, data) {
          if (err) {
            reject(err);
          } else {
            resolve(credentials);
          }
        });
      } else {
        resolve(credentials);
      }
    });
  }
};
