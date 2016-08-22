/**
 * ApiController
 *
 * @description :: API controller for responding to Slash commands
 */

var help = [
  'Keymaster - Temporary AWS credential Slack bot',
  '    list - List available roles',
  '    generate [role name] [credential lifetime in seconds] - Generate temporary credentails (e.g. generate s3-read-only 3600)',
  '    help - This help text'
].join('\n');

module.exports = {
  slash: function(req, res) {
    var text = req.body.text.split(' ');
    var command = text.shift();
    if (command === 'list') {
      return res.json({
        text: 'Available Roles:\n' + RoleService.listRoleNames().map(function(role) {
          return '- ' + role;
        }).join('\n')
      });
    } else if (command === 'generate') {
      var roleName = text.shift();
      var roleArn = RoleService.getRoleArn(roleName);
      if (!roleArn) {
        throw 'The role "' + roleName + '" does not exist';
      }
      var duration = parseInt(text.shift()) || sails.config.globals.keymaster.defaultLife;
      return RoleService.assumeRole(roleArn, req.body.user_id, duration).then(function(credentials) {
        return SlackService.sendAuditMessage(credentials, req.body.user_name, roleName);
      }).then(function(credentials) {
        var response = [
          'Your temporary credentials are below, they will expire on ' + credentials.Expiration + ':',
          '    Access Key: ' + credentials.AccessKeyId,
          '    Secret Key: ' + credentials.SecretAccessKey
        ].join('\n');
        return res.json({
          text: response
        });
      }).catch(function(err) {
        return res.json({
          text: 'Error: ' + err
        });
      });
    } else {
      return res.json({
        text: help
      });
    }
  }
};
