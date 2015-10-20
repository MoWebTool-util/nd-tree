# nd-tree

[![spm version](http://spm.crossjs.com/badge/nd-tree)](http://spm.crossjs.com/package/nd-tree)

> a simple tree support fold and expand

## 安装

```bash
$ spm install nd-tree --save
```

## 使用

```js
var Tree = require('nd-tree');

new Tree({
  // RESETful
  proxy: ucOrgNodeModel,

  keyMap: {
    id: 'node_id',
    name: 'node_name',
    parent: 'parent_id'
  },

  treeName: '组织结构',

  foldable: true,
  checkable: true,
  // multiple: false,

  editable: true,
  sortable: true,

  checked: true,

  pluginCfg: {
    addNode: {
      listeners: {
        start: require('./add/start')
      }
    },
    editNode: {
      listeners: {
        start: require('./edit/start')
      }
    },
    dndSort: {
      listeners: {
        start: require('./sort/start')
      }
    }
  },
  // nodes: data.items,
  parentNode: '#main'
}).render();
```
