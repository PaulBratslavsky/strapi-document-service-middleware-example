import slugify from "slugify";
import { toTitleCase, extractUtmParams, constructUrlWithParams, notifyAuthorByEmail, logChanges } from "./helper-functions";

const pageTypes = ["api::article.article"];
const pageActions = ["create", "update"];
const sendEmailActions = ["publish"];


const contentMiddleware = () => {
  return async (context, next) => {
    // Early return if the document type or action is not valid
    if (!pageTypes.includes(context.uid) || !pageActions.includes(context.action)) {
      return await next(); // Call the next middleware in the stack
    }

    const { data } = context.params; 
    const userId = data.updatedBy || data.createdBy; 

    // Convert the title to title case for better readability
    context.params.data.title = toTitleCase(data.title);

    // Generate a slug from the title for URL usage
    context.params.data.slug = slugify(data.title, { lower: true });

    const utmParams = extractUtmParams(data); // Extract UTM parameters from the data
    const baseUrl = data?.baseUrl; 
    
    // Add UTM parameters to the slug if they exist
    if (data?.utm_source || data?.utm_campaign) {
      context.params.data.utmLink = constructUrlWithParams(
        data.slug,
        baseUrl,
        utmParams
      ); 
    }
    
    // Log the changes made to the document
    await logChanges(context.params.data, context.action, userId);
    const result = await next(); // Call the next middleware in the stack

    return result; // Return the result of the middleware chain
  };
};

const emailNotificationMiddleware = () => {
  return async (context, next) => {
    // Check if the document type and action are valid for sending email notifications
    if (
      pageTypes.includes(context.uid) &&
      sendEmailActions.includes(context.action)
    ) {
      await notifyAuthorByEmail("test@test.com", "test title"); // Notify the author via email
    }

    return await next(); // Call the next middleware in the stack
  };
};

export { contentMiddleware, emailNotificationMiddleware };

