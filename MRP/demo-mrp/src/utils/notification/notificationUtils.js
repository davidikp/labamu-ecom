import { PERSONAL_PREFERENCE_OPTIONS } from "../../data/notification/notificationDefaults.js";

// Company default status for a rule: "on" when at least one channel is enabled
// in the company settings, else "off". Required rules are always on.
export const companyStatusOf = (rule, companySettings) => {
  if (rule.type === "required") return "on";
  const s = companySettings?.[rule.id];
  return s && (s.inApp || s.email) ? "on" : "off";
};

// Effective notification status for a user, combining the company default with
// the user's personal preference (PRD Personal Notification Preferences, AC #3):
//   required                    → On (source: required)
//   preference On               → On (source: your override)
//   preference Off              → Off (source: your override)
//   preference Use Company Def. → follows company default (source: company default)
export const resolveEffectiveStatus = (rule, companySettings, personalPrefs) => {
  if (rule.type === "required") {
    return { status: "on", source: "required" };
  }
  const pref =
    personalPrefs?.[rule.id]?.preference ||
    PERSONAL_PREFERENCE_OPTIONS.useCompanyDefault;

  if (pref === PERSONAL_PREFERENCE_OPTIONS.on) {
    return { status: "on", source: "override" };
  }
  if (pref === PERSONAL_PREFERENCE_OPTIONS.off) {
    return { status: "off", source: "override" };
  }
  return { status: companyStatusOf(rule, companySettings), source: "company" };
};

// Human-readable label for the effective-status source indicator.
export const effectiveSourceLabel = (source) => {
  if (source === "override") return "Your override";
  if (source === "required") return "Required";
  return "Company default";
};

// Validation for the "at least one delivery channel" rule (Company AC #6 /
// Personal AC #8): a configurable rule that is On must have In-app or Email
// enabled. Returns an array of offending rule ids (empty when valid).
export const findChannellessEnabledRules = (rules, channelStateOf) =>
  rules
    .filter((rule) => rule.type !== "required")
    .filter((rule) => {
      const channels = channelStateOf(rule);
      return channels?.enabled && !channels.inApp && !channels.email;
    })
    .map((rule) => rule.id);
