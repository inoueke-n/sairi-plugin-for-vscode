import * as vscode from "vscode";

import { Successful } from "@inoueke-n/sairi-common";

import { StatusTreeDataProvider } from "./dataProvider/status";
import { ManageSendTreeDataProvider } from "./dataProvider/manageSend";
import { HistoryTreeDataProvider } from "./dataProvider/history";
import { SendFeedbackTreeDataProvider } from "./dataProvider/feedback";
import { DataSendResult } from "../editHistory/sendEditHistory";

// Tree: 左側のメニュー

export function registerTreeDataProviders(
  event: vscode.Event<Successful<DataSendResult>>
): void {
  _register([
    ["sairi-collector-status", new StatusTreeDataProvider()],
    ["sairi-collector-managesend", new ManageSendTreeDataProvider()],
    ["sairi-collector-history", new HistoryTreeDataProvider(event)],
    ["sairi-collector-feedback", new SendFeedbackTreeDataProvider()],
  ]);
}

function _register(arr: [string, vscode.TreeDataProvider<any>][]) {
  arr.forEach((a) => {
    const [name, provider] = a;
    vscode.window.registerTreeDataProvider(name, provider);
  });
}
