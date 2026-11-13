/** Server-side feature flags. Financial features default to OFF. */
const on = (k: string, d = false) => {
  const v = process.env[k];
  return v === undefined ? d : v === "true" || v === "1";
};
export const features = {
  registration: () => on("FEATURE_REGISTRATION", true),
  kyc: () => on("FEATURE_KYC", false),
  fundingRequests: () => on("FEATURE_FUNDING_REQUESTS", false),
  demo: () => on("FEATURE_DEMO_ENVIRONMENT", false),
};
