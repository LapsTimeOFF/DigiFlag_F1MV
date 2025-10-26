import viteImagemin from '@vheemstra/vite-plugin-imagemin';
import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import imagemingifsicle from 'imagemin-gifsicle';
import imageminWebp from 'imagemin-webp';
export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
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
      emptyOutDir: true,
      rollupOptions: {
        output: {
          format: 'cjs',
        },
      },
    },
  },
  renderer: {
    plugins: [
      viteImagemin({
        plugins: {
          png: imageminWebp({
            method: 6,
          }),
          gif: imagemingifsicle({
            optimizationLevel: 3,
            interlaced: true,
          }),
        },
        cache: true,
        root: './out/renderer',
      }),
    ],
    build: {
      emptyOutDir: true,
    },
  },
});
