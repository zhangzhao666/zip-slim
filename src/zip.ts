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
 */
export async function zip(
  inputFiles: File[] | FileList,
  compressWhenPossible = true,
  gzipReadFn: GzipReadFn = makeGzipReadFn
): Promise<File> {
  if (inputFiles instanceof FileList) {
    inputFiles = Array.from(inputFiles);
  }

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
    const crc = crc32(uncompressed);

    console.log(`Compressing ${inputFiles[fileIndex].name}: uncompressedSize=${uncompressedSize}, crc32=${crc.toString(16)}`);

    zip[b++] = 0x50; zip[b++] = 0x4b; zip[b++] = 0x03; zip[b++] = 0x04;
    zip[b++] = 20; zip[b++] = 0;
    zip[b++] = 0; zip[b++] = 0;
    const bMethod = b;
    zip[b++] = 0; zip[b++] = 0;
    zip[b++] = mtime & 0xff; zip[b++] = mtime >> 8;
    zip[b++] = mdate & 0xff; zip[b++] = mdate >> 8;
    const bCrc = b;
    zip[b++] = crc & 0xff; zip[b++] = (crc >> 8) & 0xff;
    zip[b++] = (crc >> 16) & 0xff; zip[b++] = crc >> 24;
    const bCompressedSize = b;
    b += 4; // 占位 compressedSize
    zip[b++] = uncompressedSize & 0xff; zip[b++] = (uncompressedSize >> 8) & 0xff;
    zip[b++] = (uncompressedSize >> 16) & 0xff; zip[b++] = uncompressedSize >> 24;
    zip[b++] = filePathSize & 0xff; zip[b++] = filePathSize >> 8;
    zip[b++] = 0; zip[b++] = 0;
    zip.set(filePath, b); b += filePathSize;

    let compressedSize = uncompressedSize;

    if (attemptDeflate) {
      try {
        const compressedStart = b;
        const read = gzipReadFn(uncompressed);
        let totalLength = 0;
        const chunks: Uint8Array[] = [];

        // 收集所有压缩数据块
        while (true) {
          const { value, done } = await read();
          if (done) break;
          if (value) {
            chunks.push(value);
            totalLength += value.length;
          }
        }

        if (totalLength > 18) {
          // 预分配缓冲区，避免频繁扩展
          const compressedBytes = new Uint8Array(totalLength);
          let offset = 0;
          for (const chunk of chunks) {
            compressedBytes.set(chunk, offset);
            offset += chunk.length;
          }

          const deflateData = compressedBytes.subarray(10, totalLength - 8); // 移除 GZIP 头部和尾部
          if (deflateData.length < uncompressedSize) {
            zip.set(deflateData, b);
            b += deflateData.length;
            compressedSize = deflateData.length;
            zip[bMethod] = 8;
            console.log(`Method 8 - Compressed size: ${compressedSize}`);
          } else {
            console.warn(`Compression ineffective for ${inputFiles[fileIndex].name}, using method 0`);
            zip.set(uncompressed, b);
            b += uncompressedSize;
            console.log(`Method 0 - Stored CRC32: ${crc.toString(16)}`);
          }
        } else {
          throw new Error("Invalid compressed data");
        }
      } catch (e) {
        console.warn(`Deflate failed for ${inputFiles[fileIndex].name}: ${e}, using method 0`);
        zip.set(uncompressed, b);
        b += uncompressedSize;
        console.log(`Method 0 - Stored CRC32: ${crc.toString(16)}`);
      }
    } else {
      zip.set(uncompressed, b);
      b += uncompressedSize;
      console.log(`Method 0 - Stored CRC32: ${crc.toString(16)}`);
    }

    // 正确写入 compressedSize
    zip[bCompressedSize] = compressedSize & 0xff;
    zip[bCompressedSize + 1] = (compressedSize >> 8) & 0xff;
    zip[bCompressedSize + 2] = (compressedSize >> 16) & 0xff;
    zip[bCompressedSize + 3] = compressedSize >> 24;
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
    zip[b++] = 0; zip[b++] = 0;
    zip[b++] = 0; zip[b++] = 0;
    zip[b++] = 0; zip[b++] = 0;
    zip[b++] = 0; zip[b++] = 0; zip[b++] = 0; zip[b++] = 0;
    zip[b++] = localHeaderOffset & 0xff; zip[b++] = (localHeaderOffset >> 8) & 0xff;
    zip[b++] = (localHeaderOffset >> 16) & 0xff; zip[b++] = localHeaderOffset >> 24;
    zip.set(fileName, b); b += fileNameSize;
  }

  zip[b++] = 0x50; zip[b++] = 0x4b; zip[b++] = 0x05; zip[b++] = 0x06;
  zip[b++] = 0; zip[b++] = 0;
  zip[b++] = 0; zip[b++] = 0;
  zip[b++] = numFiles & 0xff; zip[b++] = numFiles >> 8;
  zip[b++] = numFiles & 0xff; zip[b++] = numFiles >> 8;
  const centralDirectorySizeActual = b - centralDirectoryOffset;
  zip[b++] = centralDirectorySizeActual & 0xff; zip[b++] = (centralDirectorySizeActual >> 8) & 0xff;
  zip[b++] = (centralDirectorySizeActual >> 16) & 0xff; zip[b++] = centralDirectorySizeActual >> 24;
  zip[b++] = centralDirectoryOffset & 0xff; zip[b++] = (centralDirectoryOffset >> 8) & 0xff;
  zip[b++] = (centralDirectoryOffset >> 16) & 0xff; zip[b++] = centralDirectoryOffset >> 24;
  zip[b++] = 0; zip[b++] = 0;

  return new File([zip.subarray(0, b)], "archive.zip", {
    type: "application/zip",
    lastModified: now.getTime(),
  });
}