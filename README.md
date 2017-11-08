# swatchjs-batch-koa

[![CircleCI](https://circleci.com/gh/builtforme/swatchjs-batch-koa.svg?style=svg)](https://circleci.com/gh/builtforme/swatchjs-batch-koa) |
[![codecov](https://codecov.io/gh/builtforme/swatchjs-batch-koa/branch/master/graph/badge.svg)](https://codecov.io/gh/builtforme/swatchjs-batch-koa) | [![Coverage Status](https://coveralls.io/repos/github/builtforme/swatchjs-batch-koa/badge.svg?branch=master)](https://coveralls.io/github/builtforme/swatchjs-batch-koa?branch=master) | [![Known Vulnerabilities](https://snyk.io/test/github/builtforme/swatchjs-batch-koa/badge.svg)](https://snyk.io/test/github/builtforme/swatchjs-batch-koa)


An extension for [swatchjs]() to provide a method to invoke multiple API methods
at once in KOA server context.

## Quick start

All you have to do is add a few lines of code to your existing `swatchjs` code.
The sample below shows how to use the `swatchjs-batch-koa` with the simple API
from the `swatchjs` and `swatchjs-koa` README file:

```javascript
const swatch = require('swatchjs');
const swatchKoa = require('swatchjs-koa');
const batchKoa = require('swatchjs-batch-koa'); // add this line

const model = swatch({
    "numbers.add": (a, b) => Number(a) + Number(b),
    "numbers.sub": (a, b) => Number(a) - Number(b),
});
const batchModel = swatch({'batch': batchKoa(model)}); // add this line
const extendedModel = model.concat(batchModel); // optionally add this line

const app = Koa();
swatchKoa(app, extendedModel);
```

## API reference

### The `batch-koa` function

```javascript
const batchKoa = require('swatchjs-batch-koa');

const augmentedModel = batchKoa(model, name);
```

Loading this library will result in a function  (`batchKoa` in the example above)
which when called will return a handler that can be used with the `swatch`
function to produce a model for the API method that allows all other methods to
be invoked in a single network call.

The function exposed by the library takes the following parameters:

| Parameter | Required  | Description
|:---       |:---       |:---
| `model`   | Yes       | A model produced by by the `swatch` function (see [swatchjs](https://www.npmjs.com/package/swatchjs#api-reference))
| `name`    | No        | The name of the API method. Defaults to `batch`.

### Return value

The `batchKoa` method returns a handler that takes the following parameters:

| Parameter         | Required  | Description
|:---               |:---       |:---
|`ops`              | Yes       | An array of operations to batch.
|`ops[idx].method`  | Yes       | The method name.
|`ops[idx].args`    | Yes       | An object with the arguments to pass to the method.

The methods are not guaranteed to be executed in any particular order, and they
succeed or fail independently.

The response will be an array of responses, where each response has the
following properties:

| Property  | Present   | Description
|:---       |:---       |:---
|`ok`       | Always    | `true` if the method succeed, `false` otherwise.
|`result`   | Sometimes | Value returned by method handler if it succeeded and returned anything other than `undefined`.
|`error`    | Sometimes | Exception thrown by method handler when it failed.

## Runtime errors

The following errors will be generated during runtime (when invoking the handler):

| Error             | Error scope   | Description
|:---               |:---           |:---
|`invalid_request`  | Handler       | `ops` parameter was not valid.
|`invalid_method`   | Operation     | Specified method was not declared in the API.


## Developers

### Coding Style

This project follows the [AirBnB Javascript Coding Guidelines](https://github.com/airbnb/javascript) using [ESLint](http://eslint.org/) settings.
