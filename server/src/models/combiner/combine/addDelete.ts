import { Range } from "vscode-languageserver/node";
import * as R from "ramda";
import * as _ from "lodash";

import { substringRes } from "src/util/string";
import { CombinedType, CombineSignature } from ".";
import { Pos } from "../events/position";
import { AddEvent } from "../events/add";
import { DeleteEvent } from "../events/delete";
import { EmptyEvent } from "../events";

type AddEventLike = AddEvent | undefined;
type DeleteEventLike = DeleteEvent | undefined;

export const combineAddDelete: CombineSignature<AddEvent, DeleteEvent> = (
  e1,
  e2
) => {
  if (
    R.and(
      Pos.equal(e1.offset, e2.range.start),
      Pos.equal(Pos.plus(e1.offset, e1.text.length), e2.range.end)
    )
  ) {
    return EmptyEvent.create();
  }
  if (R.includes("\n", e1.text)) {
    // 改行文字が入っているとインデックスの計算を間違えるので回避
    return [e1, e2];
  }
  if (
    R.and(
      Pos.beforeOrEqual(e1.offset, e2.range.start),
      Pos.before(e2.range.start, Pos.plus(e1.offset, e1.text.length))
    )
  ) {
    // 挿入部分がどれだけ残るか?
    const addStartIndex = e2.range.start.character - e1.offset.character;
    const endIndex = e2.range.end.character - e1.offset.character;
    // もしaddEndIndexが長さより小さければ挿入箇所が残っている

    let addEvent: AddEventLike;
    let delEvent: DeleteEventLike;

    if (addStartIndex > 0) {
      const substr = substringRes(e1.text, addStartIndex, endIndex);
      addEvent = AddEvent.create(substr, e1.offset);
    }

    // 削除部分がどれだけ残るか?
    if (endIndex > e1.text.length) {
      const rangeLength =
        e2.range.end.character - (e1.offset.character + e1.text.length);
      const ra = Pos.plus(e1.offset, addStartIndex);
      const rb = Pos.plus(ra, rangeLength);
      const range = Range.create(ra, rb);
      delEvent = DeleteEvent.create(rangeLength, range);
    }

    if (bothUndefined(addEvent, delEvent)) {
      // FIXME: 両方がundefinedにはならないと思われるので要修正
      return [e1, e2];
    } else {
      return f(addEvent, delEvent);
    }
  }

  return [e1, e2];
};

function bothUndefined(a: AddEventLike, d: DeleteEventLike): boolean {
  return _.isUndefined(a) && _.isUndefined(d);
}

function f(a: AddEventLike, d: DeleteEventLike): CombinedType {
  if (bothUndefined(a, d)) {
    const objAContent =
      typeof a === "object" ? JSON.stringify(a, null, 2) : undefined;
    const objBContent =
      typeof d === "object" ? JSON.stringify(d, null, 2) : undefined;
    throw new Error(
      `Both object are undefined. Impossible. objA is: ${objAContent}. objB is ${objBContent}.`
    );
  } else if (!_.isUndefined(a) && _.isUndefined(d)) {
    return a;
  } else if (_.isUndefined(a) && !_.isUndefined(d)) {
    return d;
  } else {
    // @ts-expect-error: strictNullChecks
    return [a, d];
  }
}
