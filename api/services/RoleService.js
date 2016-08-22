var Promise = require('promise');
var AWS = require('aws-sdk');
var roles = require('../../roles/roles.json');

var sts = new AWS.STS();

module.exports = {
  listRoleNames: function() {
    return Object.keys(roles).sort();
  },

  getRoleArn: function(roleName) {
    return roles[roleName];
  },

  assumeRole: function(role, sessionName, duration) {
    var params = {
      RoleArn: role,
      RoleSessionName: sessionName,
      DurationSeconds: duration
    };
    return new Promise(function(resolve, reject) {
      sts.assumeRole(params, function(err, data) {
        if (err) {
          reject(err);
        } else {
          resolve(data.Credentials);
        }
      });
    });
  }
};
