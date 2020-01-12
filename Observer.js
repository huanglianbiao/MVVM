class Observer {
    constructor(data) {
        this.observer(data);
    }

    observer(data) {
        // 将原有数据对象改为get和set的形式

        if (!data || typeof data !== "object") {
            return;
        }

        // 
        Object.keys(data).forEach(key => {
            // 劫持
            this.defineReactive(data, key, data[key]);

            // 深度劫持
            this.observer(data[key]);
        })
    }

    // 定义响应式
    defineReactive(obj, key, value) {
        let that = this;
        let dep = new Dep(); // 每当数据变化都会对应一个数组
        Object.defineProperty(obj, key, {
            enumerable: true,
            configurable: true,
            get() {
                // todo... 中间过程
                Dep.target && dep.addSub(Dep.target);
                return value;
            },
            set(newVal) {
                if (newVal !== value) {
                    if (typeof newVal === "object") {
                        that.observer(newVal);
                    }
                    value = newVal;
                    dep.notify();
                }
            }
        })
    }
}

// 发布订阅
class Dep {
    constructor() {
        // 订阅的数据
        this.subs = []
    }

    addSub(watcher) {
        this.subs.push(watcher);
    }

    notify() {
        this.subs.forEach(watcher => watcher.update());
    }
}