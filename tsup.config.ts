import { defineConfig } from 'tsup'

export default defineConfig([
  {
    entry: {
      index: 'src/index.ts'
    },
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    clean: true,
    splitting: false,
    treeshake: true,
    target: 'es2020',
    platform: 'node',
    outDir: 'dist',
    tsconfig: 'tsconfig.build.json',
    outExtension({ format }) {
      return { js: format === 'esm' ? '.mjs' : '.cjs' }
    }
  },
  {
    entry: {
      cli: 'src/cli/index.ts'
    },
    format: ['esm'],
    dts: false,
    sourcemap: true,
    clean: false,
    splitting: false,
    treeshake: true,
    target: 'es2020',
    platform: 'node',
    outDir: 'dist',
    tsconfig: 'tsconfig.build.json',
    outExtension() {
      return { js: '.mjs' }
    }
  }
])
