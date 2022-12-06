import { Event, TextDocumentChangeEvent } from "vscode-languageserver/node";
import { TextDocument } from "vscode-languageserver-textdocument";

import { submit, createFileEvent } from "@inoueke-n/sairi-common";

import { IEditorActionRecorder } from "../editorActionRecorder";

/**
 * ファイルオープン、ファイルクローズなどのイベントを記録する
 */
export class FileActionRecorder implements IEditorActionRecorder {
  private _eventList: submit.EditorEvent[] = [];

  constructor() {
    this.reset();
  }

  public subscribeOpen(
    event: Event<TextDocumentChangeEvent<TextDocument>>
  ): void {
    event((params) => {
      console.log(`${params.document.uri} を開きました`);
      this.appendEvent("open", params.document);
    });
  }

  public subscribeClose(
    event: Event<TextDocumentChangeEvent<TextDocument>>
  ): void {
    event((params) => {
      console.log(`${params.document.uri} を閉じました`);
      this.appendEvent("close", params.document);
    });
  }

  private appendEvent(state: "open" | "close", textDocument: TextDocument) {
    this._eventList.push(createFileEvent(state, textDocument.uri));
  }

  public dumpEvents(): submit.EditorEvent[] {
    return this._eventList;
  }

  public dumpRawEvents = this.dumpEvents;

  public reset(): void {
    this._eventList = [];
  }
}
