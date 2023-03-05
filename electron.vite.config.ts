import {defineConfig, externalizeDepsPlugin} from 'electron-vite';
export default defineConfig({

    main: {
        plugins: [externalizeDepsPlugin()],
        build: {
            outDir: './dist/main',
            emptyOutDir:true
        },
    },
    preload: {
        plugins: [externalizeDepsPlugin()],
        build: {
            outDir: './dist/preload',
            emptyOutDir:true
        },
    },
    renderer: {
        build: {
            outDir: '../../dist/renderer',
            emptyOutDir:true
        },
    },
});
