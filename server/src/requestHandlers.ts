import { Result } from "folktale";

import { SaveEditHistoryParams } from "@inoueke-n/sairi-lsp";
import { submit } from "@inoueke-n/sairi-common";

import { EditHistory } from "./submit/types";
import { LocalSubmitter } from "./submit/savetoDesktop";
import { SairiServerSubmitter } from "./submit/sendtoServer";

/**
 * 履歴保存時の動作
 * @param params 保存先などのパラメータ
 * @param history 保存する履歴
 * @param success 成否ステータス
 * @param reason 成否ステータス（エラー時の詳細）
 * @param raw 生データ
 */
export async function createSaveEditHistoryRequest(
  params: SaveEditHistoryParams,
  history: EditHistory | undefined,
  success: boolean,
  reason: string,
  raw: submit.EditorEvent[]
): Promise<Result<string, string>> {
  const { uid, publicKey, apiEndpoint } = params;
  // 履歴を保存する（保存先で分岐。基本はweb。デスクトップに保存は今の所デバッグ用）
  const submitter =
    params.sendTo === "web"
      ? new SairiServerSubmitter(uid, publicKey, apiEndpoint)
      : new LocalSubmitter();

  // 一旦暗号化しないで送信を強制で作る。
  return await submitter.submit(history, success, reason, raw, true);
}
