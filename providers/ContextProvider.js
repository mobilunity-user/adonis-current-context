'use strict'

const { assign, map, isArray, isObject, isFunction, isUndefined } = require('lodash');
const { ServiceProvider } = require('@adonisjs/fold');

class ContextProvider extends ServiceProvider {
  _registerManager () {
    this.app.singleton('Context/Manager', () => {
      const ContextManager = require('../src/Manager');
      const { createHook, executionAsyncId } = require('async_hooks');

      return new ContextManager({ createHook, executionAsyncId });
    });
  }

  _registerService () {
    const { app } = this;
    const serviceNs = 'Context/Service';

    app.singleton(serviceNs, () => {
      const ContextManager = app.use('Context/Manager');
      const ContextService = require('../src/Service');

      return new ContextService(ContextManager);
    });

    app.alias(serviceNs, 'CurrentContext');
  }

  _registerMiddleware () {
    const { app } = this;
    const Server = app.use('Server');

    assign(Server.constructor.prototype, {
      _jsonifyResponse(content) {
        let _content = content;

        if (isObject(_content) && isFunction(_content.toJSON)) {
          _content = _content.toJSON();
        }

        if (isArray(_content)) {
          _content = map(_content,
            item => this._jsonifyResponse(item)
          );
        }

        return _content;
      },

      _safelySetResponse(response, content, method = 'send') {
        if (this._madeSoftResponse(response) || isUndefined(content)) {
          return;
        }

        response.send(this._jsonifyResponse(content));
      }
    });

    app.singleton('Context/Middleware', () => {
      const Middleware = require('../src/Middleware');
      const ContextManager = app.use('Context/Manager');

      return new Middleware(ContextManager);
    });
  }

  register () {
    this._registerManager();
    this._registerService();
    this._registerMiddleware();
  }

  boot () {
    const Server = this.app.use('Server');

    // this is before global middlewares registered in start/kernel.js
    Server.registerGlobal(['Context/Middleware']);
  }
}

module.exports = ContextProvider
