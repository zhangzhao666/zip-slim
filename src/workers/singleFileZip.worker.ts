import { compressSingleFile } from '../zipUtils';

self.onmessage = async (e) => {
  const { fileData, fileName, compressWhenPossible } = e.data;
  console.log('singleFileZipWorker onmessage');
  try {
    console.log("fileData", fileData);
    const result = await compressSingleFile(new Uint8Array(fileData), fileName, compressWhenPossible);
    console.log("result", result);
    const fullData = new Uint8Array(result.localHeader.length + result.compressedData.length);
    fullData.set(result.localHeader);
    fullData.set(result.compressedData, result.localHeader.length);
    self.postMessage({
      result: fullData.buffer,
      fileName,
      uncompressedSize: result.uncompressedSize,
      compressedSize: result.compressedSize,
      crc: result.crc,
      method: result.method
    }, { transfer: [fullData.buffer] });
  } catch (error) {
    self.postMessage({ error: error });
  }
};
