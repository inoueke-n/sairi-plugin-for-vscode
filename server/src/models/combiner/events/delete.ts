import { Range } from "vscode-languageserver/node";
import * as R from "ramda";
import { Maybe, maybe } from "folktale";

import { IncrementalTextDocumentContentChangeEvent } from "./checker";

/**
 * DeleteEvent: deleted range (start-end)
 */
export interface DeleteEvent {
  type: "delete";
  rangeLength: number;
  range: Range;
}

export namespace DeleteEvent {
  export function create(rangeLength: number, range: Range): DeleteEvent {
    if (rangeLength < 0) {
      const args = `rangeLength=${rangeLength}, range=${JSON.stringify(range)}`;
      throw new Error(
        `Failed to create Delete Event. Range length must be non-negative value. Invalid argument. args is: ${args}`
      );
    }
    return { type: "delete", rangeLength, range };
  }
}

export function isDeleteEvent(
  e: IncrementalTextDocumentContentChangeEvent
): boolean {
  return R.isEmpty(e.text);
}

export function convertToDeleteEvent(
  e: IncrementalTextDocumentContentChangeEvent
): Maybe<DeleteEvent> {
  if (isDeleteEvent(e)) {
    return maybe.Just(DeleteEvent.create(e.rangeLength, e.range));
  } else {
    return maybe.Nothing();
  }
}
