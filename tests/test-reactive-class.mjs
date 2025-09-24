// @ts-nocheck
import { reactive, Reactive } from '../src/front-end-module/reactive.mjs'
global.Element = class Element {} // Mock Element class for testing purposes

const x = {
    a: 1,
    b: 2,
    c: {
        c1: 3.1,
        c2: 3.2,
        c3: {
            c31: 4.1,
            c32: 4.2,
            c33: 4.3,
        },
        c4: 3.4,
    },
}
const z = reactive(x)
const zRef = z.onChange((newValue, oldValue, property, target) => {
    console.log(`z prop "${property}" value changed from`, oldValue, 'to', newValue, '\n', target)
})
z.a = 'jim'
z.c.c3.c31 = 'fred'
delete z.c

console.log('-----------------------------------------------------')
const xx = 55
const zz = reactive(xx)
const zzRef = zz.onChange((newValue, oldValue, property, target) => {
    console.log(`zz prop "${property}" value changed from`, oldValue, 'to', newValue, '\n', target)
})
zz.value = 66

console.log('-----------------------------------------------------')
const xxx = [1,2,3,4,5,6,]
const zzz = reactive(xxx)
const zzzRef = zzz.onChange((newValue, oldValue, property, target) => {
    console.log(`zzz prop "${property}" value changed from`, oldValue, 'to', newValue, '\n', target)
})
zzz.push(7)
zzz[3] = 99
delete zzz[1]
// zzz.getListenerCount()
