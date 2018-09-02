# tinyVueLoader
This is a plugin for require.js. It is used to load VUE components according to the AMD specification.   
Configure requires.js as follows:  
(```)
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
(```)
Use this plugin to load vue components as follow:  
(```)
// load the "test/test.vue" with the relative path of the baseFolder
require(['vueloader!?test/test.vue'], function (obj) {
    ...
})
// load the "../rel.vue" with the relative path of the current script  
require(['vueloader!../rel.vue'], function (obj) {
    ...
})
(```)
