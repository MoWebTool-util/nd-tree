'use strict';

var $ = require('jquery');
var checkNodeHandler = require('./triggerCheck');
var config = require('./settings');
var _const = config._const;
module.exports = {
  getSettings: function (settings) {
    var enable = settings.check.enable;
    var chkStyle = settings.check.chkStyle;
    var changeChild = settings.check.checkboxSettings.changeChild;
    var changeParent = settings.check.checkboxSettings.changeParent;
    return {enable: enable, chkStyle: chkStyle, changeChild: changeChild, changeParent: changeParent};
  },
  /*jshint maxdepth:4*/
  selected: function (settings, selectedNodeList, node) {
    var o = this.getSettings(settings);
    if (o.enable && o.chkStyle === _const.check.Type[1]) {
      //选中所有的子节点
      if (o.changeChild) {
        //同时处理子节点
        var nodes = node.find('[data-role="check-node"]');
        nodes.each(function (i, item) {
          item = $(item);
          var parentNode = item.closest('[data-role="toggle-node"]'), toggleId = parentNode.attr('data-id'), toggleName = parentNode.attr('data-name');
          checkNodeHandler.pushOrDelForArr(checkNodeHandler.getObj(toggleId, toggleName, item), selectedNodeList, 'push', settings);
        });
      }
      if (o.changeParent) {
        //同时处理父节点(选中)
        var curLevel = +node.data('level') - 1;
        while (curLevel > 0) {

          var parentLevel = node.closest('.level-' + curLevel);
          if (parentLevel.length) {
            var toggleId = parentLevel.attr('data-id'), toggleName = parentLevel.attr('data-name');
            checkNodeHandler.pushOrDelForArr(checkNodeHandler.getObj(toggleId, toggleName), selectedNodeList, 'push', settings);
          }
          --curLevel;
        }
      }
    }
  },
  /*jshint maxdepth:4*/ /*jshint loopfunc:true*/
  unselected: function (settings, selectedNodeList, node) {
    var o = this.getSettings(settings);
    if (o.enable && o.chkStyle === _const.check.Type[1]) {
      //取消选中所有的子节点
      if (o.changeChild) {
        //同时处理子节点
        var unNodes = node.find('[data-role="check-node"]');
        unNodes.each(function (i, item) {
          item = $(item);
          var parentNode = item.closest('[data-role="toggle-node"]'), toggleId = parentNode.attr('data-id'), toggleName = parentNode.attr('data-name');
          checkNodeHandler.pushOrDelForArr(checkNodeHandler.getObj(toggleId, toggleName, item), selectedNodeList, 'splice', settings);
        });
      }
      if (o.changeParent) {
        //同时处理父节点（如果还有子节点被选中,则父节点还是选中状态，否则父节点取消选中）
        var nowLevel = +node.data('level') - 1;
        while (nowLevel > 0) {
          var nowNode = node.closest('.level-' + nowLevel);
          var childNodes = nowNode.children('[data-role="sub-levels"]').children('[data-role="toggle-node"]').children('[data-role="level-node"]').children('[data-role="check-node"]');
          var m = 0;
          $.each(childNodes, function (i, item) {
            var chkKey = '' + $(item).attr('data-chkKey');
            if (chkKey === 'true') {
              m++;
              return false;
            }
          });
          if (nowNode.length && m === 0) {
            var curId = nowNode.attr('data-id'), curName = nowNode.attr('data-name');
            checkNodeHandler.pushOrDelForArr(checkNodeHandler.getObj(curId, curName), selectedNodeList, 'splice', settings);
            --nowLevel;
            continue;
          }
          break;
        }
      }
    }
  }
};
