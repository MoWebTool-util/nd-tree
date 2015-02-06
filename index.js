/**
 * Description: index.js
 * Author: lzhengms <lzhengms@gmail.com>
 * Date: 2015-01-13 11:24:44
 */

'use strict';

var Tree;
var $ = require('jquery');
var ndEvents = require('nd-events');
var nodeTpl = require('./src/tpl/wrap.handlebars');
var textNodeTpl = require('./src/tpl/textnode.handlebars');
//const
var _const = {
  events: {
    CREATE: 'nd_tree_create',
    CLICK: 'nd_tree_click',
    EXPAND: 'nd_tree_expand',
    COLLAPSE: 'nd_tree_collapse',
    CHECK: 'nd_tree_check',
    REMOVE: 'nd_tree_remove'
  },
  id: {
    ON: 'on',
    BEFORE: 'before',
    AFTER: 'after'
  },
  defaultEvents: {},
  expandList: ['none', 'all', 'first', 'last'],
  switchTheme: ['switch', 'arrow', 'custom', 'hollow'],
  switchType: ['Expand', 'Collapse'],
  check: {
    Type: ['radio', 'checkbox'],
    radioSettings: {
      level: ['level', 'all']
    },
    checkboxSettings: {}
  }


};
//settings
var _settings = {
  containerId: '',//容器
  expandIndex: 'none',//默认展开某个节点，取值'2','none','first','last',具体的数字
  defaultDataFormat: true,//支持的数据格式，false代表的是[ {id: 11, pId: 1, name: "父节点11 - 折叠"}],否则默认true是[{id:1,pId:'1',name:'节点','children':[{id:1,pId:'1',name:'节点','children':[]}]}]
  closeSiblings: true,//展开一个节点的时候，是否关闭兄弟节点，默认true关闭兄弟节点
  dblClickExpand: true,//双击展开父节点，默认是响应双击。
  expandSpeed: 'fast',//展开收缩的动画效果
  defaultSwitchTheme: 'switch',//两种样式，箭头或者常见的+-;取值'arrow','switch','custom','hollow'默认switch
  showParentIcon: false,//是否显示父节点前面的图标,默认不显示
//events
  events: {},
//keys
  keys: {
    idKey: 'id',
    pIdKey: 'pId',
    nameKey: 'name',
    childKey: 'children'
  },
//回调
  callbacks: {
    beforeClick: null,
    onClick: null,
    afterClick: null,
    beforeCreate: null,
    onCreate: null,
    afterCreate: null,
    beforeExpand: null,
    onExpand: null,
    afterExpand: null,
    beforeCollapase: null,
    onCollapase: null,
    afterCollapase: null,
    beforeRemove: null,
    onRemove: null,
    afterRemove: null,
    beforeCheck: null,
    onCheck: null,
    afterCheck: null,
    beforeMouseOver: null,
    onMouseOver: null,
    afterMouseOver: null,
    beforeMouseOut: null,
    onMouseOut: null,
    afterMouseOut: null,
    beforeMouseDown: null,
    onMouseDown: null,
    afterMouseDown: null,
    beforeMouseUp: null,
    onMouseUp: null,
    afterMouseUp: null,
    beforeContextMenu: null,
    onContextMenu: null,
    afterContextMenu: null,
    beforeDblClick: null,
    onDblClick: null,
    afterDblClick: null
  },
  //单选多选
  check: {
    enable: true,
    chkStyle: _const.check.Type[0],//默认是单选
    radioSettings: {
      level: _const.check.radioSettings.level[1]//默认的分组级别在all级
    },
    checkboxSettings: {
      selected: {
        changeChild: true
      },
      unSelected: {
        changeChild: true
      }
    }
  },
//启用编辑
  edit: {
    enable: true,
    showRemoveBtn: true
  },
//样式
  classes: {
    levelClsName: '',//根节点的样式，level级别的
    parentTxtClsName: '',//父节点的样式
    //展开收缩的样式
    expandCollapse: {
      customExpand: 'expandIcon',
      customCollapse: 'collapseIcon',
      switchExpand: 'icon icon-switch-open',
      switchCollapse: 'icon icon-switch-close',
      arrowExpand: ' icon-arrow-open',
      arrowCollapse: ' icon-arrow-close',
      hollowExpand: 'hollowExpand',
      hollowCollapse: 'hollowCollapse'
    },
    //单选框和复选框的图标
    check: {
      radio: {
        checked: 'icon icon-radiocheck',//选中时候的样式图标
        unchecked: 'icon icon-unradiocheck'//没被选中时候的样式图标
      },
      checkbox: {
        checked: 'icon icon-checkbox',//选中时候的样式图标
        unchecked: 'icon icon-uncheckbox'//没被选中时候的样式图标
      }
    },
    //每个节点前面的图标
    nodeIcon: {
      expand: 'icon icon-node-open',
      collapse: 'icon icon-node-close'
    }
  },
//节点的模板
  templates: {
    nodeTpl: ''//节点的模板
  }

};
//tools
var tools = {
  camlCase: function (name, id) {
    //CREATE--->onCreate
    name = name.toString();
    return id + name.charAt(0) + name.substring(1).toLowerCase();
  },
  eventName: function (type, name) {
    return type + ':' + name;
  },
  apply: function (fun, param, defaultValue) {
    if (typeof fun === 'function') {
      return fun.apply(null, param ? param : []);
    }
    return defaultValue;
  },
  normalizeTree: function (settings, list) {
    var i, m, idKey = settings.keys.idKey, parentKey = settings.keys.pIdKey, childKey = settings.keys.childKey;
    if (!idKey || idKey === '' || !list) {
      return [];
    }
    if (!$.isArray(list)) {
      return [list];
    }
    var r = [];
    var tmpArr = [];
    for (i = 0, m = list.length; i < m; i++) {
      list[i][childKey]=[];
      tmpArr[list[i][idKey]] = list[i];
    }
    for (i = 0, m = list.length; i < m; i++) {
      if (tmpArr[list[i][parentKey]] && list[i][idKey] !== list[i][parentKey]) {
        if (!tmpArr[list[i][parentKey]][childKey]) {
          tmpArr[list[i][parentKey]][childKey] = [];
        }
        tmpArr[list[i][parentKey]][childKey].push(list[i]);
      } else {
        r.push(list[i]);
      }
    }
    return r;
  }
};
//nodeHtml
var htmlHandler = {
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
var checkNodeHandler = {
  getObj: function (id, name) {
    return {id: id, name: name};
  },
  getIndex: function (item, selectedNodeList) {
    var flag = -1;
    $.each(selectedNodeList, function (i, v) {
      if (''+v.id === ''+item.id) {
        flag = i;
        return false;
      }
    });
    return flag;
  },
  pushOrDelForArr: function (item, selectedNodeList, type) {
    var index = checkNodeHandler.getIndex(item, selectedNodeList);
    if (type === 'splice') {
      if (index >= 0) {
        selectedNodeList.splice(index, 1);
      }
    } else if (type === 'push') {
      if (index === -1) {
        selectedNodeList.push(item);
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
var triggerEvent = {
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
      nodeName = node.attr('data-name'),
      currentNode = checkNodeHandler.getObj(nodeId, nodeName);
    if (chkKey !== 'true') {
      //原先没有被选中
      checkNodeHandler.pushOrDelForArr(currentNode, selectedNodeList, 'push');
      if (chkStyle === _const.check.Type[0]) {
        //单选
        if (radioLevel === _const.check.radioSettings.level[0]) {
          //level
          node.siblings().each(function (i, item) {
            var child = $(item).children('[data-role="level-node"]').children('[data-role="check-node"]'), childId = $(item).attr('data-id'),
              childName = $(item).attr('data-name');
            checkNodeHandler.pushOrDelForArr(checkNodeHandler.getObj(childId, childName), selectedNodeList, 'splice');
            checkNodeHandler.changeChkNodeCls(child, checkTheme, 'false');
          });
        } else if (radioLevel === _const.check.radioSettings.level[1]) {
          //all
          var allNodes = settings.container.find('[data-role="check-node"]');
          selectedNodeList = [currentNode];
          checkNodeHandler.changeChkNodeCls(allNodes, checkTheme, 'false');
        }
        checkNodeHandler.changeChkNodeCls(checkNode, checkTheme, 'true');
      } else if (chkStyle === _const.check.Type[1]) {
        //多选
        //选中所有的子节点
        if (checkSettings.selected.changeChild) {
          var nodes = node.find('[data-role="check-node"]');
          nodes.each(function (i, item) {
            item = $(item);
            var parentNode = item.closest('[data-role="toggle-node"]'), toggleId = parentNode.attr('data-id'), toggleName = parentNode.attr('data-name');
            checkNodeHandler.pushOrDelForArr(checkNodeHandler.getObj(toggleId, toggleName), selectedNodeList,'push');
            checkNodeHandler.changeChkNodeCls(item, checkTheme, 'true');
          });
        } else {
          checkNodeHandler.changeChkNodeCls(checkNode, checkTheme, 'true');
        }
      }
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
            checkNodeHandler.pushOrDelForArr(checkNodeHandler.getObj(toggleId, toggleName), selectedNodeList,'splice');
            checkNodeHandler.changeChkNodeCls(item, checkTheme, 'false');
          });
        } else {
          checkNodeHandler.pushOrDelForArr(currentNode, selectedNodeList,'splice');
          checkNodeHandler.changeChkNodeCls(checkNode, checkTheme, 'false');
        }
      }
    }
    o.selectedNodeList=selectedNodeList;
    o.trigger(tools.eventName(_const.id.ON, _const.events.CHECK), event, node, selectedNodeList);
    o.trigger(tools.eventName(_const.id.AFTER, _const.events.CHECK), event, node, selectedNodeList);
  }
};
function expandCollapse(param) {
  if (param.isOpen !== 'true') {
    //点击的文本是关闭状态
    triggerEvent.expandNode(param.event, param.node);
  } else {
    //点击的文本已是展开状态
    triggerEvent.collapseNode(param.event, param.node);
  }

}
function handlerEvent(event) {
  var target = event.target, $target = $(target), settings = event.data.settings, o = settings.self;
//, dblClickExpand = settings.dblClickExpand;
  var node = $target.closest('[data-role="toggle-node"]');
  var isCheckNode = $target.attr('data-role') === 'check-node';//check节点
  var isSubLevels = $target.attr('data-role') === 'sub-levels';
  var isSubOthers = $target.attr('data-role') === 'sub-others'||$target.closest('[data-role="sub-others"]').length>0;
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
}
//helper
var initEventHandler = {
  bindEvent: function (settings) {
    var constEvents = _const.events;
    //绑定内置事件
    $.each(constEvents, function (key, value) {
      $.each(_const.id, function (id, val) {
        var callbackKey = tools.camlCase(key, val);
        var event = tools.eventName(val, value);
        if (!_const.defaultEvents.hasOwnProperty(event)) {
          _const.defaultEvents[event] = settings.callbacks[callbackKey];
        }
      });
    });
    $.extend(_const.defaultEvents, settings.events);
    $.each(_const.defaultEvents, function (event, callback) {
      settings.self.on(event, callback, settings.container);
    });
  },
  bindDomEvent: function (settings) {
    var container = settings.container;
    container.on('click dblclick mouseover mouseout mousedown mouseup contextmenu', {settings: settings}, handlerEvent);
  }

};
//nodesHandler
var nodesHandler = {
  generatorTree: function (settings, level, nodes) {
    if (!!settings.self.trigger(tools.eventName(_const.id.BEFORE, _const.events.CREATE), settings)) {
      settings.self.trigger(tools.eventName(_const.id.ON, _const.events.CREATE), settings);
      if (!nodes || nodes.length === 0) {
        return;
      }
      var html = this.getHtml(settings, level, nodes);
      settings.container.empty();
      settings.container.append(html);
      settings.self.trigger(tools.eventName(_const.id.AFTER, _const.events.CREATE), settings);
    }
  },
  initNode: function (settings, level, node) {
    var idKey = settings.keys.idKey, nameKey = settings.keys.nameKey;
    node.level = level;
    node.id = node[idKey];
    node.name = node[nameKey];
    htmlHandler.switchCls(settings, node);
    htmlHandler.checkCls(settings, node);
    htmlHandler.parentCls(settings, node);
  },
  getChildNodeHtml: function (settings, level, node) {
    var html = '', textNodeHtml = '', childKey = settings.keys.childKey;
    this.initNode(settings, level, node);
    if (node[childKey] && node[childKey].length > 0) {
      node.isParent = true;
      $.each(node[childKey], function (v, childNode) {
        html += nodesHandler.getChildNodeHtml(settings, node.level + 1, childNode);
      });
    }
    var settingsTpl = settings.templates.nodeTpl;
    if (settingsTpl) {
      if (typeof settingsTpl === 'function') {
        textNodeHtml = settingsTpl(node);
      } else {
        textNodeHtml = settingsTpl;
      }
    } else {
      textNodeHtml = textNodeTpl(node);
    }
    node.html = html;
    node.textNode = textNodeHtml;
    html = nodeTpl(node, {
      helpers: {
        ifEqs: function (v1, v2, options) {
          if (v1 === v2) {
            return options.fn(this);
          } else {
            return options.inverse(this);
          }
        }
      }
    });
    return html;
  },
  getHtml: function (settings, level, nodes) {
    var html = '', length = nodes.length;
    $.each(nodes, function (i, node) {
      node.index = i;
      node.isParent = true;
      htmlHandler.open(settings, length, node);
      html += nodesHandler.getChildNodeHtml(settings, level, node);
    });
    return html;
  }
};
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
  this.settings=settings;
  this.selectedNodeList=[];
  this.set(data);
  initEventHandler.bindEvent(settings);
  initEventHandler.bindDomEvent(settings);
};
Tree.prototype.set=function(data,defaultDataFormat){
  data = data ? ($.isArray(data) ? data : []) : [];
  if(typeof defaultDataFormat!=='undefined'){
    this.settings.defaultDataFormat=defaultDataFormat;
  }
  if (!this.settings.defaultDataFormat) {
    data = tools.normalizeTree(this.settings, data);
  }
  this.selectedNodeList=[];
  //生成树
  nodesHandler.generatorTree(this.settings, 1, data);

};
Tree.changeNodeList=checkNodeHandler;
module.exports = Tree;
