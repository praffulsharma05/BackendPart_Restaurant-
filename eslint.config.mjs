import js from "@eslint/js";
import globals from "globals";
import jsdoc from "eslint-plugin-jsdoc";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "dist/**",
      "node_modules/**"
    ]
  },
  js.configs.recommended,
  jsdoc.configs['flat/recommended'],
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.node,
      },
    },
    plugins: {
      jsdoc,
    },
    rules: {
      "jsdoc/require-jsdoc": ["warn", {
        "publicOnly": false,
        "require": {
          "FunctionDeclaration": true,
          "MethodDefinition": true,
          "ClassDeclaration": true,
          "ArrowFunctionExpression": false,
          "FunctionExpression": true
        },
        "contexts": [
          "VariableDeclarator > ArrowFunctionExpression",
          "Property > FunctionExpression",
          "Property > ArrowFunctionExpression"
        ]
      }],
      "jsdoc/require-description": "warn",
      "jsdoc/require-param-description": "warn",
      "jsdoc/require-returns-description": "warn",
      "max-lines-per-function": ["warn", {
        "max": 50, "skipBlankLines": true, "skipComments": true
      }],
      "max-len": ["warn", { "code": 500, "ignoreUrls": true }],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
      "jsdoc/require-param-type": "off",
      "jsdoc/require-returns-type": "off"
    }
  },
  {
    files: ["**/*.js"],
    extends: [tseslint.configs.disableTypeChecked],
  }
);
