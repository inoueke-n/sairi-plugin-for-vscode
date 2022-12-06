import { Position } from "vscode-languageserver/node";

export namespace Pos {
  export function before(p1: Position, p2: Position): boolean {
    return (
      p1.line < p2.line || (p1.line == p2.line && p1.character < p2.character)
    );
  }

  export function beforeOrEqual(p1: Position, p2: Position): boolean {
    return before(p1, p2) || equal(p1, p2);
  }

  export function equal(p1: Position, p2: Position): boolean {
    return p1.line == p2.line && p1.character == p2.character;
  }

  export function after(p1: Position, p2: Position): boolean {
    return !(before(p1, p2) || equal(p1, p2));
  }

  export function afterOrEqual(p1: Position, p2: Position): boolean {
    return after(p1, p2) || equal(p1, p2);
  }

  export function plus(a: Position, length: number): Position {
    return {
      line: a.line,
      character: a.character + length,
    };
  }
}
