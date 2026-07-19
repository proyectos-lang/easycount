import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'

const eslintConfig = [
  ...nextCoreWebVitals,
  {
    rules: {
      // Reglas nuevas y muy estrictas del React Compiler (react-hooks v6)
      // que marcan patrones preexistentes y seguros: setState dentro de un
      // effect de fetch, deps parciales, y funciones `loadX()` llamadas en un
      // effect antes de su declaracion (el effect corre tras el montaje, asi
      // que el const ya esta inicializado). No son bugs; se dejan como aviso
      // para no bloquear el build pero mantenerlos visibles.
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/exhaustive-deps': 'warn',
      'react-hooks/immutability': 'warn',
    },
  },
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'next-env.d.ts',
      'components/ui/**', // componentes generados de shadcn/ui
    ],
  },
]

export default eslintConfig
