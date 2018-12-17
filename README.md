# Context Provider for the Adonis Framework

A context provider for [Adonis][0] based on [`async_hooks`][1] used to provide current HTTP and/or websocket context for services.

## Installation

```
adonis install adonis-current-context
```

After installing the package, make sure to follow the directions in
[instructions.md](instructions.md) on how to set up the provider.

## Usage

### Request Context

Be default, the provider will ensure that each HTTP request is executed in a
unique context. Getting an instance of `Context` anywhere within the request
lifecyle will return an current request context object.

#### Example

```js
class SomeService {
  static get inject () {
    return ['CurrentContext'];
  }

  constructor (context) {
    this.currentCtx = context;
  }

  async someMethod() {
    const { someKey } = this.currentCtx;

    return someKey;
  }
}

class SomeMiddleware {
  async handle (context, next) {
    context.someKey = 'someValue';

    await next();
  }
}

class SomeController {
  static get inject() {
    return ['SomeService'];
  }

  constructor(service) {
    this.service = service;
  }

  async someAction() {
    const someKey = await this.service.someMethod();

    return { someKey };
  }
}

const namedMiddleware = {
  someMiddleware: 'App/Http/Middleware/SomeMiddleware'
};

Route
  .get('/some/action', 'SomeController.someAction')
  .middleware(['someMiddleware']);
```

```bash
> curl http://localhost:3333/some/action
HTTP/1.1 200 OK
Content-Type: application/json; charset: UTF-8
{"someKey": "someValue"}
```

### Default Context

A default context exists that will be used whenever `Context` is resolved
outside of a current context. This makes it easy to write code that works with
or without context. By default the store is empty, but it can be initialized
with some data in bootstraping hooks, or a service provider's boot method.

```js
const manager = use('Context/Manager');

manager.default = {foo : 'somedefaultvalue'};

// or
const currentCtx = use('CurrentContext');

currentCtx.setDefault({foo : 'somedefaultvalue'});
```

## Disclaimers

Using context may not be right for all projects. There are a few things you
should be aware of before using it.

### Pre-release

This package has not been tested extensively yet. Make sure you test thoroughly
before deploying it in a production application. If you try it out, I would
appreciate feedback.

### `async_hooks` API stability

This package is based on the Node.js [`async_hooks`][1] API. It is currently
listed as `Stability: 1 - Experimental`. With that being said, it has been in
the works for a long time. I would be surprised to see a lot of change.

> The async_hooks module provides an API to register callbacks tracking the
> lifetime of asynchronous resources created inside a Node.js application.

### Performance

I have not run any real world benchmarks yet, but it is expected that there will
be some performace cost of tracking context with `async_hooks`. The performance
of `async_hooks` and ways that it can be improved are currently being discussed
(see https://github.com/nodejs/benchmarking/issues/181).

## License

Copyright 2018 Brent Burgoyne, Copyright 2018 Mobilunity

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

[0]: https://adonisjs.com
[1]: https://nodejs.org/dist/latest-v10.x/docs/api/async_hooks.html
