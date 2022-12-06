import * as vscode from "vscode";

import { CommandTuple } from ".";
import { Sairi } from "../../resource";

// Just a link to our webpage.

function openExternalLink(url: string): void {
  const uri = vscode.Uri.parse(url);
  vscode.env.openExternal(uri);
}

function authorPage(): void {
  openExternalLink(Sairi.Link.authorPage);
}

export const commands: CommandTuple[] = [
  [Sairi.Command.authorPage, authorPage],
];
