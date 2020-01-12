class MVVM {
    constructor(options) {
        this.$el = options.el;
        this.$data = options.data;

        // 编译
        if (this.$el) {
            // 数据劫持
            new Observer(this.$data);

            // 数据代理
            this.proxyData(this.$data);

            // 编译
            new Compile(this.$el, this);
        }
    }

    // 将vm.$data代理到vm上
    proxyData(data) {
        Object.keys(data).forEach(key => {
            Object.defineProperty(this, key, {
                get() {
                    return data[key];
                },
                set(newVal) {
                    data[key] = newVal;
                }
            })
        })
    }
}