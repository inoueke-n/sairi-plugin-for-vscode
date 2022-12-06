import { Result, result } from "folktale";
import { CommandTuple } from ".";
import * as vscode from "vscode";
import * as R from "ramda";

import { FolktaleExtension } from "@inoueke-n/sairi-common";

import { Sairi } from "../../resource";
import {
  getConfigUid,
  getConfigApiEndpoint,
  getConfigPublicKey,
} from "../config";
import { ConfigGetter } from "../config/helper";
import { showOkMessage } from "../helper";

/**
 * 設定項目を確認する
 * @param name 設定項目名
 * @param configGetter 設定項目取得用メソッド
 * @param expectedPred 設定確認（正しいとtrueを返す）
 */
function validateConfig<T>(
  name: string,
  configGetter: ConfigGetter<T>,
  expectedPred: (v: T) => boolean
): Result<string, undefined> {
  const success = configGetter().matchWith({
    Just: ({ value }) => {
      return expectedPred(value);
    },
    Nothing: R.always(false),
  });

  return success
    ? result.Ok(undefined)
    : result.Error(`'${name}' is not defined.`);
}

function isNotNil(v: any): boolean {
  return !R.isNil(v);
}

/**
 * 設定確認する項目の並び
 */
export function check(): Result<string, void> {
  //  uid, endpoint, publicKeyの存在を確認する
  return FolktaleExtension.concatResults([
    validateConfig("uid", getConfigUid, isNotNil),
    validateConfig("apiendpoint", getConfigApiEndpoint, isNotNil),
    validateConfig("publickey", getConfigPublicKey, isNotNil),
  ]).mapError((x) => x.join("\n"));
}

/**
 * 設定確認の成否でメッセージ
 */
function validateSettings(): void {
  check().matchWith({
    Ok: () => {
      showOkMessage(Sairi.Message.settingsIsValid);
    },
    Error: ({ value }) => {
      vscode.window.showErrorMessage("Error: \n" + value);
    },
  });
}

// commandをマージするような形にする
export const commands: CommandTuple[] = [
  [Sairi.Command.checkSettings, validateSettings],
];
