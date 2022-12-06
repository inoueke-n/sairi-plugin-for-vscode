import * as R from "ramda";
import { DidChangeTextDocumentParams } from "vscode-languageserver/node";

import { submit } from "@inoueke-n/sairi-common";

import { IDocumentChangeRecorder } from "../editorActionRecorder";
import { TextDocumentEditWithTimeEvent } from "../../combiner/events";
import { combineTextDocumentEditWithTimeEvents } from "../../combiner/combineEditEvents";

function TDEWT2DEE(
  e: TextDocumentEditWithTimeEvent
): submit.TextDocumentEditEvent {
  return {
    type: "edit",
    time: e.time,
    payload: e.nativeParams,
  };
}

export class DocumentChangeRecorder implements IDocumentChangeRecorder {
  private _events: TextDocumentEditWithTimeEvent[] = [];

  constructor() {
    this.reset();
  }

  record(event: DidChangeTextDocumentParams): void {
    const e = TextDocumentEditWithTimeEvent.create(new Date(), {
      ...event,
      editEffort: 0,
    });
    this._events = R.append(e, this._events);
  }

  dumpEvents(): submit.TextDocumentEditEvent[] {
    if (this._events.length === 0) {
      return [];
    } else {
      return R.map(TDEWT2DEE)(
        combineTextDocumentEditWithTimeEvents(this._events)
      );
    }
  }

  dumpRawEvents(): submit.TextDocumentEditEvent[] {
    return R.map(TDEWT2DEE)(this._events);
  }

  reset(): void {
    this._events = [];
  }
}
