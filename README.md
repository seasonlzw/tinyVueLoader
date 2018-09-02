# tinyVueLoader
This is a plugin for require.js. It is used to load VUE components according to the AMD specification.   
Configure requires.js as follows:    
```    
require.config({     
    ...    
    paths: {    
        "text": "/lib/plugins/text", // rewrite as your actual path    
        "vueloader": "/lib/plugins/tinyVueLoader", // rewrite as your actual path     
    },    
    vueLoader: {    
        baseFolder: "/vueComponents" // rewrite as your actual path for the components    
    }    
    ...    
});    
```    
Use this plugin to load vue components as follow:    
```    
// load the "test/test.vue" with the relative path of the baseFolder    
require(['vueloader!?test/test.vue'], function (obj) {    
    ...    
})    
// load the "../rel.vue" with the relative path of the current script    
require(['vueloader!../rel.vue'], function (obj) {    
    ...    
})    
```    
    
这是配合Require.js使用的，按照AMD规范加载VUE单文件组件的插件。    
使用该插件时请按一下方式配置：    
```
require.config({    
    ...    
    paths: {    
        "text": "/lib/plugins/text", // 该插件依赖插件，请按照你的实际路径来配置    
        "vueloader": "/lib/plugins/tinyVueLoader", // 请按照你的实际路径来配置    
    },    
    vueLoader: {    
        baseFolder: "/vueComponents" // 请配置为你存放vue组件文件的路径    
    }    
    ...    
});    
```
按照以下方式使用该插件加载VUE文件:      
```    
// 以下例子从baseFolder配置的路径下加载"test/test.vue"，从baseFolder中加载时使用?作为路径前导    
require(['vueloader!?test/test.vue'], function (obj) {    
    ...    
})    
// 以下例子以当前脚本的相对路径加载"../rel.vue"    
require(['vueloader!../rel.vue'], function (obj) {    
    ...    
})    
```
