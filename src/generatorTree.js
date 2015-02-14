'use strict';
var $=require('jquery');
var htmlHandler=require('./nodeHandler');
var tools=require('./tools');
var nodeTpl = require('./tpl/wrap.handlebars');
var textNodeTpl = require('./tpl/textnode.handlebars');
var config=require('./settings');
var _const=config._const;
//生成树
var nodesHandler=module.exports= {
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
