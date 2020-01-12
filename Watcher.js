class Watcher {
    constructor(vm, expr, cb) {
        this.vm = vm;
        this.exper = expr;
        this.cb = cb;

        // 获取老值
        this.value = this.get();
    }

    getVal(vm, expr) {
        expr = expr.split(".");
        return expr.reduce((prev, next) => {
            return prev[next];
        }, vm.$data);
    }

    get() {
        Dep.target = this;
        let value = this.getVal(this.vm, this.exper)
        Dep.target = null;
        return value;
    }

    // 向外暴露的方法
    update() {
        let newVal = this.getVal(this.vm, this.exper);
        let oldVal = this.value;

        if (newVal !== oldVal) {
            this.cb(newVal);
        }
    }
}