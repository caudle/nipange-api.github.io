module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true,
    commonjs: true,
    es2021: true,
  },
  extends: [
    'airbnb-base',
  ],
  parserOptions: {
    ecmaVersion: 12,
  },
  rules: {
    'import/extensions': [0, {
      js: 'always',
    }],

  },
};
