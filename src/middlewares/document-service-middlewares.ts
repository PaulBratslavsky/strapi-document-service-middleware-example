import slugify from "slugify";

const pageTypes = ["api::article.article"];
const pageActions = ["create", "update"];
const sendEmailActions = ["publish"];

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
 * Adds UTM parameters to a given slug and base URL.
 * @param slug - The original slug.
 * @param baseUrl - The base URL to append the slug to.
 * @param params - The UTM parameters to be added.
 * @returns The full URL with UTM parameters.
 */
function addUtmParams(
  slug: string,
  baseUrl: string,
  params: Record<string, string>
): string {
  if (!baseUrl) console.error("Base URL is required");
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

export const registerDocServiceMiddleware = ({ strapi }) => {
  
  let action = ""; 
  let userId = null; 

  strapi.documents.use(async (context, next) => {
    if (
      pageTypes.includes(context.uid) && 
      pageActions.includes(context.action) 
    ) {
      const { data } = context.params; 
      action = context.action; 
      userId = data.updatedBy || data.createdBy; 

      // Convert the title to title case for better readability
      context.params.data.title = toTitleCase(data.title);

      // Generate a slug from the title for URL usage
      context.params.data.slug = slugify(data.title, { lower: true });

      const utmParams = extractUtmParams(data); // Extract UTM parameters from the data
      const baseUrl = data?.baseUrl; 
      
      // Add UTM parameters to the slug if they exist
      if (data?.utm_source || data?.utm_campaign) {
        context.params.data.utmLink = addUtmParams(
          data.slug,
          baseUrl,
          utmParams
        ); 
      }
      
      // Log the changes made to the document
      logChanges(context.params.data, action, userId);
      
    }

    console.log("Before next"); // Log before proceeding to the next middleware

    const result = await next(); // Call the next middleware in the stack

    console.log("After next"); // Log after returning from the next middleware

    // Check if the document type and action are valid for sending email notifications
    if (
      pageTypes.includes(context.uid) &&
      sendEmailActions.includes(context.action)
    ) {
      await notifyAuthorByEmail("test@test.com", "test title"); // Notify the author via email
    }

    return result; // Return the result of the middleware chain
  });
};
