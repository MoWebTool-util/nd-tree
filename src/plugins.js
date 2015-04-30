'use strict';

module.exports = [
  {
    name: 'dnd',
    // disabled: true,
    starter: require('./plugins/dnd')
  },
  {
    name: 'treeNode',
    // disabled: true,
    starter: require('./plugins/treenode')
  },
  {
    name: 'editNode',
    // disabled: true,
    starter: require('./plugins/edit-node')
  },
  {
    name: 'delNode',
    // disabled: true,
    starter: require('./plugins/del-node')
  },
  {
    name: 'addNode',
    // disabled: true,
    starter: require('./plugins/add-node')
  },
  {
    name: 'buttons',
    // disabled: true,
    starter: require('./plugins/buttons')
  }
];
