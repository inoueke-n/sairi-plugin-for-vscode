import { submit, HistoryData } from "@inoueke-n/sairi-common";

import { EditHistory } from "./types";

/**
 * データ変換。
 * Json.stringifyでキー名が_?となるのを防止する
 */
export function historyToJson(
  history: EditHistory | undefined,
  success: boolean,
  reason: string,
  raw: submit.EditorEvent[]
): string {
  const obj: HistoryData = {
    history: history ? history.history : [],
    files: history ? history.files : [],
    lsVersion: history ? history.lsVersion : "x.x.x",
    editor: history ? history.editor : { name: "unknown", version: "x.x.x" },
    success,
    reason,
    raw,
  };
  try {
    return JSON.stringify(obj, null, 2);
  } catch (error) {
    console.error("Failed: historyToJson");
    throw new Error("Failed: historyToJson");
  }
}
