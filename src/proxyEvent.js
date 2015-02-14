'use strict';
var $=require('jquery');
var tools=require('./tools');
var triggerEvent=require('./triggerEvent');
var config=require('./settings');
var _const=config._const;


function expandCollapse(param) {
  if (param.isOpen !== 'true') {
    //点击的文本是关闭状态
    triggerEvent.expandNode(param.event, param.node);
  } else {
    //点击的文本已是展开状态
    triggerEvent.collapseNode(param.event, param.node);
  }

}

module.exports=function(event){
  var target = event.target, $target = $(target), settings = event.data.settings, o = settings.self;
//, dblClickExpand = settings.dblClickExpand;
  var node = $target.closest('[data-role="toggle-node"]');
  var isCheckNode = $target.attr('data-role') === 'check-node';//check节点
  var isSubLevels = $target.attr('data-role') === 'sub-levels';
  var isSubOthers = $target.attr('data-role') === 'sub-others' || $target.closest('[data-role="sub-others"]').length > 0;
  var isOpen = node.attr('data-open');
  var isParent = node.attr('data-parent');
  var param = {isCheckNode: isCheckNode, event: event, node: node, isOpen: isOpen};
  switch (event.type) {
    case 'click':
      if (o.trigger(tools.eventName(_const.id.BEFORE, _const.events.CLICK), event, node)) {
        if (param.isCheckNode) {
          triggerEvent.checkNode(param.event, param.node);
        } else {
          if (isParent !== 'true' || isSubLevels || isSubOthers) {
            return;
          }
          expandCollapse(param);
        }
        o.trigger(tools.eventName(_const.id.ON, _const.events.CLICK), event, node);
        o.trigger(tools.eventName(_const.id.AFTER, _const.events.CLICK), event, node);
      }
      break;
    case 'dblclick':
      if (!!tools.apply(settings.callbacks.beforeDblClick, [event])) {
        /*if (!param.isCheckNode) {
         if (dblClickExpand && isParent === 'true') {
         //expandCollapse(param);
         }
         }*/
        tools.apply(settings.callbacks.onDblClick, [event]);
        tools.apply(settings.callbacks.afterDblClick, [event]);
      }
      break;
    case 'mouseover':
      if (!!tools.apply(settings.callbacks.beforeMouseOver, [event])) {
        tools.apply(settings.callbacks.onMouseOver, [event]);
        tools.apply(settings.callbacks.afterMouseOver, [event]);
      }
      break;
    case 'mouseout':
      if (!!tools.apply(settings.callbacks.beforeMouseOut, [event])) {
        tools.apply(settings.callbacks.onMouseOut, [event]);
        tools.apply(settings.callbacks.afterMouseOut, [event]);
      }
      break;
    case 'mousedown':
      if (!!tools.apply(settings.callbacks.beforeMouseDown, [event])) {
        tools.apply(settings.callbacks.onMouseDown, [event]);
        tools.apply(settings.callbacks.afterMouseDown, [event]);
      }
      break;
    case 'mouseup':
      if (!!tools.apply(settings.callbacks.beforeMouseUp, [event])) {
        tools.apply(settings.callbacks.onMouseUp, [event]);
        tools.apply(settings.callbacks.afterMouseUp, [event]);
      }
      break;
    case 'contextmenu':
      if (!!tools.apply(settings.callbacks.beforeContextMenu, [event])) {
        tools.apply(settings.callbacks.onContextMenu, [event]);
        tools.apply(settings.callbacks.afterContextMenu, [event]);
      }
      break;
  }
};
