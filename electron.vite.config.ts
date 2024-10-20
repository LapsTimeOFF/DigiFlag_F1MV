import {defineConfig, externalizeDepsPlugin} from 'electron-vite';
export default defineConfig({
    main: {
        plugins: [externalizeDepsPlugin()],
        build: {
            outDir: './dist/main',
            emptyOutDir: true,
            rollupOptions: {
                output: {
                    format: 'es',
                },
            },
        },
    },
    preload: {
        plugins: [externalizeDepsPlugin()],
        build: {
            outDir: './dist/preload',
            emptyOutDir: true,
            rollupOptions: {
                output: {
                    format: 'cjs',
                },
            },
        },
    },
    renderer: {
        build: {
            outDir: './dist/renderer',
            emptyOutDir: true,
        },
    },
});
