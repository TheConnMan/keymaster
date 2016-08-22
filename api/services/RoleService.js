var Promise = require('promise');
var AWS = require('aws-sdk');

var sts = new AWS.STS();
var iam = new AWS.IAM();

module.exports = {
  listRoles: function() {
    return new Promise(function(resolve, reject) {
      iam.listRoles({}, function(err, data) {
          if (err) {
            reject(err);
          } else {
            resolve(data.Roles.map(function(role) {
              return role.RoleName;
            }));
          }
      });
    });
  }
};
