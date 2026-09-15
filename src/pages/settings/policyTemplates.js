/**
 * @module pages/settings/policyTemplates
 * @description Generic starter copy for each written policy's "Insert
 * template" button (Settings > Policies), plus the shared disclaimer text
 * shown above every editor. None of this is legal advice — it's placeholder
 * language a merchant is expected to review and adapt, same spirit as
 * Shopify's own policy templates but not legally vetted.
 */

export const TEMPLATE_DISCLAIMER =
  "This is a generic starter template, not legal advice. You're responsible for reviewing, editing, and " +
  'making sure the final policy is accurate and complies with the laws that apply to your business.';

function formatToday() {
  return new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

/** Store display name used inside template copy — falls back to a generic
 * placeholder when company data isn't available yet. */
function storeName(companyData) {
  return companyData?.brandName || companyData?.businessName || 'Our store';
}

const TEMPLATES = {
  policy_refund: (companyData) => `
    <p>Last updated: ${formatToday()}</p>
    <p>Thank you for shopping at ${storeName(companyData)}. If you are not entirely satisfied with your purchase, we're here to help.</p>
    <p><strong>Returns.</strong> You have 30 calendar days to return an item from the date you received it. To be eligible for a return, your item must be unused and in the same condition that you received it, in the original packaging.</p>
    <p><strong>Refunds.</strong> Once your return is received and inspected, we will notify you of the approval or rejection of your refund. If approved, your refund will be processed to your original method of payment within a certain number of days.</p>
    <p><strong>Cancellations.</strong> Orders can be cancelled before they are shipped. Contact us as soon as possible if you need to cancel an order.</p>
  `.trim(),
  policy_terms: (companyData) => `
    <p>Last updated: ${formatToday()}</p>
    <p>These Terms of Service govern your use of ${storeName(companyData)} and the purchase of products through our store. By accessing or using our services, you agree to be bound by these terms.</p>
    <p><strong>Use of the store.</strong> You agree to use this store only for lawful purposes and in a way that does not infringe the rights of others.</p>
    <p><strong>Orders and pricing.</strong> We reserve the right to refuse or cancel any order for any reason, including errors in pricing or product information.</p>
    <p><strong>Changes to these terms.</strong> We may update these Terms of Service from time to time; continued use of the store after changes means you accept the revised terms.</p>
  `.trim(),
  policy_shipping: (companyData) => `
    <p>Last updated: ${formatToday()}</p>
    <p>${storeName(companyData)} ships orders as quickly as possible after they're placed.</p>
    <p><strong>Processing time.</strong> Orders are typically processed within 1–3 business days.</p>
    <p><strong>Shipping methods.</strong> Delivery times vary depending on the shipping method selected at checkout and your location.</p>
    <p><strong>Shipping costs.</strong> Shipping charges are calculated at checkout based on weight, dimensions, and destination.</p>
  `.trim(),
  policy_legal: (companyData) => `
    <p>Last updated: ${formatToday()}</p>
    <p>This store is operated by ${storeName(companyData)}. This legal notice provides information required under applicable law.</p>
    <p><strong>Business information.</strong> [Legal business name, registration number, and registered address.]</p>
    <p><strong>Contact.</strong> [Contact email or phone number for legal inquiries.]</p>
  `.trim(),
  policy_contact: (companyData) => `
    <p>You can reach ${storeName(companyData)} using the details below.</p>
    <p><strong>Email:</strong> [Add your support email]</p>
    <p><strong>Phone:</strong> [Add your support phone number]</p>
    <p><strong>Address:</strong> [Add your registered business address]</p>
  `.trim(),
};

/** Returns the placeholder template HTML for a policy's `systemType`, or
 * `null` for kinds that don't offer one (Privacy is automated instead — see
 * buildAutomatedPrivacyPolicy). */
export function templateFor(systemType, companyData) {
  const build = TEMPLATES[systemType];
  return build ? build(companyData) : null;
}

/** Generates Privacy policy content the same way "Use automated policy"
 * does in Shopify — pulled from store info rather than a merchant-edited
 * template. Regenerated (via the modal's toggle) rather than persisted as
 * an editable draft as long as `automated` stays true. */
export function buildAutomatedPrivacyPolicy(companyData) {
  const name = storeName(companyData);
  return `
    <p>Last updated: ${formatToday()}</p>
    <p>${name} operates this store and website, including all related information, content, features, tools, products
    and services, in order to provide you, the customer, with a curated shopping experience (the "Services").</p>
    <p>This Privacy Policy describes how we collect, use, and disclose your personal information when you visit, use,
    or make a purchase or otherwise communicate with us.</p>
    <p>Please read this Privacy Policy carefully. By using and accessing any of the Services, you acknowledge that you
    have read this Privacy Policy and understand the collection, use, and disclosure of your information as described
    in this Privacy Policy.</p>
  `.trim();
}
