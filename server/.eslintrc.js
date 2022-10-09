module.exports = {
  env: {
    commonjs: true,
    es2021: true,
    node: true
  },
  extends: ['airbnb-base', 'prettier'],
  plugins: ['prettier'],
  overrides: [],
  parserOptions: {
    ecmaVersion: 'latest'
  },
  rules: {
    'prettier/prettier': [
      'error',
      // prettier rule for code formatting concerns
      {
        singleQuote: true,
        trailingComma: 'none',
        endOfLine: 'lf'
      }
    ],
    // eslint rules for code-quality concerns
    'no-underscore-dangle': 'off'
  }
};
