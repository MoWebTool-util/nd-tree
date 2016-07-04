/**
 * @module Tree
 * @author crossjs <liwenfu@crossjs.com>
 */

'use strict';

var __ = require('nd-i18n');
var Widget = require('nd-widget');
var Template = require('nd-template');

var treeNode = require('./src/treenode');

var enums = require('./src/enums');

// var CHECK_STATE_NONE = enums.CHECK_STATE_NONE;
var CHECK_STATE_ALL = enums.CHECK_STATE_ALL;
var CHECK_STATE_HAS = enums.CHECK_STATE_HAS;

var CHECKED_NODE_TOKEN = '__CHECKED_NODE';
var SELECTED_NODE_TOKEN = '__SELECTED_ELEMENT';
var RENDERED_NODES_TOKEN = '__RENDERED_NODES';

/**
 * @event Tree#nodeChanged
 */

var Tree = Widget.extend({

  Statics: enums,

  Implements: [Template],

  attrs: {

    classPrefix: 'ui-tree',
    template: require('./src/tree.handlebars'),

    // keyMap: {
    //   id: 'node_id',
    //   name: 'node_name',
    //   parent: 'parent_id'
    // },

    treeName: __('根节点'),
    treeId: 0,

    // 行处理
    nodeActions: [],

    async: false,

    autoload: true,

    //数据源
    dataSource: {
      value: null,
      getter: function(val) {
        if (typeof val !== 'function') {
          return function(query, done) {
            done(val);
          };
        }

        return val;
      }
    },

    // 解析后的数据列表
    dataList: {
      value: null,
      setter: function(val /*, key*/ ) {
        var todos = !val ? [] : this.translate(val);

        // 异步树，逐级获取，直接返回
        if (this.get('async')) {
          todos.forEach(function(todo) {
            todo.children || (todo.children = []);
          });
          return todos;
        }

        // 同步树,一次性获取所有节点

        // 缓存索引
        var stackIds = {};

        // 最终数据
        var dataList = [];

        function addChild(node) {
          // 统一加 children
          node.children || (node.children = []);

          // 缓存，方便快速索引
          stackIds[node.id] = node;

          if (node.parent) {
            if (node.parent in stackIds) {
              stackIds[node.parent].children.push(node);
            } else {
              todos.push(node);
            }
          } else {
            // top level branches
            dataList.push(node);
          }
        }

        var node;

        while ((node = todos.shift())) {
          addChild(node);
        }

        return dataList;
      }
    },

    foldable: false,
    checkable: false,
    multiple: true,
    opened: false,
    checked: false
  },

  // events: {},

  initAttrs: function(config) {
    Tree.superclass.initAttrs.call(this, config);

    var checkable = this.get('checkable');

    if (!checkable) {
      this.set('multiple', false);
    }

    var foldable = this.get('foldable');

    if (!foldable) {
      this.set('opened', true);
    }

    this.set('model', {
      foldable: this.get('foldable'),
      checkable: checkable,
      multiple: this.get('multiple')
    });
  },

  initProps: function() {
    this[RENDERED_NODES_TOKEN] = {};
  },

  setup: function() {
    this.treeRoot = this.renderNode({
      parent: -1,
      id: this.get('treeId'),
      name: this.get('treeName'),
      opened: this.get('opened'),
      checked: this.get('checked'),
      foldable: this.get('foldable'),
      checkable: this.get('checkable'),
      multiple: this.get('multiple'),
      children: []
    });
  },

  getDataList: function(parent, callback) {
    var that = this;

    // async
    that.get('dataSource')(parent, function(data) {
      var hasChild = !!data.length;
      // override
      that.set('dataList', data, {
        override: true
      });
      // callback
      callback && callback(hasChild);
    });
  },

  _onRenderDataList: function(dataList) {
    if (!dataList) {
      return;
    }

    dataList.forEach(this.renderNode.bind(this));
  },

  renderNode: function(data) {
    data.async = this.get('async');
    data.parentNode = this.getNodeById(data.parent);
    data.tree = this;
    return (this[RENDERED_NODES_TOKEN][data.id] = treeNode(data));
  },

  appendChild: function(node) {
    this.element.children('ul').append(node.element);
  },

  removeChild: function(node) {
    node.element.remove();
  },

  getNodeById: function(id) {
    if (!this[RENDERED_NODES_TOKEN][id]) {
      this[RENDERED_NODES_TOKEN][id] = treeNode(this.$('[data-node-id="' + id + '"]'));
    }

    return this[RENDERED_NODES_TOKEN][id];
  },

  getDataById: function(id, options) {
    if (id > 0) {
      return this.getNodeById(id).get('data', options || {});
    }

    return this.treeRoot.get('data', options || {});
  },

  getCheckedNodes: function() {
    var nodes = this[RENDERED_NODES_TOKEN];
    return Object.keys(nodes).filter(function(id) {
      return +id !== -1 &&
        nodes[id].get('checked') === CHECK_STATE_ALL;
    }).map(function(id) {
      return nodes[id];
    });
  },

  getCheckedIds: function(least, reducer) {
    if (least) {
      reducer || (reducer = function(node) {
        return node.id;
      });

      var node = this.getDataById(0, { least: true, check: 1 });

      if (node.checked === CHECK_STATE_ALL) {
        return [reducer(node)];
      }

      var checkedIds = [];

      var _walkChildren = function(children) {
        children && children.forEach(function(child) {
          if (child.checked === CHECK_STATE_ALL) {
            checkedIds.push(reducer(child));
          } else {
            _walkChildren(child.children);
          }
        })
      }

      _walkChildren(node.children);

      return checkedIds;
    }

    var nodes = this[RENDERED_NODES_TOKEN];
    return Object.keys(nodes).filter(function(id) {
      return +id !== -1 &&
        nodes[id].get('checked') === CHECK_STATE_ALL;
    });
  },

  getRealCheckedNode: function(){
    var parentNameArr = [];

    var reducer = function(node) {
      parentNameArr.push(node.name)
      return {
        id: node.id,
        name: parentNameArr.slice(0)
      }
    };

    var node = this.getDataById(0, { least: true, check: 1 });

    if (node.checked === CHECK_STATE_ALL) {
      return [reducer(node)];
    }
    var checkedIds = [];
    var _walkChildren = function(node) {
      parentNameArr.push(node.name)
      var children = node.children
      children && children.forEach(function(child) {
        if (child.checked === CHECK_STATE_ALL) {
          checkedIds.push(reducer(child));
          parentNameArr.pop()
        } else if (child.checked === CHECK_STATE_HAS) {
          _walkChildren(child);
        }
      })
      parentNameArr.pop()
    }

    _walkChildren(node);

    return checkedIds;
  },

  translate: function(node) {
    var keyMap = this.get('keyMap');

    if (Array.isArray(node)) {
      node.forEach(function(node) {
        Object.keys(keyMap).forEach(function(key) {
          if (keyMap[key] in node) {
            node[key] = node[keyMap[key]];
          }
        });
      });
    } else {
      Object.keys(keyMap).forEach(function(key) {
        if (keyMap[key] in node) {
          node[key] = node[keyMap[key]];
        }
      });
    }

    return node;
  },

  /**
   * 获取当前选中的节点（单选树）
   * @private
   * @return {TreeNode} 节点
   */
  _getCheckedNode: function() {
    return this[CHECKED_NODE_TOKEN];
  },

  /**
   * @private
   */
  _setCheckedNode: function(node) {
    this[CHECKED_NODE_TOKEN] = node;
  },

  /**
   * 获取当前选中的节点（单选树）
   * @private
   * @return {TreeNode} 节点
   */
  _getSelectedNode: function() {
    return this[SELECTED_NODE_TOKEN];
  },

  /**
   * @private
   */
  _setSelectedNode: function(node) {
    this[SELECTED_NODE_TOKEN] = node;
  }

});

module.exports = Tree;
