import slugify from "slugify";

const pageTypes = ["api::article.article"];
const pageActions = ["create", "update"];
const sendEmailActions = ["publish"];

function toTitleCase(title: string): string {
  return title
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function extractUtmParams(data) {
  return {
    utm_source: data?.utm_source,
    utm_campaign: data?.utm_campaign,
  };
}

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

function notifyAuthorByEmail(author, title) {
  /*
   * Notifying author about the title.
   * This function logs the notification to the console.
   */
  console.log(`Notifying author ${author} about ${title}`);
}

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

  console.log("Log something", response);
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

      const utmParams = extractUtmParams(data);
      const baseUrl = data?.baseUrl;
      
      // Add UTM params to the slug
      if (data?.utm_source || data?.utm_campaign) {
        context.params.data.utmLink = addUtmParams(
          data.slug,
          baseUrl,
          utmParams
        );
      }

      // Convert title to title case
      context.params.data.title = toTitleCase(data.title);

      // Convert title to slug
      context.params.data.slug = slugify(data.title, { lower: true });

      // Log changes
      logChanges(context.params.data, action, userId);
    }

    console.log("Before next");

    const result = await next();

    console.log("After next");

    if (
      pageTypes.includes(context.uid) &&
      sendEmailActions.includes(context.action)
    ) {
      await notifyAuthorByEmail("test@test.com", "test title");
    }

    return result;
  });
};
