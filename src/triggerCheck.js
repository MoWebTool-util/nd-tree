'use strict';
var $=require('jquery');
var htmlHandler=require('./nodeHandler');
var checkNodeHandler=module.exports={
  getObj: function (id, name,child) {
    var node=child?child:null;
    return {id: id, name: name,node:node};
  },
  getIndex: function (item, selectedNodeList) {
    var flag = -1;
    $.each(selectedNodeList, function (i, v) {
      if ('' + v.id === '' + item.id) {
        flag = i;
        return false;
      }
    });
    return flag;
  },
  getNode: function (id, parentNode) {
    return parentNode.find('[data-id="' + id + '"]')
      .children('[data-role="level-node"]')
      .children('[data-role="check-node"]');
  },
  getCurNode:function(item,settings,parentNode){
    var node;
    if(item.node){
      node=item.node;
    }else{
      if (parentNode) {
        node = checkNodeHandler.getNode(item.id, parentNode);
      } else {
        node = checkNodeHandler.getNode(item.id, settings.container);
      }
    }
    return node;
  },
  pushOrDelForArr: function (item, selectedNodeList, type, settings, parentNode) {
    var index = checkNodeHandler.getIndex(item, selectedNodeList);
    var checkTheme = htmlHandler.checkCls(settings);
    var node=checkNodeHandler.getCurNode(item,settings,parentNode);
    if (type === 'splice') {
      if (index >= 0) {
        selectedNodeList.splice(index, 1);
        checkNodeHandler.changeChkNodeCls(node, checkTheme, 'false');
      }
    } else if (type === 'push') {
      if (index === -1) {
        selectedNodeList.push(item);
        checkNodeHandler.changeChkNodeCls(node, checkTheme, 'true');
      }
    }
  },
  changeChkNodeCls: function (node, checkTheme, type) {
    if (type === 'true') {
      node.removeClass(checkTheme.unCheckedTheme).addClass(checkTheme.checkedTheme).attr('data-chkKey', type);
    } else {
      node.removeClass(checkTheme.checkedTheme).addClass(checkTheme.unCheckedTheme).attr('data-chkKey', type);
    }
  }
};
