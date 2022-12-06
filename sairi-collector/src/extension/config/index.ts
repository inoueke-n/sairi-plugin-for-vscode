import { ConfigGetter, getConfigCreator } from "./helper";

// 設定取得の定義一覧

export const getConfigUid: ConfigGetter<string> = getConfigCreator<string>(
  "sairi.api",
  "uid"
);

export const getConfigApiEndpoint: ConfigGetter<string> =
  getConfigCreator<string>("sairi.api", "endpoint");

export const getConfigPublicKey: ConfigGetter<string> = () =>
  getConfigCreator<string>("sairi.api", "publicKey")().map((x: string) =>
    x.replace(/\\n/g, "\n")
  );

export const getConfigAutomaticSendPeriod: ConfigGetter<number> =
  getConfigCreator<number>("sairi.send.automatic", "period");
