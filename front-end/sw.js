// https://yonatankra.com/how-service-workers-sped-up-our-website-by-97-5/
https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers

self.VERSION = 'SW_VERSION'

self.addEventListener('activate', (event) => {
    console.log('sw active', event)
    // event.waitUntil(enableNavigationPreload())
})
