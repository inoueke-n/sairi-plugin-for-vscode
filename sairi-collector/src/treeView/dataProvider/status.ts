import * as vscode from "vscode";
import { createTreeItem } from "../helper";
import { Sairi } from "../../resource";

export class StatusTreeDataProvider
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
    const items = [
      createTreeItem({
        label: Sairi.Label.settingsStatus,
        tooltip: "Sairi Plugin settings status",
        command: { command: Sairi.Command.checkSettings },
      }),
      createTreeItem({
        label: Sairi.Label.apiStatus,
        tooltip: "Kamakura API Status",
        command: {
          command: Sairi.Command.checkAPIHealth,
        },
      }),
    ];

    return Promise.resolve(items);
  }
}
