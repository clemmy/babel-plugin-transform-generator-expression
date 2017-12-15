# babel-plugin-transform-generator-expression

> Supports [ECMAScript Generator Expressions](https://github.com/sebmarkbage/ecmascript-generator-expression)

## Detail

> A convenient way of generating arrays/sets/maps of values in a contained expression. It's an alternative to array comprehensions and designed to pair well with do expressions. I think of it as the multi-value form of do-expressions.

from [ECMAScript Generator Expressions Proposal](https://github.com/sebmarkbage/ecmascript-generator-expression)

In order to use this API, you must also be using a version of Babylon that supports GeneratorExpression nodes, such as the one found [here](https://github.com/clemmy/babylon/tree/general-gexp-6.18).

You can alternatively experiment with the syntax on this [CodePen](https://codepen.io/clemmy/pen/zpGaNv?editors=1000).

### Examples

```js
var odds = *{
  for (var i = 1; i < 10; i += 2) {
    yield i;
  }
}; // => 1, 3, 5, 7, 9 
```

```js
var THRESHOLD = 5;
var under = *{
  for (var i = 0; i < 10; ++i) {
    if (i === THRESHOLD) {
      break;
    }
    yield i;
  }
} // => 0, 1, 2, 3, 4
```

## Installation

```sh
npm install --save-dev babel-plugin-transform-generator-expressions babel-plugin-transform-do-expressions
```

## Usage

### Via `.babelrc` (Recommended)

**.babelrc**

```json
{
  "plugins": ["transform-do-expressions", ["transform-generator-expressions", { "enableCompletionValue", false }]]
}
```

### Via CLI

```sh
babel --plugins transform-do-expressions,transform-generator-expressions script.js
```

### Via Node API

```javascript
require("babel-core").transform("code", {
  plugins: ["transform-do-expressions", ["transform-generator-expression", { enableCompletionValue: false }]]
});
```

## Options

### `enableCompletionValue`

`boolean`, defaults to `false`.

This option makes the generator expression implicitly complete with the completion value of its contained statements, as defined by the proposal. However, this is a bit buggy right now. See [note](notes).

## Notes

Because it's not yet clear whether [do expressions work like IFFE's or blocks](https://github.com/tc39/proposal-do-expressions/issues/5#issuecomment-351860849), [Babel's do expression transform](https://github.com/babel/babel/tree/master/packages/babel-plugin-proposal-do-expressions) is not particularly consistent about this behavior, which we rely on.

## Related Work

I made a proposal to use this in JSX as an alternative to the usual `JSXExpressions`. You can check out some CodePen examples [here](https://github.com/facebook/jsx/pull/99). It uses an optimized version with `Array.push()` instead of generators.
