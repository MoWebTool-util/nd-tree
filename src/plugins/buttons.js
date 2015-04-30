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
  }).render().element;

  host.delegateEvents({
    'click .name': function(e) {
      e.stopPropagation();

      plugin.exports.insertAfter(e.currentTarget);
    }
  });
};
