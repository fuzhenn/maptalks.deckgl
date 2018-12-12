const resolve = require('rollup-plugin-node-resolve');
const babel = require('rollup-plugin-babel');
const commonjs = require('rollup-plugin-commonjs');
const uglify = require('rollup-plugin-uglify').uglify;
const pkg = require('./package.json');

const production = process.env.BUILD === 'production';
const outputFile = production ? 'dist/maptalks.deck.js' : 'dist/maptalks.deck-dev.js';
const plugins = production ? [
    uglify({
        mangle: {
            properties: {
                'regex' : /^_/,
                'keep_quoted' : true
            }
        }
    })] : [];

const banner = `/*!\n * ${pkg.name} v${pkg.version}\n * LICENSE : ${pkg.license}\n * (c) 2016-${new Date().getFullYear()} maptalks.org\n */`;

module.exports = {
    input: 'src/index.js',
    plugins: [
        resolve({
            module : true,
            jsnext : true,
            main : true
        }),
        commonjs(),
        babel({
            exclude: 'node_modules/**'
        })
    ].concat(plugins),
    external : ['maptalks', '@deck.gl/core'],
    output: [
        {
            'sourcemap': production ? false : 'inline',
            'format': 'umd',
            'name': 'maptalks',
            'banner': banner,
            'extend' : true,
            'globals' : {
                'maptalks' : 'maptalks',
                '@deck.gl/core' : 'deck'
            },
            'file': outputFile
        }/* ,
        {
            'sourcemap': false,
            'format': 'es',
            'banner': banner,
            'file': pkg.module
        } */
    ]
};
