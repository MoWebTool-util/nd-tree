/**
 * Description: index.js
 * Author: lzhengms <lzhengms@gmail.com>
 * Date: 2015-01-13 11:24:44
 */

'use strict';

var Tree;
var $ = require('jquery');
var ndEvents = require('nd-events');
var config=require('./src/settings');
var tools=require('./src/tools');
var htmlHandler=require('./src/nodeHandler');
var nodesHandler=require('./src/generatorTree');
var initEventHandler=require('./src/initEvent');
var checkNodeHandler=require('./src/triggerCheck');
var _settings=config._settings;

//Tree
var Tree;
Tree = function (settings, data) {
  ndEvents.mixTo(Tree);
  return this.init(settings, data);
};
Tree.prototype.init = function (settings, data) {
  settings = $.extend(true, _settings, settings);
  settings.container = _settings.container = $(settings.containerId);
  settings.container.empty();
  settings.self = this;
  this.settings = settings;
  this.selectedNodeList = [];
  this.set(data);
  initEventHandler.bindEvent(settings);
  initEventHandler.bindDomEvent(settings);
};
Tree.prototype.set = function (data, defaultDataFormat) {
  data = data ? ($.isArray(data) ? data : []) : [];
  if (typeof defaultDataFormat !== 'undefined') {
    this.settings.defaultDataFormat = defaultDataFormat;
  }
  if (!this.settings.defaultDataFormat) {
    data = tools.normalizeTree(this.settings, data);
  }
  this.selectedNodeList = [];
  //生成树
  nodesHandler.generatorTree(this.settings, 1, data);
};
Tree.prototype.getCheckTheme = function () {
  return htmlHandler.checkCls(this.settings);
};
Tree.prototype.getSelectedList = function () {
  return this.selectedNodeList;
};
Tree.prototype.pushNodeToSelectedList = function (ids, parentNode) {
  if($.isArray(ids)){
    //数组的id['1','2','3']
    $.each(ids,function(key,id){
      checkNodeHandler.pushOrDelForArr(checkNodeHandler.getObj(id), this.selectedNodeList, 'push', this.settings, parentNode);
    });
  }else if(typeof ids==='string'){
    //字符串的id'123'
    checkNodeHandler.pushOrDelForArr(checkNodeHandler.getObj(ids),this.selectedNodeList, 'push', this.settings, parentNode);
  }else{
    //object对象{id:id}
    checkNodeHandler.pushOrDelForArr(ids,this.selectedNodeList, 'push', this.settings, parentNode);
  }
  this.trigger('pushList',this.selectedNodeList);
};
Tree.prototype.spliceNodeFromSelectedList = function (ids,parentNode) {
  if($.isArray(ids)){
    //数组的id['1','2','3']
    $.each(ids,function(key,id){
      checkNodeHandler.pushOrDelForArr(checkNodeHandler.getObj(id), this.selectedNodeList, 'splice', this.settings, parentNode);
    });
  }else if(typeof ids==='string'){
    //字符串的id'123'
    checkNodeHandler.pushOrDelForArr(checkNodeHandler.getObj(ids),this.selectedNodeList, 'splice', this.settings, parentNode);
  }else{
    //object对象{id:id}
    checkNodeHandler.pushOrDelForArr(ids,this.selectedNodeList, 'splice', this.settings, parentNode);
  }
  this.trigger('spliceList',this.selectedNodeList);
};
Tree.changeNodeList = checkNodeHandler;
module.exports = Tree;
