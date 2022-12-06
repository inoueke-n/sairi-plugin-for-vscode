import { DocumentSelector } from "vscode-languageclient/node";

function commandName(name: string): string {
  return `sairi-collector.${name}`;
}

export namespace Sairi {
  export namespace Const {
    export const appName = "sairi-collector";
    export const editorName = "vscode";
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    export const appVersion = require("../../package.json").version;
  }

  export namespace Command {
    export const startRecording = commandName("startRecording");
    export const stopRecording = commandName("stopRecording");
    export const checkSettings = commandName("checkSettings");
    export const checkAPIHealth = commandName("checkAPIHealth");
    export const authorPage = commandName("authorPage");
    export const sendDataManually = commandName("sendDataManually");
    export const sendDataAutomatically = commandName("sendDataAutomatically");

    export namespace DataSend {
      export const pauseAutomaticSend = commandName("pauseAutomaticSend");
      export const stopAutomaticSend = commandName("stopAutomaticSend");
      export const onClickHistoryItem = commandName("onClickHistoryItem");
    }
  }

  export namespace Label {
    export const sendDataManually = "▶️Send manually";
    export const pauseAutomaticSend = "⏸️Pause automatic send";
    export const stopAutomaticSend = "✋Stop automatic send";
    export const authorPage = "🏠Webpage";
    export const settingsStatus = "⛳Settings Status";
    export const apiStatus = "⛳API Status";
    export const apiChannel = "API Channel";
  }

  export namespace Link {
    export const authorPage = "https://sel.ist.osaka-u.ac.jp/";
  }

  export namespace Message {
    export const settingsIsValid = "Settings is valid.";
  }

  export namespace Language {
    export const documentSelector: DocumentSelector = [
      { scheme: "file", language: "plaintext" },
      { scheme: "file", language: "javascript" },
      { scheme: "file", language: "typescript" },
      { scheme: "file", language: "go" },
      { scheme: "file", language: "python" },
      { scheme: "file", language: "java" },
      { scheme: "file", language: "c" },
      { scheme: "file", language: "cpp" },
      { scheme: "file", language: "csharp" },
      { scheme: "file", language: "css" },
      { scheme: "file", language: "html" },
      { scheme: "file", language: "php" },
      { scheme: "file", language: "swift" },
      { scheme: "file", language: "rust" },
      { scheme: "file", language: "ruby" },
      { scheme: "file", language: "php" },
      { scheme: "file", language: "vue" },
      { scheme: "file", language: "scss" },
      { scheme: "file", language: "javascriptreact" },
      { scheme: "file", language: "typescriptreact" },
    ];
  }
}
