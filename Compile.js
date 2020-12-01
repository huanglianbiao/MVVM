class Compile {
    constructor(el, vm) {
        this.el = this.isElementNode(el) ? el : document.querySelector(el);
        this.vm = vm;

        if (this.el) {
            // 开始编译
            // 1. 先把真实DOM放入内存中，fragment
            let fragment = this.node2Fragment(this.el);

            // 2. 编译，提取想要的元素
            this.compile(fragment);

            // 3. 放回
            this.el.appendChild(fragment);

        }
    }

    /* 辅助方法 */
    // 判断是不是DOM元素
    isElementNode(node) {
        return node.nodeType === 1;
    }

    // 是否是指令
    isDirective(name) {
        return name.includes("v-");
    }

    /* 核心方法 */
    node2Fragment(el) {
        // 创建一个文档碎片（内存中的DOM节点）
        let fragment = document.createDocumentFragment();
        let firstChild;

        while (firstChild = el.firstChild) {
            fragment.appendChild(firstChild);
        }

        return fragment;
    }

    compile(fragment) {
        let childNodes = fragment.childNodes;
        Array.from(childNodes).forEach(node => {
            // 判断元素节点
            if (this.isElementNode(node)) {
                this.compileElement(node);
                // console.log("element", node);
                this.compile(node);
            } else {
                // 文本节点
                this.compileText(node);
                // console.log("text", node);
            }
        })

    }

    compileElement(node) {
        // 取出节点属性
        let attrs = node.attributes;
        // console.log(attrs);
        Array.from(attrs).forEach(attr => {
            // 带v-的指令
            if (this.isDirective(attr.name)) {
                let expr = attr.value;  // 表达式
                // v-text取出text
                let type = attr.name.slice(2);
                CompileUtil[type](node, this.vm, expr);
            }
        })
    }

    compileText(node) {
        let expr = node.textContent;
        let reg = /\{\{([^}]+)\}\}/g;
        if (reg.test(expr)) {
            CompileUtil["text"](node, this.vm, expr);
        }
    }
}

CompileUtil = {
    getVal(vm, expr) {
        expr = expr.split(".");
        return expr.reduce((prev, next) => {
            return prev[next];
        }, vm.$data);
    },
    getTxtVal(vm, expr) {
        // {{msg.a}} => msg.a
        return expr.replace(/\{\{([^}]+)\}\}/g, (...arguments) => {
            return this.getVal(vm, arguments[1]);
        });
    },

    // 编译文本
    text(node, vm, expr) {
        let updaterFn = this.updater["textUpdater"];

        /*
        * 解析模板，并给该节点添加一个update的观察者
        * */

        expr.replace(/\{\{([^}]+)\}\}/g, (...arguments) => {
            // 添加观察者
            new Watcher(vm, arguments[1], (newVal) => {
                updaterFn && updaterFn(node, this.getTxtVal(vm, expr));
            })
        });

        updaterFn && updaterFn(node, this.getTxtVal(vm, expr));
    },

    setVal(vm, expr, value) {
        expr = expr.split(".");
        return expr.reduce((prev, next, index) => {
            if (index === expr.length -1) {
                return prev[next] = value;
            }
            return prev[next]
        }, vm.$data)
    },
    // 编译表单
    model(node, vm, expr) {
        let updaterFn = this.updater["modelUpdater"];

        new Watcher(vm, expr, (newVal) => {
            updaterFn && updaterFn(node, newVal);
        })

        node.addEventListener("input", (e) => {
            let newVal = e.target.value;
            this.setVal(vm, expr, newVal);
        })

        updaterFn && updaterFn(node, this.getVal(vm, expr));
    },

    updater: {
        textUpdater(node, value) {
            node.textContent = value;
        },
        modelUpdater(node, value) {
            node.value = value;
        }
    }
}
