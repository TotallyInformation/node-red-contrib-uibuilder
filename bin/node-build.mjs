import * as esbuild from 'esbuild'

await esbuild.build({
    entryPoints: ['nodes/uibuilder.js'],
    bundle: true,
    // minify: true,
    platform: 'node',
    external: ['emitter', 'fs', 'path', 'socket.io', 'express'],
    // packages: 'external',
    outfile: 'nodes/modules/uibuilder.min.js',
})
