import * as vscode from "vscode";
import { Result, result } from "folktale";
import * as R from "ramda";

import { sairiCrypt, FolktaleExtension } from "@inoueke-n/sairi-common";

import { api } from "../../api";
import {
  getConfigApiEndpoint,
  getConfigPublicKey,
  getConfigUid,
} from "../config";
import { CommandTuple } from ".";
import { showOkMessage } from "../helper";
import { Sairi } from "../../resource";

function createCheckAPIToken(publicKey: string): string {
  return R.pipe(sairiCrypt.encrypt(publicKey), (buf) => buf.toString("base64"))(
    // tokenの中身はbackendと揃える必要がある
    Buffer.from("sairi")
  );
}

/**
 * サーバにトークンを投げつける
 */
function _checkAPI(): Promise<Result<string, string>> {
  return FolktaleExtension.concatMaybe3(
    getConfigApiEndpoint(),
    getConfigUid(),
    getConfigPublicKey()
  ).matchWith({
    Just: async ({ value }) => {
      const [endpoint, uid, publicKey] = value;
      const token = createCheckAPIToken(publicKey);
      const r = await api.healthCheck(endpoint, {
        uid,
        token,
      });
      return r
        .map(() => "API Health: Active")
        .mapError((value) => "API failed: " + value);
    },
    Nothing: () => {
      return Promise.resolve(
        result.Error(
          "Something went wrong. Please check your settings. ('endpoint', 'uid', 'publicKey')"
        )
      );
    },
  });
}

async function checkAPI() {
  const r = await _checkAPI();
  return r.matchWith({
    Ok: ({ value }) => {
      showOkMessage(value);
    },
    Error: ({ value }) => {
      vscode.window.showErrorMessage(value);
    },
  });
}

export const commands: CommandTuple[] = [
  [Sairi.Command.checkAPIHealth, checkAPI],
];
