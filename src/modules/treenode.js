/**
 * @module: Tree
 * @author: crossjs <liwenfu@crossjs.com> - 2015-4-22 13:05:11
 */

'use strict';

var $ = require('jquery');

var Widget = require('nd-widget');
var Template = require('nd-template');

var CLS_OPENED = 'opened';
var CLS_CHECKED = 'checked';
var CLS_HAS_CHILD = 'has-child';
var CLS_HAS_CHECKED = 'has-checked';
var CHECK_STATE_NONE = 0;
var CHECK_STATE_ALL = 1;
var CHECK_STATE_HAS = 2;
var DIRECTION_INSIDE = 1;
var DIRECTION_OUTSIDE = -1;

var treeNode;

var TreeNode = Widget.extend({

  Implements: [Template],

  attrs: {

    template: require('../templates/single.handlebars'),

    parent: null,
    id: null,
    name: null,
    opened: null,
    checked: null,

    hasChild: false,

    childNodes: {},

    model: {},

    insertInto: function(element, parentNode) {
      parentNode.element.children('ul').append(element);
    }
  },

  initAttrs: function(config) {
    TreeNode.superclass.initAttrs.call(this, config);

    var parent = this.get('parent');
    var parentNode;

    if (parent === -1) {
      parentNode = treeNode(this.get('parentNode'));
    } else {
      parentNode = treeNode('[data-node-id="' + parent + '"]');
      parentNode.addChild(this);
    }

    this.set('parentNode', parentNode);

    this.set('model', {
      parent: this.get('parent'),
      id: this.get('id'),
      name: this.get('name'),
      opened: this.get('opened'),
      checked: this.get('checked')
    });
  },

  _onChangeId: function(id) {
    this.element.data('node-id', id);
  },

  _onChangeName: function(name) {
    this.element.children('.name').text(name);
  },

  _onRenderOpened: function(opened) {
    this.toggleOpen(opened);
  },

  _onRenderChecked: function(checked) {
    this.toggleCheck(checked);
  },

  _onChangeParent: function(parent) {
    this.set('parentNode', treeNode('[data-node-id="' + parent + '"]'));
  },

  _onChangeParentNode: function(parentNode, originalParentNode) {
    originalParentNode.removeChild(this);

    parentNode.addChild(this);
    parentNode.appendNode(this);
  },

  _onChangeHasChild: function(hasChild) {
    this.element.toggleClass(CLS_HAS_CHILD, hasChild);
  },

  // setup: function() {
  // },

  initProps: function() {
    this.valid = this.element.length === 1;
  },

  addChild: function(child) {
    this.children()[child.get('id')] = child;

    this.set('hasChild', true);
  },

  removeChild: function(child) {
    delete this.children()[child.get('id')];

    if (!this.hasChild()) {
      this.set('hasChild', false);
    }
  },

  hasChild: function() {
    return Object.keys(this.children()).length > 0;
  },

  children: function(filter) {
    var children = this.get('childNodes');

    if (filter) {
      // 克隆，以避免误删
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
    var siblings = this.get('parentNode');

    if (!siblings || !siblings.children) {
      return {};
    }

    var thisId = this.get('id');

    siblings = siblings.children(function(id/*, node*/) {
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

  toggleOpen: function(toOpened) {
    // if (this.hasChild()) {
      this.element.toggleClass(CLS_OPENED, toOpened);
    // }
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

  toggleCheck: function(toChecked, direction) {
    if (!this.valid) {
      return;
    }

    if (typeof toChecked === 'undefined') {
      toChecked = this.isChecked() ? CHECK_STATE_NONE : CHECK_STATE_ALL;
    }

    this.setChecked(toChecked);

    // 向里
    if (typeof direction === 'undefined' || direction === DIRECTION_INSIDE) {
      // toggle children check state
      var children = this.children();
      Object.keys(children).forEach(function(id) {
        children[id].toggleCheck(toChecked, DIRECTION_INSIDE);
      });
    }

    // 向外
    if (typeof direction === 'undefined' || direction === DIRECTION_OUTSIDE) {
      if (toChecked === CHECK_STATE_ALL) {
        // 如果有未选中或半选
        if (Object.keys(this.siblings(function(id, node) {
            return !node.isChecked();
          })).length) {
          // 则半选
          toChecked = CHECK_STATE_HAS;
        }
      } else if (toChecked === CHECK_STATE_NONE) {
        // 如果有选中或半选
        if (Object.keys(this.siblings(function(id, node) {
            return node.hasChecked();
          })).length) {
          // 半选
          toChecked = CHECK_STATE_HAS;
        }
      }

      // toggle parent check state
      var parentNode = this.get('parentNode');
      if (parentNode && parentNode.toggleCheck) {
        parentNode.toggleCheck(toChecked, DIRECTION_OUTSIDE);
      }
    }
  },

  // 获取选中的子节点
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

  // 获取选中的子节点的 ID
  getCheckedIds: function(mode) {
    return Object.keys(this.getChecked(mode));
  },

  appendNode: function(node) {
    this.element.children('ul').append(node.element);
  },

  destroy: function() {
    if (this.parentNode && this.parentNode.removeChild) {
      this.parentNode.removeChild(this);
    }

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

  return Widget.query(node) ||
  // FOR .ui-tree
  {
    element: node
  };
};

module.exports = treeNode;
