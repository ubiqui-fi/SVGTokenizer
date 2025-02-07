const path = require('path');

module.exports = {
    entry: './dist/code.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js',
    },
};
