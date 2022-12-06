import { Maybe, maybe } from "folktale";
import * as R from "ramda";

import {
  SerializableEditEvent,
  EditEvent,
  TextDocumentEditWithTimeEvent,
  convertToEditEvent,
  convertBack,
} from "./events";
import { reduceSrializeableEvent } from ".";

export function combineEditEvent(
  a: EditEvent,
  b: EditEvent
): Maybe<SerializableEditEvent[]> {
  const flat = R.flatten([a, b]) as SerializableEditEvent[];

  const r = reduceSrializeableEvent(flat);

  return r.length < flat.length ? maybe.Just(r) : maybe.Nothing();
}

type Operator<T, R> = (a: T, b: T) => R;

const isMultipleEdit: Operator<TextDocumentEditWithTimeEvent, boolean> = (
  a,
  b
) =>
  R.or(
    a.nativeParams.contentChanges.length > 1,
    b.nativeParams.contentChanges.length > 1
  );

const isOtherDocument: Operator<TextDocumentEditWithTimeEvent, boolean> = (
  a,
  b
) => a.nativeParams.textDocument.uri !== b.nativeParams.textDocument.uri;

export function combineTextDocumentEditWithTimeEvent(
  a: TextDocumentEditWithTimeEvent,
  b: TextDocumentEditWithTimeEvent
): Maybe<TextDocumentEditWithTimeEvent> {
  if (R.or(isMultipleEdit(a, b), isOtherDocument(a, b))) {
    return maybe.Nothing();
  } else if (a.nativeParams.contentChanges.length === 0) {
    console.warn("Hmm.. Why is the length of a is zero?");
    return maybe.Just(b);
  } else if (b.nativeParams.contentChanges.length === 0) {
    console.warn("Hmm.. Why is the length of b is zero?");
    return maybe.Just(a);
  } else {
    const cc1 = R.head(a.nativeParams.contentChanges);
    const cc2 = R.head(b.nativeParams.contentChanges);

    // @ts-expect-error: strictNullChecks
    const ev1 = convertToEditEvent(cc1);
    // @ts-expect-error: strictNullChecks
    const ev2 = convertToEditEvent(cc2);

    const c3 = combineEditEvent(ev1, ev2);

    return c3.matchWith({
      Just: ({ value }) => {
        const r: TextDocumentEditWithTimeEvent = {
          time: a.time,
          nativeParams: {
            textDocument: a.nativeParams.textDocument,
            contentChanges: value.map((x) => convertBack(x)),
            editEffort: 0,
          },
        };
        return maybe.Just(r);
      },
      Nothing: () => {
        return maybe.Nothing();
      },
    });
  }
}

export function combineTextDocumentEditWithTimeEvents(
  events: TextDocumentEditWithTimeEvent[]
): TextDocumentEditWithTimeEvent[] {
  // FIXME: 関数型っぽく書き直したい
  const head = R.head(events);
  if (head == null) {
    return [];
  }
  head.nativeParams.editEffort = 1;
  let result: TextDocumentEditWithTimeEvent[] = [head];

  let i = 1;
  let effort = 1;
  while (i < events.length) {
    const a = R.last(result);
    const b = events[i];
    // @ts-expect-error: strictNullChecks
    const r = combineTextDocumentEditWithTimeEvent(a, b);
    r.matchWith({
      Just: ({ value }) => {
        // 結合できたら...
        effort++;
        result = R.dropLast(1, result);
        result = R.append(value, result);
      },
      Nothing: () => {
        // 結合できなかったら...
        // 結合できなくなった時点でeffortを設定したい
        const last = result[result.length - 1];
        last.nativeParams.editEffort = effort;
        result = R.append(b, result);
        effort = 1;
      },
    });
    i++;
  }

  const last = result[result.length - 1];
  last.nativeParams.editEffort = effort;

  return result;
}
