import { Position } from "vscode-languageserver/node";
import * as R from "ramda";
import { Maybe, maybe } from "folktale";

import { IncrementalTextDocumentContentChangeEvent } from "./checker";

/**
 * AddEvent: added text and its posision
 */
export interface AddEvent {
  type: "add";
  text: string;
  offset: Position;
}

export namespace AddEvent {
  export function create(text: string, offset: Position): AddEvent {
    return { type: "add", text, offset };
  }
}

export function isAddEvent(
  e: IncrementalTextDocumentContentChangeEvent
): boolean {
  return !R.isEmpty(e.text) && e.rangeLength === 0;
}

export function convertToAddEvent(
  e: IncrementalTextDocumentContentChangeEvent
): Maybe<AddEvent> {
  if (isAddEvent(e)) {
    return maybe.Just(AddEvent.create(e.text, e.range.start));
  } else {
    return maybe.Nothing();
  }
}
