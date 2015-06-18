/**
 * @module: Tree
 * @author: crossjs <liwenfu@crossjs.com>
 */

'use strict';

var $ = require('jquery');

var Alert = require('nd-alert');
var FormExtra = require('nd-form-extra');

var treeNode = require('../modules/treenode');

module.exports = function() {
  var plugin = this,
    host = plugin.host,
    awaiting;

  function makeForm(data) {
    return new FormExtra($.extend(true, {
      name: 'tree-add-node',
      // action: '',
      method: 'POST',
      formData: data,
      proxy: host.get('proxy'),
      parentNode: host.get('parentNode')
    }, plugin.getOptions('view')))
    .on('formCancel', function() {
      plugin.trigger('hide', this);
    })
    .on('formSubmit', function() {
      // 调用队列
      this.submit(function(data) {
        plugin.trigger('submit', data);
      });
    });
  }

  (function(button) {
    host.addNodeAction($.extend({
      'role': 'add-node',
      'text': '增加子节点'
    }, button), button && button.index || 0);
  })(plugin.getOptions('button'));

  host.delegateEvents({
    'click [data-role="add-node"]': function(e) {
      if (!plugin.exports) {
        var parentTreeNode = treeNode($(e.currentTarget).closest('li'));
        plugin.exports = makeForm({
          'parent_id': parentTreeNode.get('id'),
          'parent_name': parentTreeNode.get('name')
        }).render();
      }

      plugin.trigger('show', plugin.exports);
    }
  });

  host.before('destroy', function() {
    plugin.exports && plugin.exports.destroy();
  });

  plugin.on('show', function(form) {
    if (!this.getOptions('interact')) {
      host.element.hide();
    }

    form.element.show();
  });

  plugin.on('hide', function(form) {
    if (!this.getOptions('interact')) {
      host.element.show();
    }

    form.destroy();
    delete plugin.exports;
  });

  plugin.on('submit', function(data) {
    if (awaiting) {
      return;
    }

    // 添加用于阻止多次点击
    awaiting = true;
    host.POST({
        data: data
      })
      .done(function(data) {
        // 成功，插入节点
        host.insertNode(data);

        // 隐藏
        plugin.trigger('hide', plugin.exports);
      })
      .fail(function(error) {
        Alert.show(error);
      })
      .always(function() {
        awaiting = false;
      });
  });

  // 通知就绪
  this.ready();
};
