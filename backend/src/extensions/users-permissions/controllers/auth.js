'use strict';

const { sanitizeEntity } = require('@strapi/utils');
const sanitizeHtml = require('sanitize-html');

module.exports = {
  async register(ctx) {
    const pluginUsersPermissions = strapi.plugin('users-permissions');
    const userService = pluginUsersPermissions.service('user');
    const authService = pluginUsersPermissions.service('auth');

    const params = {
      ...ctx.request.body,
      provider: 'local',
    };

    // 🚨 Sanitizar el username aquí
    if (params.username) {
      params.username = sanitizeHtml(params.username, {
        allowedTags: [],
        allowedAttributes: {}
      });
    }

    const user = await userService.add(params);

    const sanitizedUser = await sanitizeEntity(user, {
      model: strapi.getModel('plugin::users-permissions.user'),
    });

    const jwt = authService.createJwtToken(sanitizedUser);

    return ctx.send({
      jwt,
      user: sanitizedUser,
    });
  },
};
