import axios from "axios";
import { Result, result } from "folktale";

// サーバのヘルスチェックAPIを叩く

export namespace api {
  export interface HealthCheckApiParams {
    uid: string;
    token: string;
  }

  export async function healthCheck(
    endpoint: string,
    params: HealthCheckApiParams
  ): Promise<Result<string, unknown>> {
    try {
      const r = await axios.get("/healthCheck", {
        baseURL: endpoint,
        params,
      });

      const success = r.status === 200;
      if (success) {
        return result.Ok({});
      } else {
        return result.Error(r.data);
      }
    } catch (err) {
      return result.Error("Unexpected error: " + err);
    }
  }
}
