'use strict';
var $=require('jquery');
var config=require('./settings');
var _const=config._const;

//初始化树时，根据设置的配置来绑定节点的属性
module.exports={
  //默认展开第几个节点
  open: function (settings, length, node) {
    var expandIndex = settings.expandIndex, index, realIndex;
    realIndex = $.inArray(expandIndex, _const.expandList);
    switch (realIndex) {
      case 0:
        //none
        index = _const.expandList[0];
        break;
      case 1:
        //all
        index = _const.expandList[1];
        break;
      case 2:
        //first
        index = 0;
        break;
      case 3:
        //last
        index = length - 1;
        break;
      default:
        index = +expandIndex;
        break;
    }
    if (index === _const.expandList[0]) {
      node.open = false;
    }
    else if (index === _const.expandList[1]) {
      node.open = true;
    } else {
      if (node.index === index) {
        node.open = true;
      } else {
        node.open = false;
      }
    }
  },
  //展开，折叠的图标的样式
  switchCls: function (settings, node) {
    var defaultSwitchTheme = settings.defaultSwitchTheme.toLowerCase(), o = {
      switchExpandTheme: '',
      switchCollapseTheme: ''
    };
    if (node) {
      node.switchTheme = defaultSwitchTheme;
    }
    $.each(_const.switchType, function (i, item) {
      var key = defaultSwitchTheme + item;
      if (i === 0) {
        if (node) {
          node.switchExpandTheme = settings.classes.expandCollapse[key];
        }
        o.switchExpandTheme = settings.classes.expandCollapse[key];
      } else {
        if (node) {
          node.switchCollapseTheme = settings.classes.expandCollapse[key];
        }
        o.switchCollapseTheme = settings.classes.expandCollapse[key];
      }
    });
    return o;
  },
  //当选多选框的样式
  checkCls: function (settings, node) {
    var enable = settings.check.enable, chkStyle = settings.check.chkStyle, radioSettings = settings.check.radioSettings,
      radioCls = settings.classes.check.radio, checkboxCls = settings.classes.check.checkbox, o = {
        checkedTheme: '',
        unCheckedTheme: ''
      };
    var radioCheck = radioCls.checked, radioUnCheck = radioCls.unchecked, checkboxChecked = checkboxCls.checked, checkboxUnChecked = checkboxCls.unchecked;
    if (enable) {
      if (node) {
        node.check = true;//是否显示单选或者多选按钮
        node.checked = false;//是否被选中，默认都是没有被选中的
      }
      switch (chkStyle) {
        case _const.check.Type[0]:
          //radio
          if (node) {
            node.chkStyle = _const.check.Type[0];
            node.raidoLevel = radioSettings.level;
            node.checkedTheme = radioCheck;
            node.unCheckedTheme = radioUnCheck;
          }
          o.checkedTheme = radioCheck;
          o.unCheckedTheme = radioUnCheck;
          break;
        case _const.check.Type[1]:
          //checkbox
          if (node) {
            node.chkStyle = _const.check.Type[1];
            node.checkedTheme = checkboxChecked;
            node.unCheckedTheme = checkboxUnChecked;
          }
          o.checkedTheme = checkboxChecked;
          o.unCheckedTheme = checkboxUnChecked;
          //checkbox
          break;
      }
    } else {
      if (node) {
        node.check = false;
      }
    }
    return o;
  },
  //父节点的前面的图标样式
  parentCls: function (settings, node) {
    var showIcon = settings.showParentIcon, expandIcon = settings.classes.nodeIcon.expand, collapseIcon = settings.classes.nodeIcon.collapse,
      levelCls = settings.classes.levelClsName, parentTextCls = settings.classes.parentTxtClsName, o = {
        parentExpandTheme: '',
        parentCollapseTheme: ''
      };
    if (node) {
      node.levelCls = levelCls;
      node.parentTextCls = parentTextCls;
    }

    if (showIcon) {
      if (node) {
        node.showParentIcon = true;
        node.parentExpandTheme = expandIcon;
        node.parentCollapseTheme = collapseIcon;
      }
      o.parentCollapseTheme = collapseIcon;
      o.parentExpandTheme = expandIcon;
    }
    else {
      if (node) {
        node.showParentIcon = false;
      }

    }
    return o;
  }
};
