import { MatchToken, RegExpMatchArrayLike, RegExpToken, Token } from 'match-to-token'

import * as LexerErrorCauses from './causes'

export { LexerErrorCauses }

export { RegExpToken }

export type { MatchToken, RegExpMatchArrayLike, Token }

export interface LexerError extends Error {
  cause: LexerErrorCauses.UnexpectedToken
}

export class LexerError extends Error {
  name = 'LexerError'
  constructor(cause: Error) {
    super(cause.message, { cause })
  }
}

/**
 * Error handler.
 *
 * @param error The error object
 */
export type ErrorHandler = (error: LexerError) => void

/**
 * Filter function.
 *
 * @param token The token to match.
 * @returns `true` if it passes or `false` if it's rejected
 */
export type FilterFunction = (token: Token) => boolean

export type Tokenizer = (input: string) => IterableIterator<RegExpMatchArray>

/**
 * Lexer interface.
 */
export interface Lexer {
  /**
   * Returns token under current position and advances.
   */
  advance(): Token
  /**
   * Returns token under current position.
   * When passed a `group` and maybe a `value` it will only return
   * the token if they match, otherwise will return `null`.
   *
   * @param group The group name to examine
   * @param value The value to match
   */
  peek(): Token
  peek(group?: string, value?: string): Token | false
  /**
   * Advances position only when current `token.group` matches `group`,
   * and optionally when `token.value` matches `value`,
   * otherwise does nothing.
   *
   * @param group The group name to examine
   * @param value The value to match
   */
  accept(group: string, value?: string): Token | null
  /**
   * Same as accept() except it throws when `token.group` does not match `group`,
   * or (optionally) when `token.value` does not match `value`,
   *
   * @param group The group name to examine
   * @param value The value to match
   */
  expect(group: string, value?: string): Token

  /**
   * Sets a function to handle errors. The error handler accepts an {@link Error} object.
   */
  onerror(fn: ErrorHandler): void

  /**
   * Sets a filter function. The filter function receives a {@link Token} as first parameter.
   */
  filter(fn: FilterFunction): void
}

/**
 * Generate a {@link Lexer} for given input string.
 */
export type LexerFactory = (input: string) => Lexer

/**
 * Create a {@link LexerFactory} with the given {@link Tokenizer}.
 *
 * It can be anything that, when called with an `input` string, returns an interface that conforms to
 * the `IterableIterator<RegExpMatchArray>` type as is returned, for example,
 * by [`String.prototype.matchAll(regexp)`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/matchAll)
 *
 * @param tokenize A tokenizer Iterable factory.
 */
export const createLexer = (tokenize: Tokenizer) =>
  (input: string): Lexer => {
    const eof = MatchToken.create('', 'eof', { index: input.length, input })

    const it = tokenize(input)

    let last: Token
    let curr: Token

    //
    // error handling
    //

    let errorFn: ErrorHandler = (error: Error) => {
      throw error
    }

    const onerror = (fn: ErrorHandler) => {
      errorFn = fn
    }

    //
    // filter
    //

    let filterFn: FilterFunction = () => true

    const filter = (fn: FilterFunction) => {
      filterFn = fn
      // when we receive filter, try to see if the current token passes,
      // otherwise try to advance with our new filter using next()
      if (!filterFn(curr)) curr = next()
    }

    //
    // iterators
    //

    const next = () => {
      let token
      while ((token = it.next().value as Token)) {
        if (token && !filterFn(token)) continue
        break
      }
      if (!token) token = eof
      return token as Token
    }
    const advance = () => (([last, curr] = [curr, next()]), last)
    const peek = (group?: string, value?: string) => group != null ? curr.is(group, value) && curr : curr
    const accept = (group: string, value?: string) => (curr.is(group, value) ? advance() : null)
    const expect = (group: string, value?: string) => {
      const token = accept(group, value)
      if (!token) errorFn(new LexerError(new LexerErrorCauses.UnexpectedToken(curr, group, value)))
      return token
    }

    //
    // exports
    //

    advance() // initial advance is implicit

    return {
      onerror,
      filter,
      advance,
      peek,
      expect,
      accept,
    } as Lexer
  }

export default createLexer
