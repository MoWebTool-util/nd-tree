/**
 * @module: Tree
 * @author: crossjs <liwenfu@crossjs.com>
 */

'use strict';

var $ = require('jquery');

var Widget = require('nd-widget');
var Template = require('nd-template');

var CLS_HAS_CHILD = 'has-child';

var treeNode;

var makeId = function(pid, index) {
  return [pid, index].join('-');
};

var TreeNode = Widget.extend({

  Implements: [Template],

  attrs: {
    classPrefix: 'ui-tree-node',

    template: require('../templates/treenode.handlebars'),

    parent: null,
    id: null,
    name: null,
    opened: null,
    checked: null,
    children: null,

    data: {
      value: null,
      getter: function(/*val*/) {
        return {
          id: this.get('id'),
          name: this.get('name'),
          parent: this.get('parent'),
          // children: this.get('children')
          // 真实数据
          children: (function(children) {
            return Object.keys(children).map(function(id) {
              return children[id].get('data');
            });
          })(this.childNodes || {})
        };
      },
      setter: function(val) {
        Object.keys(val).forEach(function(key) {
          this.set(key, val[key]);
        }.bind(this));

        return this;
      }
    },

    hasChild: false,

    model: {},

    parentNode: null,
    insertInto: function(/*element, parentNode*/) {
      // do nothing here, use appendChild instead
      // parentNode.element.children('ul').append(element);
    }
  },

  _onRenderId: function(id) {
    this.element.attr('data-node-id', id);
  },

  _onRenderChildren: function(children) {
    if (children && children.length) {
      children.forEach(function(node, i) {
        node.parentNode = this;
        node.tree = this.get('tree');
        if (typeof node.parent === 'undefined') {
          node.parent = this.get('id');
        }
        if (typeof node.id === 'undefined') {
          node.id = makeId(node.parent, i);
        }
        this.insertChild(treeNode(node));
      }.bind(this));
    } else {
      this.set('hasChild', false);
    }
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
      parentNode = this.get('tree').getNode(this.get('parent'));

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
    this.childNodes = {};
  },

  setup: function() {
    var that = this;

    this.get('tree').before('destroy', function() {
      that.destroy();
    });
  },

  insertChild: function(child) {
    this.set('hasChild', true);
    this.childNodes[child.get('id')] = child;
  },

  removeChild: function(child) {
    this.childNodes && delete this.childNodes[child.get('id')];

    if (!this.hasChild()) {
      this.set('hasChild', false);
    }
  },

  getLevel: function() {
    return this.element.parents('li', '.ui-tree').length;
  },

  hasChild: function() {
    return this.childNodes && Object.keys(this.childNodes).length > 0;
  },

  children: function(filter) {
    var children = this.childNodes;

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
