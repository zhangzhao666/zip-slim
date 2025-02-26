import { decompressZip } from "../zipUtils";

self.onmessage = async (e) => {
  try {
    const files = await decompressZip(new Uint8Array(e.data.zipData));
    self.postMessage({ result: files }, { transfer: files.map(f => f.data) });
  } catch (error) {
    self.postMessage({ error: error });
  }
};
