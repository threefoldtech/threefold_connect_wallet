import typescript from 'rollup-plugin-typescript2';
import ttypescript from 'ttypescript';

import json from '@rollup/plugin-json';

const config = [
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.js',
      format: 'cjs',
      sourcemap: true,
      exports: 'auto'
    },
    external: ['axios', 'os', 'url', 'tweetnacl', 'tweetnacl-util', 'libsodium-wrappers'],
    plugins: [
      typescript({
        typescript: ttypescript,
        useTsconfigDeclarationDir: true,
        emitDeclarationOnly: true,
      }),
      json(),
    ],
  },
];
export default config;
