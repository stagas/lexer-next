import { Token } from './'

export class LexerErrorCause {
  name = 'LexerErrorUnknown'
  constructor(public message: string) {}
}

export class UnexpectedToken extends LexerErrorCause {
  name = 'LexerErrorUnexpectedToken'
  constructor(public currentToken: Token, public expectedGroup: string, public expectedValue?: string) {
    // dprint-ignore
    super(
        'Unexpected token: ' + currentToken.value
    + '\n        expected: ' + expectedGroup + ' ' + (expectedValue ? '"' + expectedValue + '"' : '')
    + '\n    but received: ' + currentToken.group + ' "' + currentToken.value + '"'
    + '\n     at position: ' + currentToken.index)
  }
}
