import test from "ava";

import { Position, Range } from "vscode-languageserver/node";

import { combine } from ".";
import { AddEvent } from "../events/add";
import { DeleteEvent } from "../events/delete";
import { EmptyEvent } from "../events";

test("Add-Add-1", (t) => {
  const r = combine(
    AddEvent.create("abc", Position.create(0, 0)),
    AddEvent.create("de", Position.create(0, 0))
  );

  t.deepEqual(r, AddEvent.create("deabc", Position.create(0, 0)));
});

test("Add-Add-2", (t) => {
  const add1 = AddEvent.create("abc", Position.create(0, 0));
  const add2 = AddEvent.create("de", Position.create(0, 4));
  const r = combine(add1, add2);

  t.deepEqual(r, [add1, add2]);
});

test("Add-Delete-1", (t) => {
  // "abc"から"abc__"を削除して"__"にする
  const r = combine(
    AddEvent.create("abc", Position.create(0, 0)),
    DeleteEvent.create(
      5,
      Range.create(Position.create(0, 0), Position.create(0, 5))
    )
  );

  t.deepEqual(
    r,
    DeleteEvent.create(
      2,
      Range.create(Position.create(0, 0), Position.create(0, 2))
    )
  );
});

test("Add-Delete-2.1", (t) => {
  // "abcde"から"bc"を削除して"ade"にする
  const r = combine(
    AddEvent.create("abcde", Position.create(0, 0)),
    DeleteEvent.create(
      2,
      Range.create(Position.create(0, 1), Position.create(0, 3))
    )
  );

  t.deepEqual(r, AddEvent.create("ade", Position.create(0, 0)));
});

test("Add-Delete-2.2", (t) => {
  // "abcde"から"bcde_"を削除して"a_"にする
  const r = combine(
    AddEvent.create("abcde", Position.create(0, 0)),
    DeleteEvent.create(
      5,
      Range.create(Position.create(0, 1), Position.create(0, 6))
    )
  );

  t.deepEqual(r, [
    AddEvent.create("a", Position.create(0, 0)),
    DeleteEvent.create(
      1,
      Range.create(Position.create(0, 1), Position.create(0, 2))
    ),
  ]);
});

test("Add-Delete-3", (t) => {
  const r = combine(
    AddEvent.create("abc", Position.create(0, 0)),
    DeleteEvent.create(
      3,
      Range.create(Position.create(0, 0), Position.create(0, 3))
    )
  );

  t.deepEqual(r, EmptyEvent.create());
});

test.skip("Delete-Add-1", (t) => {
  // "abcde"を削除して、"abcde"を挿入する場合
  const r = combine(
    DeleteEvent.create(
      5,
      Range.create(Position.create(0, 0), Position.create(0, 5))
    ),
    AddEvent.create("abcde", Position.create(0, 0))
  );

  t.deepEqual(r, EmptyEvent.create());
});

test.skip("Delete-Add-2", (t) => {
  // "abcde"を削除して、"abc"を挿入する場合
  const r = combine(
    DeleteEvent.create(
      5,
      Range.create(Position.create(0, 0), Position.create(0, 5))
    ),
    AddEvent.create("abc", Position.create(0, 0))
  );

  t.deepEqual(
    r,
    DeleteEvent.create(
      2,
      Range.create(Position.create(0, 3), Position.create(0, 5))
    )
  );
});

test.skip("Delete-Add-3", (t) => {
  // "abc"を削除して、"abcde"を挿入する場合
  const r = combine(
    DeleteEvent.create(
      3,
      Range.create(Position.create(0, 0), Position.create(0, 3))
    ),
    AddEvent.create("abcde", Position.create(0, 0))
  );

  t.deepEqual(r, AddEvent.create("de", Position.create(0, 0)));
});

test.skip("Delete-Add-4", (t) => {
  // "def"を削除して、"abc"を挿入する場合
  const r = combine(
    DeleteEvent.create(
      3,
      Range.create(Position.create(0, 0), Position.create(0, 3))
    ),
    AddEvent.create("abc", Position.create(0, 0))
  );

  t.deepEqual(r, [
    DeleteEvent.create(
      3,
      Range.create(Position.create(0, 0), Position.create(0, 3))
    ),
    AddEvent.create("def", Position.create(0, 0)),
  ]);
});

test("Delete-Delete-1", (t) => {
  // "def"を削除して、さらに"abc"を削除する
  const r = combine(
    DeleteEvent.create(
      3,
      Range.create(Position.create(0, 3), Position.create(0, 6))
    ),
    DeleteEvent.create(
      3,
      Range.create(Position.create(0, 0), Position.create(0, 3))
    )
  );

  t.deepEqual(
    r,
    DeleteEvent.create(
      6,
      Range.create(Position.create(0, 0), Position.create(0, 6))
    )
  );
});

test("Delete-Delete-2", (t) => {
  const e1 = DeleteEvent.create(
    251,
    Range.create(Position.create(36, 0), Position.create(79, 0))
  );
  const e2 = DeleteEvent.create(
    5,
    Range.create(Position.create(21, 0), Position.create(22, 0))
  );
  const r = combine(e1, e2);

  t.deepEqual(r, [e1, e2]);
});
