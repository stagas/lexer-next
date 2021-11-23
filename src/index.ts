import { matchToToken, TokenReturn, Token } from 'match-to-token'

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
export type FilterFunction = (token?: TokenReturn) => boolean

export class UnexpectedTokenError extends SyntaxError {
  expectedGroup: string
  currentToken: TokenReturn

  constructor(expectedGroup: string, currentToken: TokenReturn) {
    // prettier-ignore
    super(
          'Unexpected token: ' + currentToken?.value
      + '\n        expected: ' + expectedGroup
      + '\n    but received: ' + currentToken?.group + ' "' + currentToken?.value + '"'
      + '\n     at position: ' + currentToken?.index
    )

    this.expectedGroup = expectedGroup
    this.currentToken = currentToken
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
  advance: () => TokenReturn
  /**
   * Returns token under current position.
   */
  peek: () => TokenReturn
  /**
   * Advances position only when current `token.group` matches `group`,
   * and optionally when `token.value` matches `value`,
   * otherwise does nothing.
   *
   * @param group The group name to examine
   * @param value The value to match
   */
  accept: (group: string, value?: string) => TokenReturn
  /**
   * Same as accept() except it throws when `token.group` does not match `group`,
   * or (optionally) when `token.value` does not match `value`,
   *
   * @param group The group name to examine
   * @param value The value to match
   */
  expect: (group: string, value?: string) => TokenReturn

  /**
   * Sets a function to handle errors. The error handler accepts
   * an {@link Error} object.
   */
  onerror: (fn: ErrorHandler) => void

  /**
   * Sets a filter function. The filter function accepts a {@link TokenReturn}.
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
    const it = tokenize(input)

    let last: TokenReturn
    let curr: TokenReturn

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
      while ((token = matchToToken(it.next().value))) {
        if (token && !filterFn(token)) continue
        break
      }
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
      if (!token) errorFn(new UnexpectedTokenError(group, curr))
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

export type { TokenReturn, Token }
export default createLexer
