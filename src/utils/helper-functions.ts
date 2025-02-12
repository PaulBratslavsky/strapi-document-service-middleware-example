/**
 * Converts a given title to title case.
 * @param title - The title to be converted.
 * @returns The title in title case.
 */

function toTitleCase(title: string): string {
  return title
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Extracts UTM parameters from the provided data.
 * @param data - The data object containing UTM parameters.
 * @returns An object containing the extracted UTM parameters.
 */
function extractUtmParams(data) {
  return {
    utm_source: data?.utm_source,
    utm_campaign: data?.utm_campaign,
  };
}

/**
 * Validates the base URL.
 * @param baseUrl - The base URL to validate.
 */
function validateBaseUrl(baseUrl: string) {
  if (!baseUrl) {
    console.error("Base URL is required");
    throw new Error("Base URL is required");
  }
}

/**
 * Constructs a full URL with UTM parameters.
 * @param slug - The original slug.
 * @param baseUrl - The base URL to append the slug to.
 * @param params - The UTM parameters to be added.
 * @returns The full URL with UTM parameters.
 */
function constructUrlWithParams(slug: string, baseUrl: string, params: Record<string, string>): string {
  validateBaseUrl(baseUrl);
  const queryString = new URLSearchParams(params).toString();
  const url = new URL(slug, baseUrl);
  url.search = queryString;
  return url.href;
}

/**
 * Notifies the author via email about the title.
 * @param author - The author's email address.
 * @param title - The title to notify about.
 */
function notifyAuthorByEmail(author: string, title: string) {
  /*
   * Notifying author about the title.
   * This function logs the notification to the console.
   */
  console.log(`Notifying author ${author} about ${title}`);
}

/**
 * Logs changes made to a document.
 * @param result - The result of the document changes.
 * @param action - The action performed (create/update).
 * @param user - The user who performed the action.
 */
async function logChanges(result: any, action: string, user: any) {
  // Get the admin user
  const adminUser = await strapi.documents("admin::user").findFirst({
    filters: {
      id: user,
    },
  });

  // Create the log

  const response = await strapi.documents("api::log.log").create({
    data: {
      action: action as "create" | "update",
      json: JSON.stringify(result),
      fullName: `${adminUser.firstname} ${adminUser.lastname}`,
      email: adminUser.email,
    },
  });

  console.log("Log: ", response);
}

export { toTitleCase, extractUtmParams, validateBaseUrl, constructUrlWithParams, notifyAuthorByEmail, logChanges };
