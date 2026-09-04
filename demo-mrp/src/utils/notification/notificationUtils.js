export const getEnabledNotificationRuleIds = (settings = []) =>
  new Set(
    settings.flatMap((section) =>
      (section.items || [])
        .filter((item) => item.enabled)
        .map((item) => item.id)
    )
  );
