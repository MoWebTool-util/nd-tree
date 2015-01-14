# nd-tree

[![spm version](http://spmjs.io/badge/nd-tree)](http://spmjs.io/package/nd-tree)

> a simple tree support fold and expand

## 安装

```
$ spm install nd-tree --save
```

## 使用

```js
var Tree = require('nd-tree');

head标签引入example中的css/index.css

<head>
  <meta charset="utf-8" />
  <title>Demo</title>
  <link rel="stylesheet" href="css/index.css"/>
</head>

数据源如下：
 var data={
     "code": 0,
     "message": "ok",
     "list": [
          {
             "id": "2",
             "parent_id": "1",
             "name": "\u5e74\u7ea7\u7ec4",
             "read": 0,
             "unread": 9,
             "if": 1,
             "sub": [
               {
                 "id": "3",
                 "parent_id": "2",
                 "name": "\u4e00\u5e74\u7ea7",
                 "read": 0,
                 "unread": 6,
                 "if": 1,
                 "sub": [
                   {
                     "id": "3",
                     "parent_id": "2",
                     "name": "\u4e00\u5e74\u7ea7",
                     "read": 0,
                     "unread": 6,
                     "if": 1,
                     "sub": []
                   }
                 ]
               }
               ]
          }
 
   var unreadHtml = '', readHtml = '';
       data.list.forEach(function(item,index,arr){
        item.parentId=item.parent_id;
         var o=new Tree(item);
         readHtml += o.readHtml;
         unreadHtml += o.unreadHtml;
       });
   
      document.getElementById('container').innerHTML=readHtml;       

// use Tree
```
