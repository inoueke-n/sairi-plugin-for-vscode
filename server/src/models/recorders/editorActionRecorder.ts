import { DidChangeTextDocumentParams } from "vscode-languageserver/node";

import { submit } from "@inoueke-n/sairi-common";

export interface IEditorActionRecorder {
  dumpEvents(): submit.EditorEvent[];
  dumpRawEvents(): submit.EditorEvent[];
  reset(): void;
}

export interface IDocumentChangeRecorder extends IEditorActionRecorder {
  record(event: DidChangeTextDocumentParams): void;
}
