import * as vscode from "vscode";

import { createTreeItem } from "../helper";
import { Sairi } from "../../resource";

export class ManageSendTreeDataProvider
  implements vscode.TreeDataProvider<vscode.TreeItem>
{
  onDidChangeTreeData?: vscode.Event<vscode.TreeItem>;
  getTreeItem(
    element: vscode.TreeItem
  ): vscode.TreeItem | Thenable<vscode.TreeItem> {
    return element;
  }

  getChildren(
    _element?: vscode.TreeItem
  ): vscode.ProviderResult<vscode.TreeItem[]> {
    const sendManuallyItem = createTreeItem({
      label: Sairi.Label.sendDataManually,
      command: { command: Sairi.Command.sendDataManually },
    });

    const pauseItem = createTreeItem({
      label: Sairi.Label.pauseAutomaticSend,
      command: {
        command: Sairi.Command.DataSend.pauseAutomaticSend,
      },
    });

    const stopItem = createTreeItem({
      label: Sairi.Label.stopAutomaticSend,
      command: { command: Sairi.Command.DataSend.stopAutomaticSend },
    });

    const items = [sendManuallyItem, pauseItem, stopItem];

    return Promise.resolve(items);
  }
}
