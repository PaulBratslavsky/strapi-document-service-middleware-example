import type { Core } from '@strapi/strapi';
import { contentMiddleware, emailNotificationMiddleware } from './utils/document-service-middlewares';


export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register({ strapi }: { strapi: Core.Strapi }) {
    const middlewares = [contentMiddleware, emailNotificationMiddleware];

    middlewares.forEach((middleware) => {
      strapi.documents.use(middleware());
    });
  },

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  bootstrap(/* { strapi }: { strapi: Core.Strapi } */) {},
};
