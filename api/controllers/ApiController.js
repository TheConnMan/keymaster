/**
 * ApiController
 *
 * @description :: API controller for responding to Slash commands
 */

var help = [
  'Keymaster - Temporary AWS credential Slack bot',
  '    list - List available roles',
  '    help - This help text'
].join('\n');

module.exports = {
  slash: function(req, res) {
    var text = req.body.text.split(' ');
    var command = text.shift();
    if (command === 'list') {
      return RoleService.listRoleNames().then(function(roles) {
        return res.json({
          text: 'Available Roles:\n' + roles.sort().map(function(role) {
            return '- ' + role;
          }).join('\n')
        });
      });
    } else {
      return res.json({
        text: help
      });
    }
  }
};
