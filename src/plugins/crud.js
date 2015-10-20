/**
 * @module Tree
 * @author crossjs <liwenfu@crossjs.com>
 */

'use strict';

var Buttons = require('../modules/buttons');

module.exports = function() {
  var plugin = this,
    host = plugin.host;

  plugin.exports = new Buttons({
    className: 'buttons-crud',
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

  // 通知就绪
  this.ready();
};
