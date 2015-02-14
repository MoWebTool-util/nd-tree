'use strict';
var $=require('jquery');
var tools=require('./tools');
var htmlHandler=require('./nodeHandler');
var checkNodeHandler=require('./triggerCheck');
var config=require('./settings');
var _const=config._const;

var triggerEvent=module.exports={
  commonExpandCollapse: function (event, node, type) {
    var settings = event.data.settings, expandSpeed = settings.expandSpeed, closeSiblings = settings.closeSiblings;
    var subLevels = node.children('[data-role="sub-levels"]'),
      subOthers = node.children('[data-role="sub-others"]'),
      levelNode = node.children('[data-role="level-node"]'),
      switchNode = levelNode.children('[data-role="switch-node"]'),
      parentNode = levelNode.children('[data-role="block-node"]').children('[data-role="Icon-node"]'),
      switchThemes = htmlHandler.switchCls(settings), parentTheme = htmlHandler.parentCls(settings);
    switchNode.removeClass(switchThemes.switchCollapseTheme).addClass(switchThemes.switchExpandTheme);
    parentNode.removeClass(parentTheme.parentCollapseTheme).addClass(parentTheme.parentExpandTheme);
    if (type === _const.switchType[0]) {
      subLevels.slideDown(expandSpeed);
      subOthers.slideDown(expandSpeed);
      if (closeSiblings) {
        var siblings = node.siblings();
        siblings.each(function (i, item) {
          triggerEvent.collapseNode(event, item);
        });

        siblings.children('[data-role="sub-levels"]').slideUp(expandSpeed);
        siblings.children('[data-role="sub-others"]').slideUp(expandSpeed);
      }
    } else if (type === _const.switchType[1]) {
      switchNode.removeClass(switchThemes.switchExpandTheme).addClass(switchThemes.switchCollapseTheme);
      parentNode.removeClass(parentTheme.parentExpandTheme).addClass(parentTheme.parentCollapseTheme);
      subLevels.slideUp(expandSpeed);
      subOthers.slideUp(expandSpeed);
    }
  },
  expandNode: function (event, node) {
    var settings = event.data.settings, o = settings.self;
    if (!!o.trigger(tools.eventName(_const.id.BEFORE, _const.events.EXPAND), event, node)) {
      triggerEvent.commonExpandCollapse(event, node, _const.switchType[0]);
      node.attr('data-open', true);
      o.trigger(tools.eventName(_const.id.ON, _const.events.EXPAND), event, node);
      o.trigger(tools.eventName(_const.id.AFTER, _const.events.EXPAND), event, node);
    }
  },
  collapseNode: function (event, node) {
    if (!(node instanceof $)) {
      node = $(node);
    }
    var isOpen = node.attr('data-open');
    var isParent = node.attr('data-parent');
    if ((isParent === 'true' && isOpen !== 'true') || isParent !== 'true') {
      //是父节点且没有展开或者不是父节点
      return;
    }
    var settings = event.data.settings, o = settings.self;
    if (!!o.trigger(tools.eventName(_const.id.BEFORE, _const.events.COLLAPSE), event, node)) {
      triggerEvent.commonExpandCollapse(event, node, _const.switchType[1]);
      node.attr('data-open', false);
      o.trigger(tools.eventName(_const.id.ON, _const.events.COLLAPSE), event, node);
      o.trigger(tools.eventName(_const.id.AFTER, _const.events.COLLAPSE), event, node);
    }
  },
  checkNode: function (event, node) {
    var settings = event.data.settings, o = settings.self, selectedNodeList = o.selectedNodeList, radioLevel = settings.check.radioSettings.level, chkStyle = settings.check.chkStyle,
      checkSettings = settings.check.checkboxSettings;
    if (!o.trigger(tools.eventName(_const.id.BEFORE, _const.events.CHECK), event, node)) {
      return;
    }
    var levelNode = node.children('[data-role="level-node"]'),
      checkNode = levelNode.children('[data-role="check-node"]'),
      checkTheme = htmlHandler.checkCls(settings),
      chkKey = checkNode.attr('data-chkKey'),
      nodeId = node.attr('data-id'),
      nodeName = node.attr('data-name');
    if (chkKey !== 'true') {
      //原先没有被选中
      if (chkStyle === _const.check.Type[0]) {
        //单选
        if (radioLevel === _const.check.radioSettings.level[0]) {
          //level
          node.siblings().each(function (i, item) {
            var child = $(item).children('[data-role="level-node"]').children('[data-role="check-node"]'), childId = $(item).attr('data-id'),
              childName = $(item).attr('data-name');
            checkNodeHandler.pushOrDelForArr(checkNodeHandler.getObj(childId, childName,child), selectedNodeList, 'splice',settings);
          });
        } else if (radioLevel === _const.check.radioSettings.level[1]) {
          //all
          var allNodes = settings.container.find('[data-role="check-node"]');
          selectedNodeList=[];
          checkNodeHandler.changeChkNodeCls(allNodes, checkTheme, 'false');
        }
      } else if (chkStyle === _const.check.Type[1]) {
        //多选
        //选中所有的子节点
        if (checkSettings.selected.changeChild) {
          var nodes = node.find('[data-role="check-node"]');
          nodes.each(function (i, item) {
            item = $(item);
            var parentNode = item.closest('[data-role="toggle-node"]'), toggleId = parentNode.attr('data-id'), toggleName = parentNode.attr('data-name');
            checkNodeHandler.pushOrDelForArr(checkNodeHandler.getObj(toggleId, toggleName,item), selectedNodeList, 'push',settings);
          });
        }
      }
      checkNodeHandler.pushOrDelForArr(checkNodeHandler.getObj(nodeId, nodeName,checkNode), selectedNodeList, 'push',settings);
    } else {
      //原先有被选中
      if (chkStyle === _const.check.Type[1]) {
        //多选
        //取消选中所有的子节点
        if (checkSettings.selected.changeChild) {
          var unNodes = node.find('[data-role="check-node"]');
          unNodes.each(function (i, item) {
            item = $(item);
            var parentNode = item.closest('[data-role="toggle-node"]'), toggleId = parentNode.attr('data-id'), toggleName = parentNode.attr('data-name');
            checkNodeHandler.pushOrDelForArr(checkNodeHandler.getObj(toggleId, toggleName,item), selectedNodeList, 'splice',settings);
          });
        } else {
          checkNodeHandler.pushOrDelForArr(checkNodeHandler.getObj(nodeId, nodeName,checkNode), selectedNodeList, 'splice',settings);
        }
      }
    }
    o.selectedNodeList = selectedNodeList;
    o.trigger(tools.eventName(_const.id.ON, _const.events.CHECK), event, node, selectedNodeList);
    o.trigger(tools.eventName(_const.id.AFTER, _const.events.CHECK), event, node, selectedNodeList);
  }
};
