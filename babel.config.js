export default {
   //presets: ['@babel/preset-env'],
 //   presets: [['@babel/preset-env', {modules: false}]],

    presets: [
        [
            '@babel/preset-env',
            {
                targets: {
                    node: 'current',
                },
            },
        ],
    ],
    plugins: [
        '@babel/plugin-transform-modules-commonjs',
        ["babel-plugin-transform-import-meta", { "module": "ES6" }]
    ]
};

