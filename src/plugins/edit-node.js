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
    options = plugin.options || {},
    uniqueId,
    awaiting;

  function makeForm(data) {
    return new FormExtra($.extend(true, {
      name: 'tree-edit-node',
      // action: '',
      method: 'PATCH',
      // 表单数据
      formData: data,
      proxy: host.get('proxy'),
      parentNode: host.get('parentNode')
    }, plugin.getOptions('view')))
    .on('formCancel', function() {
      plugin.trigger('hide', this);
    })
    .on('formSubmit', function(data) {
      // 调用队列
        plugin.trigger('submit', data);
    });
  }

  (function(button) {
    host.addNodeAction($.extend({
      'role': 'edit-node',
      'text': '编辑节点'
    }, button), button && button.index);
  })(plugin.getOptions('button'));

  // 异步插件，需要刷新列表
  // if (plugin._async) {
  //   host._renderPartial();
  // }

  host.delegateEvents({
    'click [data-role="edit-node"]': function(e) {
      if (awaiting) {
        return;
      }

      if (!plugin.exports) {
        // 添加用于阻止多次点击
        awaiting = true;

        uniqueId = treeNode($(e.currentTarget).closest('li')).get('id');

        host.GET(uniqueId)
        .done(function(data) {
          plugin.exports = makeForm(data).render();
          plugin.trigger('show', plugin.exports);
        })
        .fail(function(error) {
          Alert.show(error);
        })
        .always(function() {
          awaiting = false;
        });
      } else {
        plugin.trigger('show', plugin.exports);
      }
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

    host.PATCH(uniqueId, data)
      .done(function(data) {
        // 成功，更新节点
        host.modifyNode(data);

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
