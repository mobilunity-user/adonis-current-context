'use strict';

/**
 * Middleware executes the rest of the middleware stack in an async context
 */
class ContextMiddleware {
  /**
   * @param {Manager} manager
   */
  constructor (manager) {
    this.manager = manager;
  }

  /**
   * Handle request
   *
   * @param {Adonis/Src/Context} context
   * @param {function(): Promise} next
   */
  async handle (context, next) {
    await this.manager.run(context, next);
  }
}

module.exports = ContextMiddleware;
