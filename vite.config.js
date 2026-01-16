import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig(({ mode }) => {
    const isGameBuild = mode === 'game';

    return {
        base: './',
        publicDir: false, // We will handle copying manually to avoid confusion with Vite's default public behavior
        plugins: [
            {
                name: 'copy-assets-folder',
                closeBundle: async () => {
                    if (!isGameBuild) return;
                    const fs = await import('fs');
                    const path = await import('path');

                    const srcDir = path.resolve(__dirname, 'assets');
                    const destDir = path.resolve(__dirname, 'dist-game', 'assets');

                    // Recursive copy function
                    async function copyDir(src, dest) {
                        try {
                            await fs.promises.access(src);
                        } catch {
                            // Source doesn't exist, skip
                            return;
                        }

                        await fs.promises.mkdir(dest, { recursive: true });
                        const entries = await fs.promises.readdir(src, { withFileTypes: true });

                        for (let entry of entries) {
                            const srcPath = path.join(src, entry.name);
                            const destPath = path.join(dest, entry.name);

                            if (entry.isDirectory()) {
                                await copyDir(srcPath, destPath);
                            } else {
                                await fs.promises.copyFile(srcPath, destPath);
                            }
                        }
                    }

                    try {
                        await copyDir(srcDir, destDir);
                        console.log(`[copy-assets] Copied assets to ${destDir}`);
                    } catch (e) {
                        console.error('[copy-assets] Failed to copy assets:', e);
                    }
                },
            },
        ],
        build: {
            outDir: isGameBuild ? 'dist-game' : 'dist',
            lib: isGameBuild
                ? false
                : {
                      entry: path.resolve(__dirname, 'src/index.js'),
                      name: 'Gemmer',
                      fileName: format => `gemmer.${format}.js`,
                  },
            rollupOptions: isGameBuild
                ? {
                      input: {
                          main: path.resolve(__dirname, 'index.html'),
                      },
                  }
                : {},
        },
    };
});
