import {
  TextDocumentContentChangeEvent,
  Range,
} from "vscode-languageserver/node";

/*
 * 記録方式がFullの場合は型が違うので整合性のためにチェックしておく。
 * ただし、rangeLength?をつぶしているのとrangeLength自体が非推奨
 */
// copied from https://github.com/microsoft/vscode-languageserver-node/blob/248560e74c9a715be59e62fdbdd554b87ddf8dba/protocol/src/common/protocol.ts#L1157
export function isIncremental(
  event: TextDocumentContentChangeEvent
): event is IncrementalTextDocumentContentChangeEvent {
  const candidate: {
    range: Range;
    rangeLength?: number;
    text: string;
  } = event as any;
  return (
    candidate !== undefined &&
    candidate !== null &&
    typeof candidate.text === "string" &&
    candidate.range !== undefined &&
    (candidate.rangeLength === undefined ||
      typeof candidate.rangeLength === "number")
  );
}

export interface IncrementalTextDocumentContentChangeEvent {
  range: Range;
  rangeLength: number;
  text: string;
}
