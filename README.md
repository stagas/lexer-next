<h1 align="center">lexer-next</h1>

<p align="center">
lexer for recursive descent parsers
</p>

<p align="center">
   <a href="#install">        🔧 <strong>Install</strong></a>
 · <a href="#example">        🧩 <strong>Example</strong></a>
 · <a href="#api">            📜 <strong>API docs</strong></a>
 · <a href="https://github.com/stagas/lexer-next/releases"> 🔥 <strong>Releases</strong></a>
 · <a href="#contribute">     💪🏼 <strong>Contribute</strong></a>
 · <a href="https://github.com/stagas/lexer-next/issues">   🖐️ <strong>Help</strong></a>
</p>

***

## Install

```sh
$ npm i lexer-next
```

## What's this?

It is a lexer generator for writing [Recursive descent parsers](https://en.wikipedia.org/wiki/Recursive_descent_parser) and is compatible with RegExp's **named group** matches as returned, for example, by [`String.prototype.matchAll()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/matchAll).

## Example

```ts
import { createLexer } from 'lexer-next'

const tokenize = (input: string) =>
  input.matchAll(/(?<ident>[a-z]+)|(?<number>[0-9]+)/g)

const lexer = createLexer(tokenize)

const { advance, peek, accept, expect } = lexer('hello 1337 world')

console.log(advance())
// => { group: 'ident', value: 'hello', index: 0 }

console.log(accept('ident'))
// => undefined

console.log(accept('number'))
// => { group: 'number', value: '1337', index: 6 }

console.log(peek())
// => { group: 'ident', value: 'world', index: 11 }

console.log(expect('number'))
// => SyntaxError: Unexpected token: world
//       expected: number
//   but received: ident "world"
//    at position: 11
```

## API

<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

#### Table of Contents

*   [createLexer](#createlexer)
    *   [Parameters](#parameters)
*   [Lexer](#lexer)
    *   [advance](#advance)
    *   [peek](#peek)
        *   [Parameters](#parameters-1)
    *   [accept](#accept)
        *   [Parameters](#parameters-2)
    *   [expect](#expect)
        *   [Parameters](#parameters-3)
    *   [onerror](#onerror)
        *   [Parameters](#parameters-4)
    *   [filter](#filter)
        *   [Parameters](#parameters-5)
*   [LexerFactory](#lexerfactory)
*   [ErrorHandler](#errorhandler)
    *   [Parameters](#parameters-6)
*   [FilterFunction](#filterfunction)
    *   [Parameters](#parameters-7)

### createLexer

[src/index.ts:114-211](https://github.com/stagas/lexer-next/blob/b27d28a9a520fab5d935455885dc2e1cbd153a6d/src/index.ts#L114-L211 "Source code on GitHub")

Create a [LexerFactory](#lexerfactory) with the given [LexerTokenizer](LexerTokenizer).

It can be anything that, when called with an `input` string, returns an interface that conforms to
the `IterableIterator<RegExpMatchArray>` type as is returned, for example,
by [`String.prototype.matchAll(regexp)`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/matchAll)

#### Parameters

*   `tokenize` **LexerTokenizer** A tokenizer Iterable factory.

### Lexer

[src/index.ts:55-98](https://github.com/stagas/lexer-next/blob/b27d28a9a520fab5d935455885dc2e1cbd153a6d/src/index.ts#L55-L98 "Source code on GitHub")

Lexer interface.

#### advance

[src/index.ts:59-59](https://github.com/stagas/lexer-next/blob/b27d28a9a520fab5d935455885dc2e1cbd153a6d/src/index.ts#L59-L59 "Source code on GitHub")

Returns token under current position and advances.

Returns **LexerToken**&#x20;

#### peek

[src/index.ts:68-68](https://github.com/stagas/lexer-next/blob/b27d28a9a520fab5d935455885dc2e1cbd153a6d/src/index.ts#L68-L68 "Source code on GitHub")

Returns token under current position.
When passed a `group` and maybe a `value` it will only return
the token if they match, otherwise will return `null`.

##### Parameters

*   `group`  The group name to examine
*   `value`  The value to match

Returns **LexerToken**&#x20;

#### accept

[src/index.ts:78-78](https://github.com/stagas/lexer-next/blob/b27d28a9a520fab5d935455885dc2e1cbd153a6d/src/index.ts#L78-L78 "Source code on GitHub")

Advances position only when current `token.group` matches `group`,
and optionally when `token.value` matches `value`,
otherwise does nothing.

##### Parameters

*   `group` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** The group name to examine
*   `value` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)?** The value to match

Returns **(LexerToken | null)**&#x20;

#### expect

[src/index.ts:86-86](https://github.com/stagas/lexer-next/blob/b27d28a9a520fab5d935455885dc2e1cbd153a6d/src/index.ts#L86-L86 "Source code on GitHub")

Same as accept() except it throws when `token.group` does not match `group`,
or (optionally) when `token.value` does not match `value`,

##### Parameters

*   `group` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** The group name to examine
*   `value` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)?** The value to match

Returns **LexerToken**&#x20;

#### onerror

[src/index.ts:92-92](https://github.com/stagas/lexer-next/blob/b27d28a9a520fab5d935455885dc2e1cbd153a6d/src/index.ts#L92-L92 "Source code on GitHub")

Sets a function to handle errors. The error handler accepts
an [Error](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error) object.

##### Parameters

*   `fn` **[ErrorHandler](#errorhandler)**&#x20;

Returns **void**&#x20;

#### filter

[src/index.ts:97-97](https://github.com/stagas/lexer-next/blob/b27d28a9a520fab5d935455885dc2e1cbd153a6d/src/index.ts#L97-L97 "Source code on GitHub")

Sets a filter function. The filter function accepts a [LexerToken](LexerToken).

##### Parameters

*   `fn` **[FilterFunction](#filterfunction)**&#x20;

Returns **void**&#x20;

### LexerFactory

[src/index.ts:103-103](https://github.com/stagas/lexer-next/blob/b27d28a9a520fab5d935455885dc2e1cbd153a6d/src/index.ts#L100-L102 "Source code on GitHub")

Generate a [Lexer](#lexer) for given input string.

Type: function (input: [string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)): [Lexer](#lexer)

### ErrorHandler

[src/index.ts:14-14](https://github.com/stagas/lexer-next/blob/b27d28a9a520fab5d935455885dc2e1cbd153a6d/src/index.ts#L9-L13 "Source code on GitHub")

Error handler.

Type: function (error: [Error](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)): void

#### Parameters

*   `error`  The error object

### FilterFunction

[src/index.ts:22-22](https://github.com/stagas/lexer-next/blob/b27d28a9a520fab5d935455885dc2e1cbd153a6d/src/index.ts#L16-L21 "Source code on GitHub")

Filter function.

Type: function (token: LexerToken): [boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)

#### Parameters

*   `token`  The token to match.

Returns **any** `true` if it passes or `false` if it's rejected

## Contribute

[Fork](https://github.com/stagas/lexer-next/fork) or
[edit](https://github.dev/stagas/lexer-next) and submit a PR.

All contributions are welcome!

## License

MIT © 2021
[stagas](https://github.com/stagas)
