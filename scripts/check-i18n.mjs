import { createI18NReport } from "vue-i18n-extract";
import * as config from "./vue-i18n-extract.config.js";

try {
  await createI18NReport(config);
  console.log("i18n check passed!");
} catch (err) {
  const error = err instanceof Error ? err : new Error(String(err));
  console.error("i18n check failed:", error.message);
  process.exit(1);
}
