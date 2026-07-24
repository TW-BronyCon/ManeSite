import { createI18NReport } from "vue-i18n-extract";
import * as config from "./vue-i18n-extract.config.js";

try {
  createI18NReport(config);
  console.log("i18n check passed!");
} catch (err) {
  console.error("i18n check failed:", err.message);
  process.exit(1);
}
