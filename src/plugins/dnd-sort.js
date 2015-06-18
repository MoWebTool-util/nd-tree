/**
 * @module: Tree
 * @author: crossjs <liwenfu@crossjs.com>
 */

'use strict';

var $ = require('jquery');

var Alert = require('nd-alert');
var DnD = require('nd-dnd');

var treeNode = require('../modules/treenode');

module.exports = function() {
  var plugin = this,
    host = plugin.host,
    translate = plugin.translate || function(data) {return data;};

  function move(child, parent) {
    var data = {
      id: treeNode(child).get('id'),
      parent: treeNode(parent).get('id')
    };

    host.PATCH({
      // translate for PATCH
      data: translate(data),
      params: ['actions', 'move']
    })
      .done(function(/*data*/) {
        // 成功，更新节点
        // use untranslated
        host.modifyNode(data);

        // plugin.trigger('hide', plugin.exports);
      })
      .fail(function(error) {
        Alert.show(error);
      });
  }

  var checkable = host.get('checkable');

  plugin.exports = new DnD({
    // containment: host.element,
    visible: true,
    revert: true,
    drops: host.$('li'),
    axis: 'y'
  })
  // .on('drag', function(proxy, drop) {})
  .on('dragenter', function(proxy, drop) {
    drop.addClass('active');
  })
  // .on('dragover', function(proxy, drop) {})
  .on('dragleave', function(proxy, drop) {
    drop.removeClass('active');
  })
  .on('drop', function(dataTransfer, proxy, drop) {
    drop.removeClass('active');
  })
  .on('dragend', function(element, drop) {
    if (drop) {
      drop.removeClass('active');
    }

    if (element) {
      element.css({
        left: 'auto',
        top: 'auto'
      });
    }

    if (element && drop) {
      // 本身
      if (element[0] === drop[0]) {
        return;
      }

      // 已是子节点
      if (element[0].parentNode.parentNode === drop[0]) {
        return;
      }

      // 不可放入子节点
      if ($.contains(element[0], drop[0])) {
        return;
      }

      move(element, drop);
    }
  });

  if (checkable) {
    plugin.exports
      .on('dragstart', function(/*dataTransfer, proxy*/) {
        // 取消选中状态
        host.treeRoot.toggleCheck(0);
      });
  }

  // dragstart
  // drag
  // dragenter
  // dragover
  // dragleave
  // drop
  // dragend

  DnD.open();

  // host.addNodeAction($.extend({
  //   'role': 'dnd-sort',
  //   'text': '拖放排序'
  // }, options.button));

  host.after('renderNode', function(treeNode) {
    // add element
    if (treeNode.get('parent') !== -1) {
      plugin.exports.addElement(treeNode.element.add());
    }
    // add children
    plugin.exports.addElement(treeNode.$('li'));
    plugin.exports.set('drops', host.$('li'));
  });

  host.before('destroy', function() {
    plugin.exports && plugin.exports.destroy();

    DnD.close();
  });

  // 通知就绪
  this.ready();
};
