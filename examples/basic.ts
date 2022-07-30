import { createLexer } from '../src'

const tokenize = (input: string) => input.matchAll(/(?<ident>[a-z]+)|(?<number>[0-9]+)/g)

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
