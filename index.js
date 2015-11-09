/**
 * @module Tree
 * @author crossjs <liwenfu@crossjs.com>
 */

'use strict';

var Widget = require('nd-widget');
var Template = require('nd-template');

var treeNode = require('./src/treenode');

var enums = require('./src/enums');

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

    treeName: '根节点',

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
    checked: false,
    iconShow: false
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
      id: 0,
      name: this.get('treeName'),
      icon: this.get('treeIcon'),
      opened: this.get('opened'),
      checked: this.get('checked'),
      foldable: this.get('foldable'),
      checkable: this.get('checkable'),
      multiple: this.get('multiple'),
      iconShow: this.get('iconShow'),
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
  /**
   * 删除某个节点下的某个子节点。如果不传child，删除全部子节点。
   * @param  {node} node
   * @param  {node} child
   * @return
   */
  removeChild: function(node, child) {
    var children = node.children(function(id) {
      return child ? (child.get('id') === id ? true : false) : true;
    });
    Object.keys(children).forEach(function(i) {
      this.removeNode(children[i]);
    }.bind(this));
  },
  removeNode: function(node) {
    node.destroy();
  },

  getNodeById: function(id) {
    if (!this[RENDERED_NODES_TOKEN][id]) {
      this[RENDERED_NODES_TOKEN][id] = treeNode(this.$('[data-node-id="' + id + '"]'));
    }

    return this[RENDERED_NODES_TOKEN][id];
  },

  getDataById: function(id) {
    if (id > 0) {
      return this.getNodeById(id).get('data');
    }

    return this.treeRoot.get('data');
  },

  getCheckedNodes: function() {
    var nodes = this[RENDERED_NODES_TOKEN];
    return Object.keys(nodes).filter(function(id) {
      return +id !== -1 &&
        nodes[id].get('checked') === enums.CHECK_STATE_ALL;
    }).map(function(id) {
      return nodes[id];
    });
  },

  getCheckedIds: function() {
    var nodes = this[RENDERED_NODES_TOKEN];
    return Object.keys(nodes).filter(function(id) {
      return +id !== -1 &&
        nodes[id].get('checked') === enums.CHECK_STATE_ALL;
    });
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
  },
  /**
   * @private
   */
  _removeRenderedNode: function(node) {
    var id = node.get('id');
    if (this[RENDERED_NODES_TOKEN][id]) {
      delete this[RENDERED_NODES_TOKEN][id];
    }
  }
});

module.exports = Tree;
