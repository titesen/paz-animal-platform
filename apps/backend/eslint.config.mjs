import rootConfig from "../../eslint.config.mjs";
import security from "eslint-plugin-security";

export default [
  ...rootConfig,
  security.configs.recommended,
  {
    rules: {
      // Backend-specific: tighten security rules
      "security/detect-object-injection": "warn",
      "security/detect-non-literal-fs-filename": "warn",
      "security/detect-possible-timing-attacks": "warn",
    },
  },
];
