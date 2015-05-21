'use strict';

module.exports = [
  {
    name: 'basic',
    starter: require('./plugins/basic')
  },
  {
    name: 'fold',
    disabled: true,
    starter: require('./plugins/fold')
  },
  {
    name: 'check',
    disabled: true,
    starter: require('./plugins/check')
  },
  {
    name: 'dndSort',
    disabled: true,
    starter: require('./plugins/dnd-sort')
  },
  {
    name: 'editNode',
    starter: require('./plugins/edit-node')
  },
  {
    name: 'delNode',
    starter: require('./plugins/del-node')
  },
  {
    name: 'addNode',
    starter: require('./plugins/add-node')
  },
  {
    name: 'crud',
    disabled: true,
    starter: require('./plugins/crud')
  },
  {
    name: 'save',
    disabled: true,
    starter: require('./plugins/save')
  },
  {
    name: 'interact',
    priority: 0,
    starter: require('./plugins/interact')
  }
];
