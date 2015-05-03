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

  var nodeChecked;
  var multipleChk = host.get('multiple');

  var CLS_CHECKED = 'checked';
  var CLS_HAS_CHECKED = 'has-checked';

  var CHECK_STATE_NONE = 0;
  var CHECK_STATE_ALL = 1;
  var CHECK_STATE_HAS = 2;
  var DIRECTION_INSIDE = 1;
  var DIRECTION_OUTSIDE = -1;

  treeNode.extend({

    _onRenderChecked: function(checked) {
      // async for nodes ready
      setTimeout(function() {
        this.toggleCheck(checked ? CHECK_STATE_ALL : CHECK_STATE_NONE);
      }.bind(this), 80);
    },

    toggleCheck: function(toChecked, direction) {
      if (typeof toChecked === 'undefined') {
        toChecked = this.isChecked() ? CHECK_STATE_NONE : CHECK_STATE_ALL;
      }

      this.setChecked(toChecked);

      // 向外
      if (typeof direction === 'undefined' || direction === DIRECTION_OUTSIDE) {
        var toCheckedOut = toChecked;

        if (toCheckedOut === CHECK_STATE_ALL) {
          // 如果有未选中或半选
          if (Object.keys(this.siblings(function(id, node) {
              return !node.isChecked();
            })).length) {
            // 则半选
            toCheckedOut = CHECK_STATE_HAS;
          }
        } else if (toCheckedOut === CHECK_STATE_NONE) {
          // 如果有选中或半选
          if (Object.keys(this.siblings(function(id, node) {
              return node.hasChecked();
            })).length) {
            // 半选
            toCheckedOut = CHECK_STATE_HAS;
          }
        }

        // toggle parent check state
        var parentNode = this.get('parentNode');
        if (parentNode && parentNode.toggleCheck) {
          parentNode.toggleCheck(toCheckedOut, DIRECTION_OUTSIDE);
        }
      }

      if (!multipleChk) {
        if (typeof direction === 'undefined') {
          if (nodeChecked && nodeChecked !== this) {
            nodeChecked.toggleCheck(CHECK_STATE_NONE, DIRECTION_OUTSIDE);
          }
          nodeChecked = this;
        }

        return;
      }

      // 向里
      if (typeof direction === 'undefined' || direction === DIRECTION_INSIDE) {
        // toggle children check state
        var children = this.children();
        Object.keys(children).forEach(function(id) {
          children[id].toggleCheck(toChecked, DIRECTION_INSIDE);
        });
      }
    },

    isChecked: function() {
      return this.element.hasClass(CLS_CHECKED);
    },

    hasChecked: function() {
      // 全选或者半选，都算有选中
      return this.isChecked() || this.element.hasClass(CLS_HAS_CHECKED);
    },

    setChecked: function(checked) {
      if (checked === 1) {
        this.element.removeClass(CLS_HAS_CHECKED);
        this.element.addClass(CLS_CHECKED);
      } else if (checked === 0) {
        this.element.removeClass(CLS_HAS_CHECKED);
        this.element.removeClass(CLS_CHECKED);
      } else {
        this.element.removeClass(CLS_CHECKED);
        this.element.addClass(CLS_HAS_CHECKED);
      }
    },

    /**
     * 获取选中的子节点
     * @param  {number} mode 0：递归获取所有子节点 1：直属子节点
     * @return {object}      节点集合
     */
    getChecked: function(mode) {
      if (!mode) {
        var checked = {};

        // 全选/半选
        var children = this.children(function(id, node) {
          return node.hasChecked();
        });

        Object.keys(children).forEach(function(id) {
          if (children[id].isChecked()) {
            checked[id] = children[id];
          }

          $.extend(checked, children[id].getChecked(mode));
        });

        return checked;
      }

      return this.children(function(id, node) {
        return node.isChecked();
      });
    },

    /**
     * 获取选中的子节点的 IDs
     * @param  {number} mode 0：递归获取所有子节点 1：直属子节点
     * @return {array}       包含 IDs 的数组
     */
    getCheckedIds: function(mode) {
      return Object.keys(this.getChecked(mode));
    }

  });

  host.getChecked = function(mode) {
    return host.treeRoot.getChecked(mode);
  };

  host.getCheckedIds = function(mode) {
    return host.treeRoot.getCheckedIds(mode);
  };

  host.delegateEvents({
    'click .choose': function(e) {
      e.stopPropagation();

      treeNode($(e.currentTarget).parent()).toggleCheck();
    }
  });

  // 通知就绪
  this.ready();
};
