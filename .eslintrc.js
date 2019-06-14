module.exports = {
    "env": {
        "es6": true,
        "node": true
    },
    "extends": "eslint:recommended",
    "parser": "babel-eslint",
    "parserOptions": {
        "sourceType": "module"
    },
    "rules": {
        "indent": [
            "off",  //off warn error 
            2
        ],
        "linebreak-style": [
            "off",
            "unix"
        ],
        "quotes": [
            "warn",
            "single"
        ],
        "semi": [
            "warn",
            "never"
        ],
        "no-console": "off",
        "no-unused-vars": ["warn", { "vars": "all", "args": "after-used", "ignoreRestSiblings": false }]


    }
};