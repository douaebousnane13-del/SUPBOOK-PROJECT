'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::collection.collection', ({ strapi }) => ({



     async find(ctx) {
        const collections = await strapi.documents('api::collection.collection').findMany({
            filters: { users_permissions_user: { id: ctx.state.user.id } },

    });
 
    return { data: collections };
  },

  async create(ctx) {
    const result = await super.create(ctx);
    if (result?.data?.documentId) {
            await strapi.documents('api::collection.collection').update({
              documentId: result.data.documentId,

         data: { users_permissions_user: ctx.state.user.id },
      });
    }
    return result;
  },

  async delete(ctx) {
    const collection = await strapi.documents('api::collection.collection').findOne({
          documentId: ctx.params.id,

       populate: ['users_permissions_user'],
    });
    if (!collection || collection.users_permissions_user?.id !== ctx.state.user.id) {
         return ctx.forbidden("Vous ne pouvez pas supprimer cette collection");

    }
    return await super.delete(ctx);
  },

}));
