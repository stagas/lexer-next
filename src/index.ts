import { matchToToken, Token } from 'match-to-token'

export interface LexerToken extends Token {
  source: {
    input: string
  }
}

export type LexerTokenReturn = LexerToken | void

/**
 * Error handler.
 *
 * @param error The error object
 */
export type ErrorHandler = (error: Error) => void

/**
 * Filter function.
 *
 * @param token The token to match.
 * @returns `true` if it passes or `false` if it's rejected
 */
export type FilterFunction = (token?: LexerTokenReturn) => boolean

export class UnexpectedTokenError extends SyntaxError {
  currentToken: LexerTokenReturn
  expectedGroup: string
  expectedValue?: string

  constructor(
    currentToken: LexerTokenReturn,
    expectedGroup: string,
    expectedValue?: string
  ) {
    // prettier-ignore
    super(
          'Unexpected token: ' + currentToken?.value
      + '\n        expected: ' + expectedGroup + ' ' + (expectedValue ? '"' + expectedValue + '"': '')
      + '\n    but received: ' + currentToken?.group + ' "' + currentToken?.value + '"'
      + '\n     at position: ' + currentToken?.index
    )

    this.currentToken = currentToken
    this.expectedGroup = expectedGroup
    this.expectedValue = expectedValue
  }
}

export type LexerTokenizer = (
  input: string
) => IterableIterator<RegExpMatchArray>

/**
 * Lexer interface.
 */
export interface Lexer {
  /**
   * Returns token under current position and advances.
   */
  advance: () => LexerTokenReturn
  /**
   * Returns token under current position.
   */
  peek: () => LexerTokenReturn
  /**
   * Advances position only when current `token.group` matches `group`,
   * and optionally when `token.value` matches `value`,
   * otherwise does nothing.
   *
   * @param group The group name to examine
   * @param value The value to match
   */
  accept: (group: string, value?: string) => LexerTokenReturn
  /**
   * Same as accept() except it throws when `token.group` does not match `group`,
   * or (optionally) when `token.value` does not match `value`,
   *
   * @param group The group name to examine
   * @param value The value to match
   */
  expect: (group: string, value?: string) => LexerTokenReturn

  /**
   * Sets a function to handle errors. The error handler accepts
   * an {@link Error} object.
   */
  onerror: (fn: ErrorHandler) => void

  /**
   * Sets a filter function. The filter function accepts a {@link LexerTokenReturn}.
   */
  filter: (fn: FilterFunction) => void
}

/**
 * Generate a {@link Lexer} for given input string.
 */
export type LexerFactory = (input: string) => Lexer

/**
 * Create a {@link LexerFactory} with the given {@link LexerTokenizer}.
 *
 * It can be anything that, when called with an `input` string, returns an interface that conforms to
 * the `IterableIterator<RegExpMatchArray>` type as is returned, for example,
 * by [`String.prototype.matchAll(regexp)`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/matchAll)
 *
 * @param tokenize A tokenizer Iterable factory.
 */
export const createLexer =
  (tokenize: LexerTokenizer) =>
  (input: string): Lexer => {
    const source = { input }
    const it = tokenize(input)

    let last: LexerTokenReturn
    let curr: LexerTokenReturn

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
      while ((token = matchToToken(it.next().value) as LexerTokenReturn)) {
        if (token && !filterFn(token)) continue
        break
      }
      if (token != null)
        Object.defineProperty(token, 'source', {
          value: source,
          enumerable: false
        })
      return token
    }

    const advance = () => (([last, curr] = [curr, next()]), last)

    const peek = () => curr

    const accept = (group: string, value?: string) =>
      curr?.group === group && (value == null ? true : curr?.value === value)
        ? advance()
        : undefined

    const expect = (group: string, value?: string) => {
      const token = accept(group, value)
      if (!token) errorFn(new UnexpectedTokenError(curr, group, value))
      return token
    }

    //
    // exports
    //

    advance() // initial advance is implicit

    return {
      onerror,
      filter,
      peek,
      advance,
      expect,
      accept
    }
  }

export default createLexer
