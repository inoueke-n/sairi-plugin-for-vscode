import * as vscode from "vscode";
import { createTreeItem } from "../helper";
import { Sairi } from "../../resource";

export class SendFeedbackTreeDataProvider
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
    const item1 = createTreeItem({
      label: Sairi.Label.authorPage,
      command: { command: Sairi.Command.authorPage },
    });

    const items = [item1];

    return Promise.resolve(items);
  }
}
