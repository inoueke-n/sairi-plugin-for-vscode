type Base64 = string;
import axios from "axios";
import { Result, result } from "folktale";

export namespace api {
  export interface SendApiParams {
    uid: string;
    skipEncrypt: boolean;
    encryptedData: Buffer;
    encryptedKey: Base64;
    iv: Base64;
    success: boolean;
    reason?: string;
  }

  // Sned API
  export async function send(
    endpoint: string,
    params: SendApiParams
  ): Promise<Result<string, string>> {
    const { uid, encryptedData, encryptedKey, iv, skipEncrypt, success } =
      params;

    try {
      const r = await axios.post("/send", encryptedData, {
        baseURL: endpoint,
        headers: {
          // backendでここを見てBufferとして処理するので揃えないといけない
          "Content-Type": "application/kamakura",
        },
        params: {
          uid: uid,
          iv: iv,
          k: encryptedKey,
          skipEncrypt: skipEncrypt,
          success: success,
        },
      });

      console.log(r.data);

      return result.Ok(r.data["uploadUrl"] as string);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return result.Error(JSON.stringify(error.response));
      } else {
        return result.Error(JSON.stringify(error));
      }
    }
  }
}
