'use strict';

module.exports = {
  "overrides": [
    {
      "files": [
        "test/**/*.js"
      ],
      "plugins": [
        "mocha"
      ],
      "env": {
        "mocha": true
      },
      "rules": {
        "mocha/no-exclusive-tests": "error",
        "mocha/no-global-tests": "error",
        "mocha/handle-done-callback": "error",
        "mocha/max-top-level-suites": [
          "warn",
          {
            "limit": 2
          }
        ],
        "mocha/no-identical-title": "error",
        "mocha/no-mocha-arrows": "error",
        "mocha/no-nested-tests": "error",
        "mocha/no-pending-tests": "error",
        "mocha/no-return-and-callback": "error",
        "mocha/no-return-from-async": "error",
        "mocha/no-setup-in-describe": "error",
        "mocha/no-sibling-hooks": "error",
        "mocha/no-skipped-tests": "error",
        "mocha/no-top-level-hooks": "error",
        "mocha/no-async-describe": "error",
        "node/no-unpublished-require": 0,
        "node/no-missing-require": 0,
        "prefer-arrow-callback": "off",
        "no-unused-expressions": "off",
        "func-names": "off"
      }
    }
  ]
}
