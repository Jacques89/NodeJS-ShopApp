module.exports = {
  root: true,
  extends: [],
  plugins: ['prettier'],
  parserOptions: {
    ecmaVersion: 2016,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: false,
    },
  },
  env: {
    es6: true,
    node: true,
  },
  rules: {
    semi: ['error', 'never'],
  },
}
