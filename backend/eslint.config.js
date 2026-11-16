import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist/**', 'node_modules/**'] },
  ...tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/ban-ts-comment': 'error',
      'no-restricted-imports': ['error', { patterns: ['@prisma/client'] }],
    },
  },
  {
    files: ['src/lib/prisma.ts', 'prisma/seed.ts'],
    rules: { 'no-restricted-imports': 'off' },
  },
);

