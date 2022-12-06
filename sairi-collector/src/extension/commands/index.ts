import * as vscode from "vscode";
import { LanguageClient } from "vscode-languageclient/node";
import * as _ from "lodash";

import { Successful } from "@inoueke-n/sairi-common";

import { addDisposables } from "../helper";
import { commands as recordingCommands } from "./manageSend";
import { commands as checkConfigurationCommands } from "./checkConfiguration";
import { commands as checkAPICommands } from "./checkAPI";
import { commands as feedbackCommands } from "./feedback";
import { CancelableToken } from "../../editHistory/scheduled";
import { DataSendResult } from "../../editHistory/sendEditHistory";

export type CommandTuple = [string, (...args: any[]) => any];

/**
 * コマンドを登録する本体
 * @param commands 登録するコマンド
 * @param disposableBag 拡張機能が破棄されるときにコマンドの破棄も行う
 */
function _registerCommands(
  commands: CommandTuple[],
  disposableBag: { dispose(): any }[]
) {
  const disposables = commands.map((cmd) => {
    const [name, callback] = cmd;
    return vscode.commands.registerCommand(name, callback);
  });

  addDisposables(disposables).to(disposableBag);
}

/**
 * コマンドを実行できるように登録
 * @param client ?
 * @param cancelAutoSendToken ?
 * @param event ?
 * @param subscriptions 拡張機能が破棄されるときにコマンドの破棄も行う
 */
export function registerCommands(
  client: LanguageClient,
  cancelAutoSendToken: CancelableToken,
  event: vscode.EventEmitter<Successful<DataSendResult>>,
  subscriptions: { dispose(): any }[]
): void {
  const commands: CommandTuple[] = _.flatten([
    recordingCommands(client, cancelAutoSendToken, event),
    checkConfigurationCommands,
    checkAPICommands,
    feedbackCommands,
  ]);

  _registerCommands(commands, subscriptions);
}
