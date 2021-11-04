import { matchToToken, TokenReturn } from 'match-to-token'

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
   * otherwise does nothing.
   *
   * @param group The group name to examine
   */
  accept: (group: string) => TokenReturn
  /**
   * Same as accept() except it throws when `token.group` does not match `group`.
   *
   * @param group The group name to examine
   */
  expect: (group: string) => TokenReturn
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
export const createLexer = (tokenize: LexerTokenizer) => (input: string) => {
  const it = tokenize(input)

  let last: TokenReturn
  let curr: TokenReturn

  const advance = () => (
    ([last, curr] = [curr, matchToToken(it.next().value)]), last
  )

  const peek = () => curr

  const accept = (group: string) =>
    curr?.group === group ? advance() : undefined

  const expect = (group: string) => {
    const token = accept(group)
    if (!token) {
      // prettier-ignore
      throw new SyntaxError(
        'Unexpected token: ' + curr?.value
      + '\n      expected: ' + group
      + '\n  but received: ' + curr?.group + ' "' + curr?.value + '"'
      + '\n   at position: ' + curr?.index)
    }
    return token
  }

  advance() // initial advance is implicit

  return { advance, peek, accept, expect }
}

export default createLexer
