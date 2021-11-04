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
})
