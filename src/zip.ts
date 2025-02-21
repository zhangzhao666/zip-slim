import { crc32 } from "./crc32";

const hasCompressionStreams = typeof CompressionStream !== "undefined";
const te = new TextEncoder();
const lengthSum = (ns: Uint8Array[]) => ns.reduce((memo, n) => memo + n.length, 0);

type GzipReadFn = (data: Uint8Array) => () => Promise<{ value: Uint8Array; done: boolean }>;

/**
 * 默认的 GZIP 压缩函数
 */
const makeGzipReadFn: GzipReadFn = (dataIn: Uint8Array) => {
  const cs = new CompressionStream("gzip");
  const writer = cs.writable.getWriter();
  const reader = cs.readable.getReader();
  writer.write(dataIn);
  writer.close();
  return async () => {
    const { value, done } = await reader.read();
    return { value: value || new Uint8Array(), done };
  };
};

/**
 * 压缩文件为 ZIP
 * @param inputFiles 输入文件数组
 * @param compressWhenPossible 是否尝试压缩
 * @param gzipReadFn 自定义 GZIP 读取函数
 * @returns 压缩后的 ZIP 文件
 */
export async function zip(
  inputFiles: File[],
  compressWhenPossible = true,
  gzipReadFn: GzipReadFn = makeGzipReadFn
): Promise<File> {
  const localHeaderOffsets: number[] = [];
  const attemptDeflate = hasCompressionStreams && compressWhenPossible;
  const numFiles = inputFiles.length;
  const filePaths = inputFiles.map((file) => te.encode(file.name));
  const fileData = await Promise.all(inputFiles.map((file) => file.arrayBuffer().then((ab) => new Uint8Array(ab))));
  const totalDataSize = lengthSum(fileData);
  const totalFilePathsSize = lengthSum(filePaths);
  const centralDirectorySize = numFiles * 46 + totalFilePathsSize;
  const maxZipSize = totalDataSize + numFiles * 30 + totalFilePathsSize + centralDirectorySize + 22;
  const now = new Date();
  const zip = new Uint8Array(maxZipSize);

  let b = 0;

  for (let fileIndex = 0; fileIndex < numFiles; fileIndex++) {
    localHeaderOffsets[fileIndex] = b;
    const filePath = filePaths[fileIndex];
    const filePathSize = filePath.length;
    const uncompressed = fileData[fileIndex];
    const uncompressedSize = uncompressed.length;
    const lm = new Date(inputFiles[fileIndex].lastModified ?? now);
    const mtime = ((lm.getSeconds() / 2) | 0) + (lm.getMinutes() << 5) + (lm.getHours() << 11);
    const mdate = lm.getDate() + ((lm.getMonth() + 1) << 5) + ((lm.getFullYear() - 1980) << 9);

    let compressedSize = 0;
    let abortDeflate = false;

    zip[b++] = 0x50; zip[b++] = 0x4b; zip[b++] = 0x03; zip[b++] = 0x04;
    zip[b++] = 20; zip[b++] = 0;
    zip[b++] = 0; zip[b++] = 0b1000;
    const bDeflate = b;
    zip[b++] = zip[b++] = 0;
    zip[b++] = mtime & 0xff; zip[b++] = mtime >> 8;
    zip[b++] = mdate & 0xff; zip[b++] = mdate >> 8;
    let bCrc = b; b += 8;
    zip[b++] = uncompressedSize & 0xff; zip[b++] = (uncompressedSize >> 8) & 0xff;
    zip[b++] = (uncompressedSize >> 16) & 0xff; zip[b++] = uncompressedSize >> 24;
    zip[b++] = filePathSize & 0xff; zip[b++] = filePathSize >> 8;
    zip[b++] = zip[b++] = 0;
    zip.set(filePath, b); b += filePathSize;

    if (attemptDeflate) {
      const compressedStart = b;
      const read = gzipReadFn(uncompressed);
      let bytes: Uint8Array;
      let bytesStartOffset = 0;
      let bytesEndOffset = 0;

      deflate: {
        for (;;) {
          const data = await read();
          if (data.done) throw new Error("Bad gzip data");
          bytes = data.value;
          bytesStartOffset = bytesEndOffset;
          bytesEndOffset = bytesStartOffset + bytes.length;

          if (bytesStartOffset <= 3 && bytesEndOffset > 3 && bytes[3 - bytesStartOffset] & 0b11110) {
            abortDeflate = true;
            break deflate;
          }
          if (bytesEndOffset >= 10) {
            bytes = bytes.subarray(10 - bytesStartOffset);
            break;
          }
        }

        for (;;) {
          const bytesAlreadyWritten = b - compressedStart;
          if (bytesAlreadyWritten + bytes.length >= uncompressedSize + 8) {
            abortDeflate = true;
            break deflate;
          }
          zip.set(bytes, b);
          b += bytes.length;
          const data = await read();
          if (data.done) break;
          bytes = data.value;
        }
      }

      if (abortDeflate) {
        for (;;) {
          const bytesLength = bytes.length;
          const copyBytes = 8 - bytesLength;
          const bPrev = b;
          b = compressedStart;
          for (let i = 0; i < 8; i++) {
            zip[b++] = i < copyBytes ? zip[bPrev - copyBytes + i] : bytes[bytesLength - 8 + i];
          }
          const data = await read();
          if (data.done) break;
          bytes = data.value;
        }
      }

      b -= 8;
      zip[bCrc++] = zip[b++]; zip[bCrc++] = zip[b++]; zip[bCrc++] = zip[b++]; zip[bCrc++] = zip[b++];
      b -= 4;

      if (!abortDeflate) {
        zip[bDeflate] = 8;
        compressedSize = b - compressedStart;
      }
    }

    if (!attemptDeflate || abortDeflate) {
      zip.set(uncompressed, b);
      b += uncompressedSize;
      compressedSize = uncompressedSize;
      const crc = crc32(uncompressed);
      zip[bCrc++] = crc & 0xff; zip[bCrc++] = (crc >> 8) & 0xff;
      zip[bCrc++] = (crc >> 16) & 0xff; zip[bCrc++] = crc >> 24;
    }

    zip[bCrc++] = compressedSize & 0xff; zip[bCrc++] = (compressedSize >> 8) & 0xff;
    zip[bCrc++] = (compressedSize >> 16) & 0xff; zip[bCrc++] = compressedSize >> 24;
  }

  const centralDirectoryOffset = b;
  for (let fileIndex = 0; fileIndex < numFiles; fileIndex++) {
    const localHeaderOffset = localHeaderOffsets[fileIndex];
    const fileName = filePaths[fileIndex];
    const fileNameSize = fileName.length;

    zip[b++] = 0x50; zip[b++] = 0x4b; zip[b++] = 0x01; zip[b++] = 0x02;
    zip[b++] = 20; zip[b++] = 0;
    zip[b++] = 20; zip[b++] = 0;
    zip.set(zip.subarray(localHeaderOffset + 6, localHeaderOffset + 30), b); b += 24;
    zip[b++] = zip[b++] = zip[b++] = zip[b++] = zip[b++] = zip[b++] = zip[b++] = zip[b++] = zip[b++] = zip[b++] = 0;
    zip[b++] = localHeaderOffset & 0xff; zip[b++] = (localHeaderOffset >> 8) & 0xff;
    zip[b++] = (localHeaderOffset >> 16) & 0xff; zip[b++] = localHeaderOffset >> 24;
    zip.set(fileName, b); b += fileNameSize;
  }

  zip[b++] = 0x50; zip[b++] = 0x4b; zip[b++] = 0x05; zip[b++] = 0x06;
  zip[b++] = zip[b++] = zip[b++] = zip[b++] = 0;
  zip[b++] = numFiles & 0xff; zip[b++] = numFiles >> 8;
  zip[b++] = numFiles & 0xff; zip[b++] = numFiles >> 8;
  const centralDirectorySizeActual = b - centralDirectoryOffset;
  zip[b++] = centralDirectorySizeActual & 0xff; zip[b++] = (centralDirectorySizeActual >> 8) & 0xff;
  zip[b++] = (centralDirectorySizeActual >> 16) & 0xff; zip[b++] = centralDirectorySizeActual >> 24;
  zip[b++] = centralDirectoryOffset & 0xff; zip[b++] = (centralDirectoryOffset >> 8) & 0xff;
  zip[b++] = (centralDirectoryOffset >> 16) & 0xff; zip[b++] = centralDirectoryOffset >> 24;
  zip[b++] = zip[b++] = 0;

  return new File([zip.subarray(0, b)], "archive.zip", {
    type: "application/zip",
    lastModified: now.getTime(),
  });
}