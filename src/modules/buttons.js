/**
 * @module: Tree
 * @author: crossjs <liwenfu@crossjs.com> - 2015-4-22 13:05:11
 */

'use strict';

var Widget = require('nd-widget');
var Template = require('nd-template');

var Button = Widget.extend({

  Implements: [Template],

  attrs: {

    classPrefix: 'buttons',

    template: require('../templates/button.handlebars'),
    buttons: null,

    visible: false

  },

  initAttrs: function(config) {
    Button.superclass.initAttrs.call(this, config);

    this.set('model', {
      'buttons': this.get('buttons')
    });
  }

});

module.exports = Button;
