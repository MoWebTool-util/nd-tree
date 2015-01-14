/**
 * Description: index.js
 * Author: lzhengms <lzhengms@gmail.com>
 * Date: 2015-01-13 11:24:44
 */

'use strict';

var Tree;
var $ = require('jquery');
var compile = require('./src/tpl/dept.handlebars');


$(document).on('click', '[data-action="toggle-org"]', function (e) {
  var xNode = $(e.target).closest('[data-role="user"]');
  if (xNode.length) {
    return;
  }
  var node = $(e.target).closest('[data-action="toggle-org"]');
  node.toggleClass('active');
  node.siblings('[data-action="toggle-org"]').each(function () {
    //兄弟节点折叠，该兄弟节点下的所有也都折叠
    $(this).removeClass('active');
    $(this).find('.org').removeClass('active');
  });
  return false;
});

Tree = function (config) {
  return this.init(config);
};

Tree.prototype.init = function (config) {
  this.normalize(config);
  this.id = config.id;//部门id
  this.name = config.name;//部门名称
  this.parentId = config.parentId || 0;//父部门的id
  this.unreadHtml = '';
  this.readHtml = '';
  this.read = config.read || 0;//该部门中已查阅公告的人数
  this.unread = config.unread || 0;//该部门中未查阅公告的人数
  this.sub = config.sub || [];//该部门下的子部门集合
  this.parseSubDepts(config);
};

Tree.prototype.normalize = function (config) {
  config.depth = config.depth || 1;
  config.sub = config.sub || [];
};

Tree.prototype.parseSubDepts = function (config) {
  config.subUnreadHTML = '';
  config.subReadHTML = '';
  if (this.sub.length) {
    $.each(this.sub, function (index, sub) {
      sub.depth = config.depth + 1;
      var o = new Tree(sub);
      config.subUnreadHTML += o.unreadHtml;
      config.subReadHTML += o.readHtml;
    });
  }
  var unreadModel = $.extend(config, {isunread: true});
  var readModel = $.extend(config, {isunread: false});
  var unreadHtml = compile(unreadModel);
  var readHtml = compile(readModel);
  this.unreadHtml = unreadHtml;
  this.readHtml = readHtml;
};


module.exports = Tree;
