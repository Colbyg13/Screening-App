// .eslintrc.js
module.exports = {
    root: true,
    parser: '@babel/eslint-parser',
    parserOptions: {
        ecmaVersion: 2021,
        sourceType: 'module',
        requireConfigFile: false,
        babelOptions: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
        },
    },
    env: {
        browser: true,
        node: true,
        es2021: true,
    },
    extends: [
        'eslint:recommended',
        'plugin:react/recommended',
        'plugin:jsx-a11y/recommended',
        'plugin:prettier/recommended',
    ],
    plugins: ['react', 'jsx-a11y'],
    rules: {
        // Add your project-specific rules here
    },
    settings: {
        react: {
            version: 'detect',
        },
    },
}
