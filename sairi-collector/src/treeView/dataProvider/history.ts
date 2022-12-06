import * as vscode from "vscode";
import * as R from "ramda";
import {
  Successful,
  conditionalWhen,
  isSuccess,
  isFail,
} from "@inoueke-n/sairi-common";

import { successMessage, failMessage, warnMessage } from "./historyHelper";
import { DataSendResult } from "../../editHistory/sendEditHistory";
import { Sairi } from "../../resource";

type DataType = [Date, Successful<DataSendResult>];

function successCommand(savedLocation: string): vscode.Command {
  return {
    title: "THIS IS THE TITLE",
    tooltip: "THIS IS THE TOOLTIP",
    command: Sairi.Command.DataSend.onClickHistoryItem,
    arguments: [{ success: true, savedLocation }],
  };
}

function failCommand(msg: string): vscode.Command {
  return {
    title: "",
    tooltip: "",
    command: Sairi.Command.DataSend.onClickHistoryItem,
    arguments: [{ success: false, msg }],
  };
}

export class HistoryTreeDataProvider
  implements vscode.TreeDataProvider<DataType>
{
  private _onDidChangeTreeData: vscode.EventEmitter<DataType | undefined> =
    new vscode.EventEmitter<DataType | undefined>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  private data: DataType[];

  constructor(event: vscode.Event<Successful<DataSendResult>>) {
    this.data = [];

    // データ送信後にアイテムを追加
    event((e) => {
      this.add([new Date(), e]);
    });
  }

  private add(result: DataType) {
    this.data = R.prepend(result, this.data);

    // Fire change event
    this._onDidChangeTreeData.fire(undefined);
  }

  // アイテムにクリックしたときの挙動を仕込む
  getTreeItem(element: DataType): vscode.TreeItem | Thenable<vscode.TreeItem> {
    const [date, result] = element;
    if (isSuccess(result)) {
      const { level, msg, savedLocation } = result.value;
      const label = conditionalWhen<string, string>(level)
        .arm("warn", warnMessage(date, msg))
        .arm("info", successMessage(date, msg))
        .default("");
      const item = new vscode.TreeItem(label);
      item.command =
        level === "info"
          ? successCommand(savedLocation!)
          : failCommand("level is warn");
      return item;
    }
    if (isFail(result)) {
      const label = failMessage(date);
      const item = new vscode.TreeItem(label);
      item.tooltip = result.reason;
      item.command = failCommand(result.reason);
      return item;
    }

    throw new Error("Never");
  }

  getChildren(_element?: DataType): vscode.ProviderResult<DataType[]> {
    return this.data;
  }

  getParent?(_element: DataType): vscode.ProviderResult<DataType> {
    throw new Error("Method not implemented.");
  }
}
