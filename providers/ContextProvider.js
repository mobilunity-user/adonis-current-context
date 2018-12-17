'use strict'

const { ServiceProvider } = require('@adonisjs/fold')

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

    app.singleton('Context/Middleware', () => {
      const Middleware = require('../src/Middleware');
      const ContextManager = app.use('Context/Manager');

      return new Middleware(ContextManager);
    });
  }

  register () {
    this._registerManager()
    this._registerService()
    this._registerMiddleware()
  }

  boot () {
    // this is before global middlewares registered in start/kernel.js
    this.app.use('Server').registerGlobal(['Context/Middleware'])
  }
}

module.exports = ContextProvider
