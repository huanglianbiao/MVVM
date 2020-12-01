# VUE双向绑定实现原理

- 首先利用Object.defineProperty() + 递归对数据进行深度劫持。并在get中订阅一个update事件，在set时，触发update。
- 在模板解析时，首先获取根元素后，利用document.createDocumentFragment()将所有节点放到内存中去。在解析过程中，遇到vue语法的节点，都会向该节点添加一个带update方法的Watcher。
- 最后，当data改变时，触发set中的update，完成双向绑定。
