/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { createLexer } from './'

describe('createLexer', () => {
  it('e2e', () => {
    const tokenizer = (input: string) => input.matchAll(/(?<ident>[a-z]+)/g)

    const lexer = createLexer(tokenizer)
    const l = lexer('foo bar baz')

    expect(l.peek()).toEqual({ group: 'ident', value: 'foo', index: 0 })

    expect(l.advance()).toEqual({
      group: 'ident',
      value: 'foo',
      index: 0
    })

    expect(l.peek()).toEqual({
      group: 'ident',
      value: 'bar',
      index: 4
    })

    expect(l.expect('ident')).toEqual({
      group: 'ident',
      value: 'bar',
      index: 4
    })

    let error: Error | void
    try {
      l.expect('foo')
    } catch (e) {
      error = e as Error
    } finally {
      expect(error?.message).toContain('Unexpected')
    }

    expect(l.accept('foo')).toBeUndefined()

    expect(l.peek()).toEqual({
      group: 'ident',
      value: 'baz',
      index: 8
    })

    expect(l.advance()).toEqual({
      group: 'ident',
      value: 'baz',
      index: 8
    })

    expect(l.peek()).toBeUndefined()

    expect(l.advance()).toBeUndefined()
  })

  it('accept(group, value)', () => {
    const tokenizer = (input: string) => input.matchAll(/(?<ident>[a-z]+)/g)

    const lexer = createLexer(tokenizer)
    const l = lexer('foo bar baz')

    expect(l.accept('ident', 'hello')).toBeUndefined()
    expect(l.accept('any', 'foo')).toBeUndefined()
    expect(l.accept('ident', 'foo')).toEqual({
      group: 'ident',
      value: 'foo',
      index: 0
    })

    expect(l.accept('ident', 'foo')).toBeUndefined()
    expect(l.accept('ident', 'bar')).toEqual({
      group: 'ident',
      value: 'bar',
      index: 4
    })
  })

  it('expect(group, value)', () => {
    const tokenizer = (input: string) => input.matchAll(/(?<ident>[a-z]+)/g)

    const lexer = createLexer(tokenizer)
    const l = lexer('foo bar baz')

    let error: Error | void

    try {
      l.expect('ident', 'hello')
    } catch (e) {
      error = e as Error
    } finally {
      expect(error?.message).toContain('Unexpected')
      expect(error?.message).toContain('expected: ident "hello"')
      expect(error?.message).toContain('received: ident "foo"')
    }

    try {
      l.expect('any', 'foo')
    } catch (e) {
      error = e as Error
    } finally {
      expect(error?.message).toContain('Unexpected')
      expect(error?.message).toContain('expected: any "foo"')
    }

    expect(l.expect('ident', 'foo')).toEqual({
      group: 'ident',
      value: 'foo',
      index: 0
    })

    try {
      l.expect('ident', 'foo')
    } catch (e) {
      error = e as Error
    } finally {
      expect(error?.message).toContain('Unexpected')
      expect(error?.message).toContain('expected: ident "foo"')
    }

    expect(l.expect('ident', 'bar')).toEqual({
      group: 'ident',
      value: 'bar',
      index: 4
    })
  })

  it('onerror(errFn)', () => {
    const tokenizer = (input: string) => input.matchAll(/(?<ident>[a-z]+)/g)

    const lexer = createLexer(tokenizer)
    const l = lexer('foo bar baz')

    let error: Error

    const fn = (e: Error) => {
      error = e
    }

    l.onerror(fn)
    expect(error!).toBeUndefined()
    l.expect('ident', 'hello')
    expect(error!.message).toContain('Unexpected')
  })

  it('filter(fn)', () => {
    const tokenizer = (input: string) =>
      input.matchAll(/(?<ident>[a-z]+)|(?<number>[0-9]+)/g)
    const lexer = createLexer(tokenizer)

    const l = lexer('foo 0123 bar 456 baz')

    l.filter(token => token?.group === 'number')

    expect(l.peek()).toEqual({
      group: 'number',
      value: '0123',
      index: 4
    })

    expect(l.advance()).toEqual({
      group: 'number',
      value: '0123',
      index: 4
    })

    expect(l.advance()).toEqual({
      group: 'number',
      value: '456',
      index: 13
    })

    expect(l.advance()).toBeUndefined()
  })

  it('include source code with tokens', () => {
    const tokenizer = (input: string) =>
      input.matchAll(/(?<ident>[a-z]+)|(?<number>[0-9]+)/g)
    const lexer = createLexer(tokenizer)

    const input = 'foo 0123 bar 456 baz'
    const l = lexer(input)

    l.filter(token => token?.group === 'number')

    const source = l.advance()!.source
    expect(source).toEqual({ input })
    expect(l.advance()!.source).toBe(source)
  })
})
