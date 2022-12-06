import test from "ava";
import { Position, Range } from "vscode-languageserver/node";
import { convertToEditEvent, convertToSequence } from ".";
import { convertToAddEvent, AddEvent } from "./add";
import { convertToDeleteEvent, DeleteEvent } from "./delete";
import { convertToReplaceEvent } from "./replace";
import { IncrementalTextDocumentContentChangeEvent } from "./checker";

test("convertToAddEvent", (t) => {
  const pos = Position.create(0, 0);
  const e: IncrementalTextDocumentContentChangeEvent = {
    text: "abc",
    rangeLength: 0,
    range: Range.create(pos, pos),
  };

  t.deepEqual(convertToAddEvent(e).unsafeGet(), {
    type: "add",
    text: "abc",
    offset: pos,
  });
});

test("convertToDeleteEvent", (t) => {
  const range = Range.create(Position.create(0, 0), Position.create(0, 3));
  const rangeLength = 3;
  const e: IncrementalTextDocumentContentChangeEvent = {
    text: "",
    rangeLength,
    range,
  };

  t.deepEqual(convertToDeleteEvent(e).unsafeGet(), {
    type: "delete",
    rangeLength,
    range,
  });
});

test("convertToReplaceEvent", (t) => {
  const range = Range.create(Position.create(0, 1), Position.create(0, 4));
  const rangeLength = 3;
  const e: IncrementalTextDocumentContentChangeEvent = {
    text: "def",
    rangeLength,
    range,
  };

  t.deepEqual(convertToReplaceEvent(e).unsafeGet(), [
    DeleteEvent.create(rangeLength, range),
    AddEvent.create("def", Position.create(0, 1)),
  ]);
});

const addEvent = {
  text: "abc",
  rangeLength: 0,
  range: Range.create(Position.create(0, 0), Position.create(0, 0)),
};
const deleteEvent = {
  text: "",
  rangeLength: 3,
  range: Range.create(Position.create(0, 0), Position.create(0, 3)),
};
const replaceEvent = {
  text: "abc",
  rangeLength: 3,
  range: Range.create(Position.create(0, 1), Position.create(0, 4)),
};

test("convert", (t) => {
  t.deepEqual(
    convertToEditEvent(addEvent),
    AddEvent.create("abc", Position.create(0, 0))
  );

  t.deepEqual(
    convertToEditEvent(deleteEvent),
    DeleteEvent.create(
      3,
      Range.create(Position.create(0, 0), Position.create(0, 3))
    )
  );

  t.deepEqual(convertToEditEvent(replaceEvent), [
    DeleteEvent.create(
      3,
      Range.create(Position.create(0, 1), Position.create(0, 4))
    ),
    AddEvent.create("abc", Position.create(0, 1)),
  ]);
});

test("convertToSequence", (t) => {
  t.deepEqual(convertToSequence([addEvent, deleteEvent, replaceEvent]), [
    AddEvent.create("abc", Position.create(0, 0)),
    DeleteEvent.create(
      3,
      Range.create(Position.create(0, 0), Position.create(0, 3))
    ),
    DeleteEvent.create(
      3,
      Range.create(Position.create(0, 1), Position.create(0, 4))
    ),
    AddEvent.create("abc", Position.create(0, 1)),
  ]);
});
