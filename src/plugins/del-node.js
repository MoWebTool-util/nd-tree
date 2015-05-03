/**
 * @module: Tree
 * @author: crossjs <liwenfu@crossjs.com> - 2015-4-22 13:05:11
 */

'use strict';

var $ = require('jquery');

var Confirm = require('nd-confirm');
var Alert = require('nd-alert');

var treeNode = require('../modules/treenode');

module.exports = function() {
  var plugin = this,
    host = plugin.host,
    options = plugin.options || {},
    awaiting;

  host.addNodeAction($.extend({
    'role': 'del-node',
    'text': '删除'
  }, options.button));

  // 移除参数
  delete options.button;

  host.delegateEvents({

    'click [data-role="del-node"]': function(e) {
      if (awaiting) {
        return;
      }

      Confirm.show('确定删除？', function() {
        // 添加用于阻止多次点击
        awaiting = true;

        var id = treeNode($(e.currentTarget).closest('li')).get('id');

        host.DELETE(id)
          .done(function(/*data*/) {
            host.deleteNode(id);
          })
          .fail(function(error) {
            Alert.show(error);
          })
          .always(function() {
            awaiting = false;
          });

      });
    }

  });

  // 通知就绪
  this.ready();
};
