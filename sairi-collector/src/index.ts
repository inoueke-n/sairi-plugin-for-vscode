// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as path from "path";
import { LanguageClient } from "vscode-languageclient/node";
import { Successful } from "@inoueke-n/sairi-common";

import { createLanguageClient } from "./extension/connect/createLanguageClient";
import { getConfigAutomaticSendPeriod } from "./extension/config";
import { registerCommands } from "./extension/commands/";
import { registerTreeDataProviders } from "./treeView/registerTreeDataProvider";
import { DataSendResult } from "./editHistory/sendEditHistory";
import { scheduleAutomaticSend } from "./editHistory/automaticSend";

let client: LanguageClient;

interface LanguageServer {
  entryPoint: string;
  name: string;
}

function getLanguageServer(context: vscode.ExtensionContext): LanguageServer {
  const testServer = context.asAbsolutePath(
    path.join("..", "server", "dist", "languageserver.js")
  );
  const releaseServer = context.asAbsolutePath(
    path.join("..", "..", "plugin/server/dist", "languageserver.js")
  );
  // return testServer;
  return process.env.NODE_ENV === "test"
    ? {
        entryPoint: testServer,
        name: "Test Language Server",
      }
    : {
        entryPoint: releaseServer,
        name: "Release Language Server",
      };
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext): void {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log(
    'Congratulations, your extension "sairi-collector" is now active!'
  );

  console.log(process.env.NODE_ENV);

  // 言語サーバ初期化
  const langServer = getLanguageServer(context);
  console.log(
    `Using Language Server: ${langServer.name} ${langServer.entryPoint}`
  );

  // 言語サーバへ接続
  try {
    client = createLanguageClient(langServer.entryPoint);
    client.start();
  } catch (error) {
    console.error("UNEXPECTED ERROR OCCURED");
    console.error(error);
  }

  // 定期送信をスケジュールする
  const period = getConfigAutomaticSendPeriod().getOrElse(50);
  const cancelableToken = scheduleAutomaticSend(period);
  // logAutomaticSendScheduling(cancelableToken, 5000); // for debugging

  // コマンドや各種メニューの登録
  const eventEmitter = new vscode.EventEmitter<Successful<DataSendResult>>();
  registerCommands(
    client,
    cancelableToken,
    eventEmitter,
    context.subscriptions
  );
  registerTreeDataProviders(eventEmitter.event);
}

// this method is called when your extension is deactivated
export function deactivate(): Promise<void> {
  if (!client) {
    // @ts-expect-error: strictNullChecks
    return undefined;
  } else {
    return client.stop();
  }
}
