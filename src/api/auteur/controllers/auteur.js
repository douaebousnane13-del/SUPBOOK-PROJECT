'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::auteur.auteur', ({ strapi }) => ({

  async find(ctx) {
    try {
      const auteurs = await strapi.documents('api::auteur.auteur').findMany({
        filters: { users_permissions_user: { id: ctx.state.user.id } },
      });
      return { data: auteurs, meta: { pagination: { total: auteurs.length } } };
    } catch (err) {
      console.error("erreur find auteurs", err);
      return { data: [], meta: { pagination: { total: 0 } } };
    }
  },

  async create(ctx) {
    const result = await super.create(ctx);
    if (result.data && result.data.documentId) {
      await strapi.documents('api::auteur.auteur').update({
        documentId: result.data.documentId,
        data: { users_permissions_user: ctx.state.user.id },
      });
    }
    return result;
  },

  async delete(ctx) {
    const auteur = await strapi.documents('api::auteur.auteur').findOne({
       documentId: ctx.params.id,
       populate: ['users_permissions_user'],
    });
    if (!auteur || auteur.users_permissions_user?.id !== ctx.state.user.id) {
      return ctx.forbidden("Vous ne pouvez pas supprimer cet auteur");
    }

    // si on supprime diret ca case les relations sur les livres
    // donc on remet auteur a null avant
    
    const livres = await strapi.documents('api::livre.livre').findMany({
      filters: { auteur: { documentId: auteur.documentId } },
    });
    for (const livre of livres) {
      await strapi.documents('api::livre.livre').update({
        documentId: livre.documentId,
        data: { auteur: null },
      });
    }

    return await super.delete(ctx);
  },

}));
