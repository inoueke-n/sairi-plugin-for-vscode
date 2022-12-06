import { Result } from "folktale";

import { submit } from "@inoueke-n/sairi-common";

// 編集履歴の型。実態はcommonライブラリ内で定義
export type EditHistory = submit.EditHistoryPayload;
export type EditorInfo = submit.EditorInfo;

export interface EditHistorySubmitter {
  name: string;

  /**
   * 履歴を保存席に送信する
   * @param history 保存する履歴
   * @param history 保存する履歴
   * @param success 成否ステータス
   * @param reason 成否ステータス（エラー時の詳細）
   * @param raw 生データ
   */
  submit(
    history: EditHistory | undefined,
    success: boolean,
    reason: string,
    raw: submit.EditorEvent[]
  ): Promise<Result<string, string>>;
}
