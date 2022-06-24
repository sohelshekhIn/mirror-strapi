'use strict';

/**
 * mark service.
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::mark.mark');
