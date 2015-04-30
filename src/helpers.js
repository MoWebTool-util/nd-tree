'use strict';

exports.makeButton = function(options) {
  return '<button' +
    // className
    ' class="button-' + options.role + '"' +
    // role
    ' data-role="' + options.role + '"' +
    // disabled
    (options.disabled ? ' disabled' : '') +
    '>' + options.text + '</button>';
};
