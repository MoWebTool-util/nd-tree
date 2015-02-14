'use strict';
var $=require('jquery');
//tools
module.exports = {
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
      list[i][childKey] = [];
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
