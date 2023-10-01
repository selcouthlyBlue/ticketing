import nats, { Stan } from "node-nats-streaming";

class NatsWrapper {
  private static wrapper: NatsWrapper | null = null;
  private _client?: Stan;
  private constructor() {}

  get client() {
    if (!this._client) {
      throw new Error("Cannot access NATS client before connecting");
    }
    return this._client;
  }

  static getInstance() {
    if (!NatsWrapper.wrapper) {
      NatsWrapper.wrapper = new NatsWrapper();
    }
    return NatsWrapper.wrapper;
  }

  connect(clusterId: string, clientId: string, url: string): Promise<void> {
    this._client = nats.connect(clusterId, clientId, { url });
    return new Promise((resolve, reject) => {
      this.client.on("connect", () => {
        console.log("Connect to NATS");
        resolve();
      });
      this.client.on("error", (err) => {
        reject(err);
      })
    })
  }
}

export const natsWrapper = NatsWrapper.getInstance();
