'use strict';
var $=require('jquery');
var tools=require('./tools');
var handlerEvent=require('./proxyEvent');
var config=require('./settings');
var _const=config._const;

module.exports= {
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
