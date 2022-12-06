import * as vscode from "vscode";

export function createTreeItem(arg: {
  label: string;
  tooltip?: string;
  command?: Pick<vscode.Command, "command">;
}): vscode.TreeItem {
  const { label, tooltip, command } = arg;
  const item = new vscode.TreeItem(label);
  item.tooltip = tooltip || label;
  item.command = command ? { command: command.command, title: "" } : undefined;

  return item;
}
