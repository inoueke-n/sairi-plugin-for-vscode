import {
  Range,
  TextDocumentContentChangeEvent,
} from "vscode-languageserver/node";
import * as R from "ramda";

import { submit } from "@inoueke-n/sairi-common";

import { AddEvent, convertToAddEvent } from "./add";
import { DeleteEvent, convertToDeleteEvent } from "./delete";
import { ReplaceEvent, convertToReplaceEvent } from "./replace";
import { isIncremental } from "./checker";

/*
 * 細粒度編集履歴を結合するためのユーティリティ
 */

export type EditEvent = AddEvent | DeleteEvent | ReplaceEvent | EmptyEvent;
export type SerializableEditEvent = AddEvent | DeleteEvent | EmptyEvent;

export interface EmptyEvent {
  type: "empty";
}

export namespace EmptyEvent {
  export function create(): EmptyEvent {
    return { type: "empty" };
  }
}

export function convertToEditEvent(
  e: TextDocumentContentChangeEvent
): EditEvent {
  if (!isIncremental(e)) {
    // 無理やり感のある型チェック
    const content = JSON.stringify(e, null, 2);
    throw new Error(
      `Text document content change event is not add|delete|replace event. Impossible. The content is: ${content}`
    );
  } else {
    return convertToAddEvent(e).matchWith<EditEvent>({
      Just: ({ value }) => value,
      Nothing: () =>
        convertToDeleteEvent(e).matchWith<EditEvent>({
          Just: ({ value }) => value,
          Nothing: () =>
            convertToReplaceEvent(e).matchWith({
              Just: ({ value }) => value,
              Nothing: () => {
                const content = JSON.stringify(e, null, 2);
                throw new Error(
                  `Text document content change event is not add|delete|replace event. Impossible. The content is: ${content}`
                );
              },
            }),
        }),
    });
  }
}

export function convertBack(
  s: SerializableEditEvent
): TextDocumentContentChangeEvent {
  if (s.type === "add") {
    return {
      text: s.text,
      rangeLength: 0,
      range: Range.create(s.offset, s.offset),
    };
  } else if (s.type === "delete") {
    return {
      text: "",
      rangeLength: s.rangeLength,
      range: s.range,
    };
  } else {
    throw new Error("Not implemented");
  }
}

export function convertToSequence(
  es: TextDocumentContentChangeEvent[]
): SerializableEditEvent[] {
  return R.pipe(
    R.map(convertToEditEvent),
    R.flatten
  )(es) as SerializableEditEvent[];
}

export function convertBackToSequence(
  ss: SerializableEditEvent[]
): TextDocumentContentChangeEvent[] {
  return R.map(convertBack, ss);
}

export interface TextDocumentEditWithTimeEvent {
  time: Date;
  nativeParams: submit.TextDocumentEditEventPayload;
}

export namespace TextDocumentEditWithTimeEvent {
  export function create(
    time: Date,
    nativeParams: submit.TextDocumentEditEventPayload
  ): TextDocumentEditWithTimeEvent {
    return { time, nativeParams };
  }
}
