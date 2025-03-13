import sonarjs from "eslint-plugin-sonarjs";
import prettier from "eslint-plugin-prettier";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default [{
    ignores: [
        "projects/**/*",
        "dist/**/*",
        "target/**/*",
        "node_modules/**/*",
        "cypress/**/*",
        "src/app/app-routing.module.ts",
        "src/app/app.component.spec.ts",
        "src/app/app.component.ts",
    ],
}, {
    settings: {
        "import/resolver": {
            node: {
                extensions: [".js", ".jsx", ".ts", ".tsx"],
            },
        },
    },
}, ...compat.extends(
    "plugin:@angular-eslint/recommended",
    "plugin:@angular-eslint/template/process-inline-templates",
    "plugin:sonarjs/recommended",
    "plugin:unicorn/recommended",
    "plugin:prettier/recommended",
).map(config => ({
    ...config,
    files: ["**/*.ts"],
})), {
    files: ["**/*.ts"],

    plugins: {
        sonarjs,
        prettier,
    },

    languageOptions: {
        parser: tsParser,
        ecmaVersion: 5,
        sourceType: "script",

        parserOptions: {
            project: ["tsconfig.json"],
            createDefaultProgram: true,
        },
    },

    rules: {
        "@angular-eslint/directive-selector": ["error", {
            type: "attribute",
            prefix: "app",
            style: "camelCase",
        }],

        "@angular-eslint/component-selector": ["error", {
            type: "element",
            prefix: "app",
            style: "kebab-case",
        }],

        "prettier/prettier": ["error", {
            endOfLine: "auto",
            printWidth: 120,
        }],

        "unicorn/no-array-for-each": "off",
        "unicorn/no-null": "off",
        "unicorn/prevent-abbreviations": "off",
        "sonarjs/cognitive-complexity": ["error", 18],
        "sonarjs/no-duplicate-string": ["error", 5],
    },
}, ...compat.extends("plugin:@angular-eslint/template/recommended").map(config => ({
    ...config,
    files: ["**/*.html"],
})), {
    files: ["**/*.html"],
    rules: {},
}, ...compat.extends("plugin:@angular-eslint/template/recommended").map(config => ({
    ...config,
    files: ["**/*.html"],
})), {
    files: ["**/*.html"],

    rules: {
        "@angular-eslint/template/attributes-order": ["error", {
            alphabetical: false,

            order: [
                "TEMPLATE_REFERENCE",
                "ATTRIBUTE_BINDING",
                "STRUCTURAL_DIRECTIVE",
                "INPUT_BINDING",
                "TWO_WAY_BINDING",
                "OUTPUT_BINDING",
            ],
        }],

        "@angular-eslint/template/no-interpolation-in-attributes": ["error"],
    },
}];