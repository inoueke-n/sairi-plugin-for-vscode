import * as R from "ramda";
import { Maybe, maybe } from "folktale";

import { DeleteEvent } from "./delete";
import { AddEvent } from "./add";
import { IncrementalTextDocumentContentChangeEvent } from "./checker";

/**
 * ReplaceEvent: a pair of a DeleteEvent and an AddEvent
 */
export type ReplaceEvent = [DeleteEvent, AddEvent];

export function isReplaceEvent(
  e: IncrementalTextDocumentContentChangeEvent
): boolean {
  return !R.isEmpty(e.text) && e.rangeLength != 0;
}

export function convertToReplaceEvent(
  e: IncrementalTextDocumentContentChangeEvent
): Maybe<ReplaceEvent> {
  if (isReplaceEvent(e)) {
    const del = DeleteEvent.create(e.rangeLength, e.range);
    const add = AddEvent.create(e.text, e.range.start);
    return maybe.Just([del, add]);
  } else {
    return maybe.Nothing();
  }
}
