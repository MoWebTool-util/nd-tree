/**
 * @module: Tree
 * @author: crossjs <liwenfu@crossjs.com> - 2015-4-22 13:05:11
 */

'use strict';

var Buttons = require('../modules/buttons');

module.exports = function() {
  var plugin = this,
    host = plugin.host;

  plugin.exports = new Buttons({
    buttons: host.get('nodeActions'),
    parentNode: host.element
  }).render();

  host.delegateEvents({
    'click .name': function(e) {
      e.stopPropagation();

      plugin.exports.useTo(host.getNode(e.currentTarget.parentNode.getAttribute('data-node-id')));
    }
  });

  host.before('destroy', function() {
    plugin.exports && plugin.exports.destroy();
  });
};
