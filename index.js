/**
 * Description: Tree
 * Author: liwenfu <liwenfu@crossjs.com>
 * Date: 2015-4-22 13:05:11
 */

'use strict';

var $ = require('jquery');

var Alert = require('nd-alert');
var Widget = require('nd-widget');
var Template = require('nd-template');

var treeNode = require('./src/modules/treenode');

var Tree = Widget.extend({

  Implements: [Template],

  Plugins: require('./src/plugins'),

  attrs: {

    classPrefix: 'ui-tree',
    template: require('./src/templates/tree.handlebars'),

    // keyMap: {
    //   id: 'node_id',
    //   name: 'node_name',
    //   parent: 'parent_id'
    // },

    treeName: '根节点',

    // 行处理
    nodeActions: [],

    // proxy: null,

    // 0: mysql or 1: mongodb
    mode: 0,

    params: {
      $count: true
    },

    autoload: true,

    // 服务端返回的原始数据
    treeData: null,

    flatList: {},

    // 解析后的数据列表
    nodeList: {
      value: null,
      setter: function(val /*, key*/ ) {
        var todos = (!val || val.hacked) ? [] : this.translate(val);
        var node;

        // 缓存索引
        var flatList = this.get('flatList');

        // 最终数据
        var nodeList = [];

        function addChild(node) {
          // 统一加 children
          node.children || (node.children = []);

          // 缓存，方便快速索引
          flatList[node.id] = node;

          if (node.parent) {
            if (node.parent in flatList) {
              flatList[node.parent].children.push(node);
            } else {
              todos.push(node);
            }
          } else {
            // top level branches
            nodeList.push(node);
          }
        }

        while ((node = todos.shift())) {
          addChild(node);
        }

        return nodeList;
      }
    },

    foldable: false,
    checkable: false,
    multiple: true,
    editable: false,
    sortable: false,
    opened: true,
    checked: false,
    // tree, branch
    // checkScope: 'tree',

    pluginCfg: {
      fold: {},
      check: {},
      crud: {},
      // save: {},
      editNode: {},
      delNode: {},
      addNode: {},
      dndSort: {}
    },

    //过滤数据
    outFilter: function(data) {
      return data;
    }

  },

  // events: {},

  initAttrs: function(config) {
    Tree.superclass.initAttrs.call(this, config);

    var checkable = this.get('checkable');

    if (!checkable) {
      this.set('multiple', false);
    }

    this.set('model', {
      foldable: this.get('foldable'),
      checkable: checkable,
      multiple: this.get('multiple')
    });
  },

  initPlugins: function() {
    var pluginCfg = this.get('pluginCfg');

    pluginCfg.check.disabled = !this.get('checkable');
    pluginCfg.fold.disabled = !this.get('foldable');

    pluginCfg.crud.disabled =
      pluginCfg.editNode.disabled =
      pluginCfg.delNode.disabled =
      pluginCfg.addNode.disabled = !this.get('editable');

    pluginCfg.dndSort.disabled = !this.get('sortable');

    Tree.superclass.initPlugins.call(this);
  },

  setup: function() {
    var params;

    switch (this.get('mode')) {
      case 2:
        params = {};
        break;
      case 1:
        params = {
          size: 10,
          page: 0
        };
        break;
      default:
        params = {
          $limit: 10,
          $offset: 0
        };
    }

    this.set('params', $.extend(params, this.get('params')));

    this.set('params', this.get('mode') ? {
      size: 10000,
      page: 0
    } : {
      $limit: 10000,
      $offset: 0
    });

    var proxy = this.get('proxy');

    if (!proxy) {
      console.error('请设置数据源（proxy）');
    } else {
      ['LIST', 'GET', 'PUT', 'PATCH', 'POST', 'DELETE']
      .forEach(function(method) {
        proxy[method] && (this[method] = proxy[method].bind(proxy));
      }, this);
    }

    if (this.get('autoload')) {
      // 取列表
      this.getList();
    }
  },

  getList: function(options) {
    var that = this;

    if (options) {
      if (options.data) {
        this.set('params', options.data);
      }
    } else {
      options = {};
    }

    var params = options.data = $.extend({}, this.get('params'));

    Object.keys(params).forEach(function(key) {
      // 空字符串不提交查询
      if (params[key] === '') {
        delete params[key];
      }
    });

    this.LIST(options)
      .done(function(data) {
        // offset 溢出
        if (data.count && !data.items.length) {
          // 到最后一页
          that.getList({
            data: that.get('mode') ? {
              page: (Math.ceil(data.count / params.size) - 1)
            } : {
              $offset: (Math.ceil(data.count / params.$limit) - 1) * params.$limit
            }
          });
        } else {
          that.set('treeData', data);
        }
      })
      .fail(function(error) {
        Alert.show(error);
      });
  },

  _onRenderTreeData: function(treeData) {
    // 保存原始数据
    this.set('originData', treeData);

    // 拷贝一份数据给 filter
    treeData = this.get('outFilter').call(this, $.extend(true, {}, treeData));

    var items = treeData.items;
    var nodeList;

    if (items && items.length) {
      nodeList = items;
    } else {
      nodeList = [0];

      // 强制无数据时列表刷新
      nodeList.hacked = true;
    }

    this.set('nodeList', nodeList);
  },

  _onRenderNodeList: function(nodeList) {
    if (nodeList.hacked) {
      // 重置
      nodeList = [];
      // 回设
      this.set('nodeList', nodeList, {
        silent: true
      });
    }

    this.renderTree(nodeList);
  },

  renderTree: function(nodeList) {
    if (typeof nodeList === 'undefined') {
      nodeList = this.get('nodeList');
    }

    if (nodeList) {
      this.treeRoot = this.renderNode({
        parent: -1,
        id: 0,
        name: this.get('treeName'),
        opened: this.get('opened'),
        checked: this.get('checked'),
        children: nodeList,
        tree: this
      });
    }
  },

  renderNode: function(data) {
    data.tree = this;

    if (!data.children) {
      data.children = [];
    }

    return treeNode(data);
  },

  appendChild: function(node) {
    this.element.children('ul').append(node.element);
  },

  removeChild: function(node) {
    node.element.remove();
  },

  getNode: function(id) {
    return treeNode(this.$('[data-node-id="' + id + '"]'));
  },

  getData: function() {
    return this.treeRoot.get('data');
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

  modifyNode: function(data) {
    this.getNode(data.id).set('data', this.translate(data));
  },

  deleteNode: function(id) {
    this.getNode(id).destroy();
  },

  insertNode: function(data) {
    this.renderNode(this.translate(data));
  },

  addNodeAction: function(options, index) {
    var nodeActions = this.get('nodeActions');

    if (typeof index === 'undefined') {
      nodeActions.push(options);
    } else {
      nodeActions.splice(index, 0, options);
    }
  },

  LIST: function() {
    var proxy = this.get('proxy');
    return proxy.LIST.apply(proxy, arguments);
  },

  GET: function() {
    var proxy = this.get('proxy');
    return proxy.GET.apply(proxy, arguments);
  },

  PUT: function() {
    var proxy = this.get('proxy');
    return proxy.PUT.apply(proxy, arguments);
  },

  PATCH: function() {
    var proxy = this.get('proxy');
    return proxy.PATCH.apply(proxy, arguments);
  },

  POST: function() {
    var proxy = this.get('proxy');
    return proxy.POST.apply(proxy, arguments);
  },

  DELETE: function() {
    var proxy = this.get('proxy');
    return proxy.DELETE.apply(proxy, arguments);
  }

});

module.exports = Tree;
