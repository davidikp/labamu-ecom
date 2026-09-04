// TODO engineer: replace with API call to GET /business-entities from Labamu Core
// Current list is Indonesia-specific (PT, CV, Individual, Firm)
// Must be fetched per country/locale when multi-country expansion begins

export const BUSINESS_ENTITIES = {
  PT:         'pt',
  CV:         'cv',
  INDIVIDUAL: 'individual',
  FIRM:       'firm',
};

export const BUSINESS_ENTITY_LABELS = {
  pt:         'dashboard:profile.entities.pt',
  cv:         'dashboard:profile.entities.cv',
  individual: 'dashboard:profile.entities.individual',
  firm:       'dashboard:profile.entities.firm',
};
