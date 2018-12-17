const { isUndefined, isFunction, isSymbol, isPlainObject, assign } = use('lodash');

const proxyHandler = {
  get(target, name) {
    if (isSymbol(name) || (name === 'inspect')) {
      return target[name];
    }

    if (!isUndefined(target[name])) {
      return target[name];
    }

    const context = target.get();

    if (isFunction(context[name])) {
      return context[name].bind(context);
    }

    return context[name];
  }
};

/**
 * Service proxies properties of current context
 */
class ContextService {
  /**
   * @param {Manager} manager
   */
  constructor(Manager) {
    assign(this, { manager: Manager });
    return new Proxy(this, proxyHandler);
  }

  /**
   * Gets current context object
   */
  get() {
    const { manager } = this;

    return manager.current;
  }

  /**
   * Updates current context
   * @param {string | object} keyOrData
   * @param {any} value
   */
  set(keyOrData, value = null) {
    if (isPlainObject(keyOrData)) {
      const context = this.get();

      assign(context, keyOrData);
      return;
    }

    this.updateContext({ [keyOrData]: value });
  }

  /**
   * Sets default context data
   * @param {object} defaultCtx
   */
  setDefault(defaultCtx) {
    const { manager } = this;

    manager.default = defaultCtx;
  }
}

module.exports = ContextService;
