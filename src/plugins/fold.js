/**
 * @module: Tree
 * @author: crossjs <liwenfu@crossjs.com> - 2015-4-22 13:05:11
 */

'use strict';

var $ = require('jquery');

var treeNode = require('../modules/treenode');

module.exports = function() {
  var plugin = this,
    host = plugin.host;

  var CLS_OPENED = 'opened';

  treeNode.extend({

    _onRenderOpened: function(opened) {
      this.toggleOpen(opened);
    },

    toggleOpen: function(toOpened) {
      this.element.toggleClass(CLS_OPENED, toOpened);
    }

  });

  host.delegateEvents({
    'click .toggle': function(e) {
      e.stopPropagation();

      treeNode($(e.currentTarget).parent()).toggleOpen();
    }
  });

  // 通知就绪
  this.ready();
};
