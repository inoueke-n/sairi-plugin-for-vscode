import { LanguageClient, TransportKind } from "vscode-languageclient/node";
import * as vscode from "vscode";
import { websocketOutputChannel } from "../../websocketOutputChannel";
import { Sairi } from "../../resource";

/**
 * LanguageClientを作ってなんとかする
 * @param langServerEntryPoint サーバ
 */
export function createLanguageClient(
  langServerEntryPoint: string
): LanguageClient {
  return new LanguageClient(
    "SairiLanguageServer",
    "Sairi Language Server",
    {
      run: {
        module: langServerEntryPoint,
        transport: TransportKind.ipc,
      },
      debug: {
        module: langServerEntryPoint,
        transport: TransportKind.ipc,
        options: { execArgv: ["--nolazy", "--inspect=7777"] },
      },
    },
    {
      documentSelector: Sairi.Language.documentSelector,
      synchronize: {
        fileEvents: vscode.workspace.createFileSystemWatcher("**/.clientrc"),
      },
      outputChannel: websocketOutputChannel,
    }
  );
}
