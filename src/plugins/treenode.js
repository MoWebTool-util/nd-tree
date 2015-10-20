/**
 * @module Tree
 * @author crossjs <liwenfu@crossjs.com>
 */

'use strict';

var $ = require('jquery');

var treeNode = require('../modules/treenode');

module.exports = function() {
  var plugin = this,
    host = plugin.host;

  host.delegateEvents({
    'click .toggle': function(e) {
      e.stopPropagation();

      treeNode($(e.currentTarget).parent()).toggleOpen();
    },
    'click .choose': function(e) {
      e.stopPropagation();

      if (this.get('checkable')) {
        treeNode($(e.currentTarget).parent()).toggleCheck();
      }
    },
    'click .name': function(e) {
      e.stopPropagation();

      if (this.emSelected) {
        if (this.emSelected === e.currentTarget) {
          return;
        }

        $(this.emSelected).removeClass('selected');
      }

      this.emSelected = e.currentTarget;
      $(this.emSelected).addClass('selected');
    }
  });

  // 通知就绪

  this.ready();
};
