/**
 * @module Tree
 * @author crossjs <liwenfu@crossjs.com>
 */

'use strict';

var $ = require('jquery');

var Buttons = require('../modules/buttons');

function getEventName(e) {
  return e.currentTarget
    .getAttribute('data-role')
    .replace(/\-([a-zA-Z])/g, function(_, $1) {
      return $1.toUpperCase();
    });
}

module.exports = function() {
  var plugin = this,
    host = plugin.host,
    options = plugin.options;

  plugin.exports = new Buttons($.extend(true, {
    className: 'buttons-save',
    parentNode: host.element,
    buttons: [{
      text: '保存',
      role: 'tree-save'
    }],
    events: {
      'click [data-role]': function(e) {
        if (this.trigger(getEventName(e)) === false) {
          // preventing, such as form submit
          e.preventDefault();
        }
      }
    }
  }, options)).render();

  host.before('destroy', function() {
    plugin.exports && plugin.exports.destroy();
  });

  // 通知就绪
  this.ready();
};
