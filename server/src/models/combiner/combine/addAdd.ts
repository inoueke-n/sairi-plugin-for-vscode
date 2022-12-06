import * as R from "ramda";
import { CombineSignature } from ".";
import { insertString } from "src/util/string";
import { AddEvent } from "../events/add";
import { Pos } from "../events/position";

export const combineAddAdd: CombineSignature<AddEvent, AddEvent> = (e1, e2) => {
  if (
    R.and(
      Pos.beforeOrEqual(e1.offset, e2.offset),
      Pos.beforeOrEqual(e2.offset, Pos.plus(e1.offset, e1.text.length))
    )
  ) {
    const strA = e1.text;
    const strB = e2.text;
    const index = e2.offset.character - e1.offset.character;
    const str = insertString(index, strB, strA);
    return AddEvent.create(str, e1.offset);
  } else {
    return [e1, e2];
  }
};
