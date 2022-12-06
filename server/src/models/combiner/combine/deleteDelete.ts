import { Range } from "vscode-languageserver/node";
import * as R from "ramda";

import { CombineSignature } from ".";
import { Pos } from "../events/position";
import { DeleteEvent } from "../events/delete";

export const combineDeleteDelete: CombineSignature<DeleteEvent, DeleteEvent> = (
  e1,
  e2
) => {
  if (
    R.and(
      Pos.beforeOrEqual(e2.range.start, e1.range.start),
      Pos.beforeOrEqual(e1.range.start, e2.range.end)
    )
  ) {
    const p1 = e2.range.start;
    const p2 = Pos.after(e2.range.end, e1.range.end)
      ? e2.range.end
      : e1.range.end;
    const rangeLength =
      p2.character - p1.character >= 0 ? p2.character - p1.character : 0;
    // FIXME: いったんrangeLengthが負値にならないようにした
    return DeleteEvent.create(rangeLength, Range.create(p1, p2));
  } else {
    return [e1, e2];
  }
};
