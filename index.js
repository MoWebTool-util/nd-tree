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
        console.time('setter')
        var todos = this.translate(val);
        var node;

        // 缓存索引
        var flatList = this.get('flatList');

        // 最终数据
        var nodeList = [];

        function addChild(pid, nid, node) {
          // 统一加 children
          node.children || (node.children = []);

          // 缓存，方便快速索引
          flatList[nid] = node;

          if (pid) {
            if (pid in flatList) {
              flatList[pid].children.push(node);
            } else {
              todos.push(node);
            }
          } else {
            nodeList.push(node);
          }
        }

        while ((node = todos.shift())) {
          addChild(node.parent, node.id, node);
        }

        console.timeEnd('setter')

        return nodeList;
      }
    },

    checkable: true,
    multiple: true,
    opened: true,
    checked: true,
    // tree, branch
    checkScope: 'tree',

    //过滤数据
    outFilter: function(data) {
      return data;
    }

  },

  events: {},

  initAttrs: function(config) {
    Tree.superclass.initAttrs.call(this, config);

    var checkable = this.get('checkable');

    if (!checkable) {
      this.set('multiple', false);
    }

    this.set('model', {
      checkable: this.get('checkable'),
      multiple: this.get('multiple')
    });
  },

  setup: function() {
    this.set('params', this.get('mode') ? {
      size: 10000,
      page: 0
    } : {
      $limit: 10000,
      $offset: 0
    });

    if (!this.get('proxy')) {
      console.error('请设置数据源（proxy）');
    }

    if (this.get('autoload')) {
      // 取列表
      this.getList();
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

    var items = treeData.items,
      // uniqueId,
      nodeList;

    if (items && items.length) {
      // uniqueId = this.get('uniqueId');
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

    if (!this.treeRoot) {
      this.renderRoot();
    }

    this.renderPartial(nodeList);
  },

  renderRoot: function() {
    this.treeRoot = treeNode({
      classPrefix: this.get('classPrefix'),
      parent: -1,
      id: 0,
      name: this.get('treeName'),
      opened: this.get('opened'),
      checked: this.get('checked'),
      parentNode: this.element
    });
  },

  renderNode: function(data) {
    var node = treeNode($.extend({
      classPrefix: this.get('classPrefix')
    }, data));

    this.trigger('renderNode', node);

    var that = this;

    if (data.children && data.children.length) {
      data.children.forEach(function(node) {
        that.renderNode(node);
      });
    }
  },

  renderPartial: function(nodeList) {
    this._renderPartial(nodeList);
  },

  _renderPartial: function(nodeList) {
    console.time('renderPartial')

    nodeList || (nodeList = this.get('nodeList'));

    var that = this;

    nodeList.forEach(function(node) {
      that.renderNode(node);
    });

    console.timeEnd('renderPartial')
  },

  addNodeAction: function(options, index) {
    var nodeActions = this.get('nodeActions');

    if (typeof index === 'undefined') {
      nodeActions.push(options);
    } else {
      nodeActions.splice(index, 0, options);
    }
  },

  getNode: function(id) {
    return treeNode(this.$('[data-node-id="' + id + '"]'));
  },

  getData: function(id) {
    var flatList = this.get('flatList');

    return id ? flatList[id] : flatList;
  },

  setData: function(id, data) {
    if (typeof data === 'undefined') {
      data = id;
      id = data.id;
    }

    var flatList = this.get('flatList');

    if (data === null) {
      delete flatList[id];
    } else {
      flatList[id] = data;
    }
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

  resortNode: function(data) {
    data = this.translate(data);

    var id = data.id;
    var originalData = this.getData(id);

    $.extend(originalData, data);

    this.getNode(id).set('parent', originalData.parent);
  },

  modifyNode: function(data) {
    data = this.translate(data);

    var id = data.id;
    var originalData = this.getData(id);

    $.extend(originalData, data);

    this.getNode(id).set('name', originalData.name);
  },

  deleteNode: function(id) {
    var data = this.getData(id);
    var parentData = this.getData(data.parent);

    if (parentData) {
      // 从 nodeList 中移除
      parentData.children.some(function(child, i) {
        if (child === data) {
          parentData.children.splice(i, 1);
          return true;
        }
      });
    }

    // 从 flatList 中移除
    this.setData(id, null);

    // 从 DOM 中移除
    this.getNode(id).destroy();
  },

  insertNode: function(data) {
    data = this.translate(data);

    var id = data.id;
    var parent = data.parent;
    var parentData = this.getData(parent);

    if (!parentData) {
      return console.error('父节点不存在');
    }

    data.children || (data.children = []);

    // 保存到 nodeList
    parentData.children.push(data);

    // 保存到 flatList
    this.setData(id, data);

    // 生成 node
    this.renderNode(data);
  }

});

module.exports = Tree;
