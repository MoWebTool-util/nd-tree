/**
 * @module Tree
 * @author crossjs <liwenfu@crossjs.com>
 */

'use strict';

module.exports = function() {
  var plugin = this,
    host = plugin.host;

  var emSelected;

  host.delegateEvents({
    'click .name': function(e) {
      e.stopPropagation();

      if (emSelected) {
        if (emSelected === e.currentTarget) {
          return;
        }

        emSelected.classList.remove('selected');
      }

      emSelected = e.currentTarget;
      emSelected.classList.add('selected');
    }
  });

  // 通知就绪
  this.ready();
};
