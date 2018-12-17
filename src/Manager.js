const { assign } = require('lodash');

'use strict';

/**
 * Manages async hooks for tracking context
 */
class ContextManager {
  /**
   * @param {creatHook: function, executionAsyncId: function} asyncApi
   */
  constructor({ createHook, executionAsyncId }) {
    const { _hooks } = this;
    const _default = {};

    assign(this, {
      eid: executionAsyncId,
      contexts: new Map(),
      _current: _default,
      _default
    });

    createHook(_hooks).enable();
  }

  /**
   * Run an async function inside a new context.
   * @param {Adonis/Src/Context | Adonis/Addons/WsContext} context
   * @param {function(): Promise} operations
   * @return {Promise}
   */
  async run(context, operations) {
    return new Promise((resolve, reject) =>
      process.nextTick(() => {
        const { _current, contexts } = this;
        const eid = this.eid();

        contexts.set(eid, this._current = context);
        operations().then(resolve).catch(reject);
        this._current = _current;
      }
    ));
  }

  /**
   * @property {object} current
   */
  get current() {
    const { _current, _default } = this;

    return _current || _default;
  }

  /**
   * @property {object} default
   */
  get default() {
    return this._default;
  }

  set default(value) {
    const { _current, _default } = this;

    if (value !== _default) {
      return;
    }

    if (_current === _default) {
      this._current = value;
    }

    this._default = value;
  }

  /**
   * @private
   */
  get _hooks() {
    return {
      init: id => {
        const { contexts } = this;
        const eid = this.eid();

        if ((id !== eid) && contexts.has(eid)) {
          contexts.set(id, contexts.get(eid));
        }
      },

      before: id => {
        const { contexts } = this;

        if (!contexts.has(id)) {
          this._current = this.default;
          return;
        }

        this._current = contexts.get(id);
      },

      after: () => {
        this._current = this.default;
      },

      destroy: id => {
        this.contexts.delete(id);
      }
    };
  }
}

module.exports = ContextManager;
