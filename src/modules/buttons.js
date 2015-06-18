/**
 * @module: Tree
 * @author: crossjs <liwenfu@crossjs.com>
 */

'use strict';

var Widget = require('nd-widget');
var Template = require('nd-template');

var Button = Widget.extend({

  Implements: [Template],

  attrs: {

    classPrefix: 'buttons',

    template: require('../templates/buttons.handlebars'),
    buttons: null,

    visible: false

  },

  initAttrs: function(config) {
    Button.superclass.initAttrs.call(this, config);

    this.set('model', {
      'buttons': this.get('buttons')
    });
  },

  useTo: function(node) {
    this.$('[data-role="edit-node"], [data-role="del-node"]')
        .toggle(node.get('id') !== 0);

    this.element.insertAfter(node.element.children('.name'));
  }

});

module.exports = Button;
