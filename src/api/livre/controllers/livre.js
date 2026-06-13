'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::livre.livre', ({ strapi }) => ({

  async find(ctx) {
      const userId = ctx.state.user.id;
       const livres = await strapi.documents('api::livre.livre').findMany({
          filters: { users_permissions_user: { id: userId } },
       populate: ['auteur', 'collections'],
    });
    return { data: livres, meta: { pagination: { total: livres.length } } };
  },

  async create(ctx) {
    const result = await super.create(ctx);

    // on rattache le user apres coup j'ai pas trouvé comment l'injecter avant

    if (result?.data?.documentId) {
         await strapi.documents('api::livre.livre').update({
        documentId: result.data.documentId,
        data: { users_permissions_user: ctx.state.user.id },
      });
    }
    return result;
  },

  async update(ctx) {
        const livre = await strapi.documents('api::livre.livre').findOne({
       documentId: ctx.params.id,
          populate: ['users_permissions_user'],
    });
    if (!livre || livre.users_permissions_user?.id !== ctx.state.user.id) {
       return ctx.forbidden("Action non autorisée");
    }
    return await super.update(ctx);
  },

  async delete(ctx) {
    const livre = await strapi.documents('api::livre.livre').findOne({
          documentId: ctx.params.id,
       populate: ['users_permissions_user'],
    });
    if (!livre || livre.users_permissions_user?.id !== ctx.state.user.id) {
       return ctx.forbidden("Action non autorisée");
    }
          return await super.delete(ctx);
  },

}));
