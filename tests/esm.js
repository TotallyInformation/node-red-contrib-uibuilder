/** Try wrapping an ESM */

/**
 *
 */
function execa() {
    // const { execa } = await import('execa')
    const execa = import('execa')
        .then( x => {
            return x
        })
    return execa
}
// async function execaSync() {
//     const { execaSync } = await import('execa')
//     return execaSync
// }
// const x = execaSync('echo', ['unicorns'])
//     .then((x) => {
//         console.log(x)
//         return x
//     })
//     .catch(e => {
//         console.error(e.message)
//     })
// console.log(x)

// const run = async () => {
//     const results = await execa('curl', ['-sSL', 'https://sindresorhus.com/unicorn'])
//     return results
// }
// const done = run()
// console.log(done)
console.log(Promise.resolve(execa('curl', ['-sSL', 'https://sindresorhus.com/unicorn'])))
