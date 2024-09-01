import "../resources/utils/uibrouter.esm.min.js"

'use strict'

const routerConfig = {
    hide: true,
    routes: [
        {
            id: 'home',
            src: './readme.md',
            type: 'url',
            format: 'markdown'
        }
    ],
    otherLoad: [
        {
            id: 'menu-content',
            src: './.config/sidebar.md',
            format: 'markdown'
        }
    ],
}

const router = new UibRouter(routerConfig)
