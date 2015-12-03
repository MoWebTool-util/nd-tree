/**
 * @module Tree
 * @author crossjs <liwenfu@crossjs.com>
 */

'use strict';

var $ = require('jquery');

var Widget = require('nd-widget');
var Template = require('nd-template');

var enums = require('./enums');

var CHILDREN_STATE_TOKEN = '__CHILDREN_STATE';
// var SELECTED_ELEMENT_TOKEN = '__SELECTED_ELEMENT';

var CHILDREN_IS_LOADING = 1;
var CHILDREN_IS_LOADED = 2;

var CLS_HAS_CHILD = 'has-child';
var CLS_OPENED = 'opened';
var CLS_SELECTED = 'selected';
var CLS_HOVERING = 'hovering';
var CLS_CHECKED = 'checked';
var CLS_HAS_CHECKED = 'has-checked';

var CHECK_STATE_NONE = enums.CHECK_STATE_NONE;
var CHECK_STATE_ALL = enums.CHECK_STATE_ALL;
var CHECK_STATE_HAS = enums.CHECK_STATE_HAS;

var treeNode;

var makeId = function(pid, index) {
  return [pid, index].join('-');
};

var TreeNode = Widget.extend({

  Implements: [Template],

  attrs: {
    classPrefix: 'ui-tree-node',

    template: require('./treenode.handlebars'),

    parent: null,
    id: null,
    name: null,
    opened: null,
    selected: null,
    checked: {
      value: null,
      setter: function(val) {
        return +val;
      }
    },
    checkable: null,
    multiple: null,
    children: null,

    data: {
      value: null,
      getter: function(val, key, options) {
        var data = {
          id: this.get('id'),
          name: this.get('name'),
          parent: this.get('parent'),
          opened: this.get('opened'),
          checked: this.get('checked')
        };

        if (options && options.least &&
            data.checked === CHECK_STATE_ALL) {
          return data;
        }

        if (options && options.check) {
          if (data.checked === CHECK_STATE_NONE) {
            return data;
          }

          data.children = (function(children) {
            return Object.keys(children).filter(function(id) {
              return children[id].get('checked') !== CHECK_STATE_NONE;
            }).map(function(id) {
              return children[id].get('data', options);
            });
          })(this.children());

          return data;
        }

        data.children = (function(children) {
          return Object.keys(children).map(function(id) {
            return children[id].get('data', options);
          });
        })(this.children());

        return data;
      },
      setter: function(val) {
        Object.keys(val).forEach(function(key) {
          this.set(key, val[key]);
        }, this);

        return this;
      }
    },

    hasChild: false,

    model: {},

    parentNode: null,
    insertInto: function( /*element, parentNode*/ ) {
      // do nothing here, use appendChild instead
      // parentNode.element.children('ul').append(element);
    }
  },

  events: {
    'mouseover': function(e) {
      e.stopPropagation();

      this.element.addClass(CLS_HOVERING);
    },
    'mouseout': function(e) {
      e.stopPropagation();

      this.element.removeClass(CLS_HOVERING);
    },
    'click .name': function(e) {
      e.stopPropagation();

      this.set('selected', true);
    },
    'click .toggle': function(e) {
      e.stopPropagation();

      this.set('opened', !this.get('opened'));
    },
    'click .choose': function(e) {
      e.stopPropagation();

      // 多选：切换
      // 单选：永远都是选中
      this.set('checked', this.get('multiple') ? this.get('checked') !== CHECK_STATE_ALL : CHECK_STATE_ALL);
    }
  },

  initAttrs: function(config) {
    // copy from parent
    ['async', 'tree', 'foldable', 'checkable', 'multiple']
    .forEach(function(key) {
      if (!config.hasOwnProperty(key)) {
        config[key] = config.parentNode.get(key);
      }
    });

    // 异步树，特殊处理
    if (config.async && typeof config.children === 'undefined') {
      config.children = [];
    }

    // 不可折叠，默认展开
    if (!config.foldable && typeof config.opened === 'undefined') {
      config.opened = true;
    }

    // 可选，多选情况下，默认选中
    if (config.checkable && typeof config.checked === 'undefined') {
      config.checked = config.multiple ? config.parentNode.get('checked') : CHECK_STATE_NONE;
    }

    TreeNode.superclass.initAttrs.call(this, config);

    this.set('model', {
      foldable: this.get('foldable'),
      checkable: this.get('checkable'),
      multiple: this.get('multiple')
    });
  },

  /**
   * 选中
   * @return {Boolean} 是否选中
   */
  isChecked: function() {
    return this.element.hasClass(CLS_CHECKED);
  },

  /**
   * 选中或包含选中的子节点
   * @return {Boolean} 是否选中
   */
  hasChecked: function() {
    // 全选或者半选，都算有选中
    return this.isChecked() || this.element.hasClass(CLS_HAS_CHECKED);
  },

  _onRenderSelected: function(selected) {
    this.element.toggleClass(CLS_SELECTED, selected);

    // 打开节点，自动获取子节点
    if (selected) {
      var tree = this.get('tree');
      var selectedNode = tree._getSelectedNode();
      if (selectedNode) {
        selectedNode.set('selected', false);
      }
      tree._setSelectedNode(this);
    }
  },

  // _onChangeCheckable: function(checkable) {
  //   this.element.toggleClass(this.get('classPrefix') + '-checkable', checkable);
  // },

  _onRenderOpened: function(opened) {
    this.element.toggleClass(CLS_OPENED, opened);

    // 打开节点，自动获取子节点
    if (opened) {
      this._getChildDataList();
    }
  },

  _getChildDataList: function() {
    var tree = this.get('tree');

    // 同步状态存到树
    if (!this.get('async')) {
      if (!tree[CHILDREN_STATE_TOKEN]) {
        tree[CHILDREN_STATE_TOKEN] = CHILDREN_IS_LOADING;

        tree.getDataList(this.get('id'), function(hasChild) {
          tree[CHILDREN_STATE_TOKEN] = CHILDREN_IS_LOADED;

          this.set('hasChild', hasChild);
        }.bind(this));
      } else {
        var children = this.get('children');
        this.set('hasChild', !!(children && children.length));
      }
      return;
    }

    // 异步状态存到节点
    if (!this[CHILDREN_STATE_TOKEN]) {
      this[CHILDREN_STATE_TOKEN] = CHILDREN_IS_LOADING;

      tree.getDataList(this.get('id'), function(hasChild) {
        this[CHILDREN_STATE_TOKEN] = CHILDREN_IS_LOADED;

        this.set('hasChild', hasChild);
      }.bind(this));
    }
  },

  _setCheckClasses: function(checked) {
    if (checked === CHECK_STATE_ALL) {
      this.element.removeClass(CLS_HAS_CHECKED);
      this.element.addClass(CLS_CHECKED);
    } else if (checked === CHECK_STATE_NONE) {
      this.element.removeClass(CLS_HAS_CHECKED);
      this.element.removeClass(CLS_CHECKED);
    } else {
      this.element.removeClass(CLS_CHECKED);
      this.element.addClass(CLS_HAS_CHECKED);
    }
  },

  _isAncestorOf: function(node) {
    while ((node instanceof TreeNode) &&
      (node = node.get('parentNode'))) {
      if (node === this) {
        return true;
      }
    }

    return false;
  },

  _isDescendantOf: function(node) {
    var parentNode = this;
    while ((parentNode instanceof TreeNode) &&
      (parentNode = parentNode.get('parentNode'))) {
      if (parentNode === node) {
        return true;
      }
    }

    return false;
  },

  _onRenderChecked: function(checked) {
    this._setCheckClasses(checked);

    var multiple = this.get('multiple');

    if (!multiple) {
      if (checked === CHECK_STATE_ALL) {
        var tree = this.get('tree');
        var checkedNode = tree._getCheckedNode();
        tree._setCheckedNode(this);

        if (
          // 前一个选中节点
          checkedNode &&
          // 非当前
          checkedNode !== this &&
          // 非当前的后代
          !this._isAncestorOf(checkedNode) &&
          // 非当前的父辈
          !this._isDescendantOf(checkedNode)
        ) {
          checkedNode.set('checked', CHECK_STATE_NONE);
        }
      }
    }

    // 向外
    var parentNode = this.get('parentNode');
    if (multiple || this.get('tree')._getCheckedNode() !== parentNode) {
      parentNode._checkChecked && parentNode._checkChecked(checked);
    }

    // 自动打开
    if (checked === CHECK_STATE_ALL) {
      if (!this.get('opened')) {
        this.set('opened', true);
      }
    }

    // 向内：
    // 只处理非半选，因为半选子节点无变更
    if (checked !== CHECK_STATE_HAS) {
      // 单选子节点设置为未选中
      this.get('multiple') || (checked = CHECK_STATE_NONE);

      // use filter to traverse children
      this.children(function(id, child) {
        child.set('checked', checked);
      });
    }
  },

  /**
   * 检查选中状态
   * @param  {Number} someChildCheckState 传入的子节点的选中状态
   */
  _checkChecked: function(someChildCheckState) {
    // 单选的情况
    var multiple = this.get('multiple');

    // 默认半选
    var checked = CHECK_STATE_HAS;

    // 有未选中的子节点
    var hasUncheckedChild;

    // 有选中的子节点
    var hasCheckedChild;

    switch (someChildCheckState) {
      // 有选中的子节点
      case CHECK_STATE_ALL:
        hasUncheckedChild = multiple ?
          !!Object.keys(this.children(function(id, child) {
            return !child.isChecked();
          })).length : true;

        checked = hasUncheckedChild ? CHECK_STATE_HAS : CHECK_STATE_ALL;
        break;
        // case CHECK_STATE_HAS:
        //   checked = CHECK_STATE_HAS;
        //   break;
      case CHECK_STATE_NONE:
        hasCheckedChild = !!Object.keys(this.children(function(id, child) {
          return child.hasChecked();
        })).length;

        checked = hasCheckedChild ? CHECK_STATE_HAS : CHECK_STATE_NONE;
        break;
    }

    this.set('checked', checked);
  },

  _onRenderId: function(id) {
    this.element.attr('data-node-id', id);
  },

  _onRenderChildren: function(children) {
    if (children && children.length) {
      children.forEach(function(node, i) {
        node.tree = this.get('tree');
        node.parentNode = this;
        if (typeof node.parent === 'undefined') {
          node.parent = this.get('id');
        }
        if (typeof node.id === 'undefined') {
          node.id = makeId(node.parent, i);
        }
        // if (typeof node.opened === 'undefined') {
        //   node.opened = this.get('opened');
        // }
        if (typeof node.foldable === 'undefined') {
          node.foldable = this.get('foldable');
        }
        if (typeof node.checkable === 'undefined') {
          node.checkable = this.get('checkable');
        }
        if (typeof node.multiple === 'undefined') {
          node.multiple = this.get('multiple');
        }
        if (node.checkable && typeof node.checked === 'undefined') {
          node.checked = node.multiple ? this.get('checked') : CHECK_STATE_NONE;
        }
        this.insertChild(treeNode(node));
      }, this);
    }

    this.set('hasChild', !!children);
  },

  _onRenderHasChild: function(hasChild) {
    this.element.toggleClass(CLS_HAS_CHILD, hasChild);
  },

  _onRenderName: function(name) {
    this.element.attr('data-node-name', name);
    this.element.children('.name').text(name);
  },

  _onRenderParent: function(parent) {
    var parentNode;

    if (parent === -1) {
      parentNode = this.get('tree');
    } else {
      parentNode = this.get('tree').getNodeById(this.get('parent'));

      if (!this.get('id')) {
        this.set('id', makeId(parentNode.get('id'), Object.keys(parentNode.childNodes).length));
      }
    }

    this.set('parentNode', parentNode);
  },

  _onRenderParentNode: function(parentNode, originalParentNode) {
    if (originalParentNode) {
      originalParentNode.removeChild(this);
    }

    parentNode.insertChild && parentNode.insertChild(this);
    parentNode.appendChild && parentNode.appendChild(this);
  },

  initProps: function() {
    this._childNodes = {};
  },

  setup: function() {
    var that = this;

    // dispatch all events
    that.on('all', function() {
      /**
       * @event Tree#nodeChanged
       */
      that.get('tree').trigger('nodeChanged', arguments[1], arguments[2], arguments[3], that);
    });

    that.get('tree').before('destroy', function() {
      that.destroy();
    });
  },

  insertChild: function(child) {
    this.set('hasChild', true);
    this._childNodes[child.get('id')] = child;
  },

  removeChild: function(child) {
    this._childNodes && delete this._childNodes[child.get('id')];

    if (!this.hasChild()) {
      this.set('hasChild', false);
    }
  },

  getLevel: function() {
    return this.element.parents('li', '.ui-tree').length;
  },

  hasChild: function() {
    return this._childNodes && Object.keys(this._childNodes).length > 0;
  },

  children: function(filter) {
    var children = this._childNodes;

    if (filter) {
      // 克隆，以免误删
      children = $.extend({}, children);

      Object.keys(children).forEach(function(id) {
        if (!filter(id, children[id])) {
          delete children[id];
        }
      });
    }

    return children;
  },

  siblings: function(filter) {
    var parentNode = this.get('parentNode');

    if (!parentNode || !parentNode.children) {
      return {};
    }

    var thisId = this.get('id');

    var siblings = parentNode.children(function(id) {
      return id !== thisId;
    });

    // 克隆，以避免误删
    siblings = $.extend({}, siblings);

    if (filter) {
      Object.keys(siblings).forEach(function(id) {
        if (!filter(id, siblings[id])) {
          delete siblings[id];
        }
      });
    }

    return siblings;
  },

  appendChild: function(node) {
    this.element.children('ul').append(node.element);
  },

  destroy: function() {
    var parentNode = this.get('parentNode');
    parentNode && parentNode.removeChild(this);

    TreeNode.superclass.destroy.call(this);
  }
});

treeNode = function(node) {
  if (!node) {
    return;
  }

  if (node instanceof TreeNode) {
    return node;
  }

  // json
  if ($.isPlainObject(node)) {
    return new TreeNode(node).render();
  }

  node = $(node);

  if (!node.length) {
    return;
  }

  var _node = Widget.query(node);

  if (_node && _node instanceof TreeNode) {
    return _node;
  }

  // FOR .ui-tree
  return {
    element: node,
    _isRoot: true
  };
};

// extend prototypes
treeNode.extend = function(items) {
  TreeNode.implement(items);
};

module.exports = treeNode;
