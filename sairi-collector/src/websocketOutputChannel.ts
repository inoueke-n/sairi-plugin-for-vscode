/* eslint-disable @typescript-eslint/no-empty-function */
import { OutputChannel } from "vscode";
import * as vscode from "vscode";
import * as Websocket from "ws";

// Language server と接続するためのソケット

let socket: Websocket | null = null;

vscode.commands.registerCommand(`lsp.startStreaming`, () => {
  // Establish websocket connection
  console.log("START STREAMING");
  socket = new Websocket(`ws://localhost:9999`);
});

function hackLog(log: string): string {
  const index = log.indexOf("[LSP   ");
  if (index >= 0) {
    log = log.slice(0, index + 4) + "  " + log.slice(index + 4);
  }
  return log;
}

let log = "";
export const websocketOutputChannel: OutputChannel = {
  name: "websocket",
  // Only append the logs but send them later
  append(value: string) {
    log = hackLog(log);
    log += value;
    // console.log(value);
  },
  appendLine(value: string) {
    log += value;
    // Don't send logs until WebSocket initialization
    if (socket && socket.readyState === Websocket.OPEN) {
      // logをちょっと変える
      log = hackLog(log);

      socket.send(log);
    }
    // console.log(log);
    log = "";
  },
  clear() {},
  show() {},
  hide() {},
  dispose() {},
  replace() {},
};
