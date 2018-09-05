define(['module', 'vue'], function (_module, Vue) {
    'use strict';
    
    // 性能测试标志和性能测试工具
    let __PROFILE__ = false;
    let __profile_start__ = __PROFILE__ && console.time//console.profile
    let __profile_end__ = __PROFILE__ && console.timeEnd//console.profileEnd

    /**
     * vue组件加载类
     * @param {String} _path 模块的路径
     * @param {Function} _onload 加载完成的通知函数
     * @param {Function} _require 加载函数
     */
    function VueCompLoader(_path, _onload, _require) {
        // 响应性能测试
        __PROFILE__ && (this.profileTag = "_vueloader_" + Date.now(), __profile_start__(this.profileTag));

        /**
         * 模块路径
         */
        this.path = _path;
        /**
         * 模块名称
         */
        this.moduleName = /([^\/\.]+)\.vue$/ig.exec(_path)[1];
        /**
         * 加载完成的函数
         */
        this.onload = _onload;
        /**
         * 加载函数
         */
        this.require = _require;
        /**
         * 模板字符串
         */
        this.template = undefined;
        /**
         * 脚本实体字符串
         */
        this.script = undefined;
        /**
         * 异步加载的标记
         */
        this.asyncLoad = [];
        this.asyncLoadMark = [];

        // 定义一个捕获写操作的属性，用来替换实现export default的代码
        Object.defineProperty(this, "export", {
            get: function () { return null; },
            set: function (_val) {
                if (typeof _val == "object") {
                    _val.template = this.template;
                    let _obj = Vue.component(this.moduleName, _val);
                    this.onload(_obj);
                    __PROFILE__ && __profile_end__(this.profileTag);
                }
            }
        });
    };

    /**
     * 创建元素
     * @param {String} _tag 元素使用的标签
     * @param {String} _content 元素的正文数据
     * @param {Object} _attrs 元素的属性
     * @returns {Object} 创建得到的元素对象
     */
    VueCompLoader.createElement = function (_tag, _content, _attrs) {
        let _head = document.getElementsByTagName("head")[0];
        let _element = document.createElement(_tag);
        for (let _key in _attrs) {
            _element.setAttribute(_key, _attrs[_key]);
        }
        _content && (_element.innerHTML = _content);
        _head.appendChild(_element);
        return _element;
    }

    /**
     * 模板标签块的具体解析动作
     * @param {String} _content 正文文本
     * @param {Object} _attrs 属性列表
     */
    VueCompLoader.prototype.templateParser = function (_content, _attrs) {
        if (_attrs["src"]) {
            this.asyncLoad.push("text!" + _attrs["src"]);
            this.asyncLoadMark.push("template"); 
        } else {
            this.template = _content;
        }
    }

    /**
     * 风格标签块的具体解析动作
     * @param {String} _content 正文文本
     * @param {Object} _attrs 属性列表
     */
    VueCompLoader.prototype.styleParser = function (_content, _attrs) {
        _attrs["id"] = this.moduleName + "_vue_style_" + Date.now();
        _attrs["type"] || (_attrs["type"] = "text/css");
        if (_attrs["src"]) {
            // 如果是外部文件定义的风格，则进行外部文件式的加载
            _attrs["src"] = this.require.toUrl(_attrs["src"]);
            this.require([_module.id + "!" + _attrs["src"]]);
        } else {
            // 如果内嵌了风格定义，则直接创建标签
            VueCompLoader.createElement("style", _content, _attrs);
        }
    }

    /**
     * 脚本标签块的具体解析动作
     * @param {String} _content 正文文本
     * @param {Object} _attrs 属性列表
     */
    VueCompLoader.prototype.scriptParser = function (_content, _attrs) {
        if (_attrs["src"]) {
            this.asyncLoad.push("text!" + _attrs["src"]);
            this.asyncLoadMark.push("script");
        } else {
            this.script = _content;
        }
    }

    /**
     * 扩展的vue标签块的具体解析动作
     * @param {String} _content 正文文本
     * @param {Object} _attrs 属性列表
     */
    VueCompLoader.prototype.vueParser = function (_content, _attrs) {
        _attrs["id"] && (this.moduleName = _attrs["id"]);
        this.parse(_content, true);
    }

    /**
     * 所有加载的数据完成后的处理
     */
    VueCompLoader.prototype.completeLoad = function () {
        // 如果有参数，说明有异步加载，则将数据载入实例本体
        let _mark = this.asyncLoadMark;
        let _len = arguments.length;
        if ((_mark.length == _len) && (_len > 0)) {
            for (let i = arguments.length - 1; i >= 0; i--) {
                this[_mark[i]] = arguments[i];
            }
        }
        // 进行脚本代换
        let _argsStr = ["__vue_loader__", "Vue"];
        let _args = [this, Vue];
        let _innerRequire = [];
        let _regexp = /(import[\s\{]*([\S]*?)[\s\}]*from\s*(['"])([^\3]*?)\3)|(export\s+default\s*\{)/ig;
        let _replaceFn = function (_top, _import, _key, _quot, _path) {
            if (_import) {
                // 导入代码的转译
                if ((_path[0] != "/") && (_path[0] != "?")) {
                    _path = this.path.substring(0, this.path.lastIndexOf("/") + 1) + _path;
                }
                (_key == "default") && (_key = /([^\/\.\?]+)\.?[^\/\.]*$/ig.exec(_path)[1]);
                if (/.vue$/ig.test(_path)) {
                    _path = "vueloader!" + _path;
                }
                _argsStr.push(_key);
                _innerRequire.push(_path);
                return "";
            } else {
                // 导出代码的转译
                return "__vue_loader__.export = {";
            }
        }.bind(this);
        let _fn = new Function(_argsStr, this.script.replace(_regexp, _replaceFn));
        // 如果存在内部引入，则先进行异步加载，最后进行脚本调用
        if (_innerRequire.length > 0) {
            this.require(_innerRequire, function () {
                _args = Array.prototype.concat.apply(_args, arguments);
                _fn.apply(null, _args);
            });
        } else {
            _fn.apply(null, _args);
        }
    }

    /**
     * 解析总入口，该入口启动解析工作，但具体的标签块的解析将由其他函数来处理
     * @param {String} _text 具体解析的文本
     * @param {Boolean} _isChild 指示是否是内部嵌套的解析 
     */
    VueCompLoader.prototype.parse = function (_text, _isChild) {
        // 提取每个块进行解析处理
        let _blockRegexp = /<([^>\s]+)([^>]*)>([\s\S]*?)<\/\1>/ig;
        let _block = null;
        while ((_block = _blockRegexp.exec(_text)) != null) {
            // 必需确保有对应的标签解析器
            let _parser = this[_block[1] + "Parser"];
            if (typeof _parser == "function") {
                // 提取属性列表
                let _attrSet = {};
                let _attrsText = _block[2];
                let _attrRegexp = /(\S+)\s*=\s*(['"])([\s\S]*?)\2/ig;
                let _attr = null;
                while ((_attr = _attrRegexp.exec(_attrsText)) != null) {
                    let _key = _attr[1];
                    if (_key == "src") {
                        // 资源路径要进行修正
                        let _path = _attr[3];
                        if (_path[0] != "/") {
                            _path = this.path.substring(0, this.path.lastIndexOf("/") + 1) + _path;
                        }
                        _attrSet[_key] = _path;
                    } else {
                        _attrSet[_key] = _attr[3];
                    }
                }
                // 调用标签的具体解析器进行解析
                _parser.call(this, _block[3], _attrSet);
            }
        }
        // 不是嵌套的子块则进行最终处理
        if (!_isChild) {
            // 如果存在异步加载的必要块，则进行异步加载，否则直接进行最终处理
            if (this.asyncLoad.length > 0) {
                this.require(this.asyncLoad, this.completeLoad.bind(this));
            } else {
                this.completeLoad();
            }
        }
    }

    // 插件的导出对象
    let _exportor = {
        version: "1.0.0",

        // loader配置对象
        config: (_module.config() || { baseFolder: "" }),

        // 加载插件的必要加载方法
        load: function (_name, _req, _onload, _config) {
            if (/\.css$/ig.test(_name)) {
                // 对CSS的加载是直接插入style标签
                _onload(VueCompLoader.createElement("style", null, { src: _name, type: "text/css" }));
            } else {
                // 其他加载内容都认为是vue文件，进行获取资源处理
                _req(["text!" + _name], function (_text) {
                    try {
                        // 生成处理对象实例进行处理
                        let _loader = new VueCompLoader(_name, _onload, _req);
                        _loader.parse(_text);
                    } catch (_err) {
                        _onload.error(_err);
                    }
                });
            }
        },

        // 将资源名称转化为标准路径名
        normalize: function (_name, _fn) {
            if (_name[0] == "?") {
                _name = _fn(_exportor.config.baseFolder + "/" + _name.substr(1));
            }
            /\.css$|\.vue$/ig.test(_name) || (_name += ".vue");
            console.log("normalize", _name);
            return _name;
        }
    };

    // 校正配置参数
    (_exportor.config.baseFolder || (_exportor.config.baseFolder = ""));

    return _exportor;
});