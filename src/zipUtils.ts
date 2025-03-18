import { crc32 } from "./crc32";

const te = new TextEncoder();
const td = new TextDecoder("utf-8");
const hasCompressionStreams = typeof CompressionStream !== "undefined";
const hasDecompressionStreams = typeof DecompressionStream !== "undefined";

// 获取文件时间戳
function getZipTime(date: Date): { mtime: number; mdate: number } {
  const mtime =
    ((date.getSeconds() / 2) | 0) +
    (date.getMinutes() << 5) +
    (date.getHours() << 11);
  const mdate =
    date.getDate() +
    ((date.getMonth() + 1) << 5) +
    ((date.getFullYear() - 1980) << 9);
  return { mtime, mdate };
}

// 压缩单个文件的核心逻辑
export async function compressSingleFile(
  fileData: Uint8Array,
  fileName: string,
  compressWhenPossible: boolean,
  lastModified: Date = new Date()
): Promise<{
  localHeader: Uint8Array;
  compressedData: Uint8Array;
  uncompressedSize: number;
  compressedSize: number;
  crc: number;
  method: number;
}> {
  const uncompressed = fileData;
  const filePath = te.encode(fileName);
  const uncompressedSize = uncompressed.length;
  const crc = crc32(uncompressed);
  const { mtime, mdate } = getZipTime(lastModified);

  let compressedSize = uncompressedSize;
  let method = 0;
  let compressedData = uncompressed;

  if (compressWhenPossible && hasCompressionStreams) {
    try {
      const cs = new CompressionStream("gzip");
      const writer = cs.writable.getWriter();
      const reader = cs.readable.getReader();
      writer.write(uncompressed);
      writer.close();
      const chunks: Uint8Array[] = [];
      let totalLength = 0;
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        if (value) {
          chunks.push(value);
          totalLength += value.length;
        }
      }
      const compressedBytes = new Uint8Array(totalLength);
      let offset = 0;
      for (const chunk of chunks) {
        compressedBytes.set(chunk, offset);
        offset += chunk.length;
      }
      const deflateData = compressedBytes.subarray(10, totalLength - 8);
      if (deflateData.length < uncompressedSize) {
        compressedSize = deflateData.length;
        compressedData = deflateData;
        method = 8;
      }
    } catch (error) {
      console.warn(`Compression failed for ${fileName}: ${error}`);
    }
  }

  const headerSize = 30 + filePath.length;
  const localHeader = new Uint8Array(headerSize);
  let b = 0;
  localHeader[b++] = 0x50;
  localHeader[b++] = 0x4b;
  localHeader[b++] = 0x03;
  localHeader[b++] = 0x04;
  localHeader[b++] = 20;
  localHeader[b++] = 0; // version
  localHeader[b++] = 0;
  localHeader[b++] = 0; // flags
  localHeader[b++] = method;
  localHeader[b++] = 0; // compression method
  localHeader[b++] = mtime & 0xff;
  localHeader[b++] = mtime >> 8;
  localHeader[b++] = mdate & 0xff;
  localHeader[b++] = mdate >> 8;
  localHeader[b++] = crc & 0xff;
  localHeader[b++] = (crc >> 8) & 0xff;
  localHeader[b++] = (crc >> 16) & 0xff;
  localHeader[b++] = crc >> 24;
  localHeader[b++] = compressedSize & 0xff;
  localHeader[b++] = (compressedSize >> 8) & 0xff;
  localHeader[b++] = (compressedSize >> 16) & 0xff;
  localHeader[b++] = compressedSize >> 24;
  localHeader[b++] = uncompressedSize & 0xff;
  localHeader[b++] = (uncompressedSize >> 8) & 0xff;
  localHeader[b++] = (uncompressedSize >> 16) & 0xff;
  localHeader[b++] = uncompressedSize >> 24;
  localHeader[b++] = filePath.length & 0xff;
  localHeader[b++] = filePath.length >> 8;
  localHeader[b++] = 0;
  localHeader[b++] = 0; // extra field length
  localHeader.set(filePath, b);

  return {
    localHeader,
    compressedData,
    uncompressedSize,
    compressedSize,
    crc,
    method,
  };
}

// 解压 ZIP 文件的核心逻辑
export async function decompressZip(
  zipData: Uint8Array
): Promise<{ name: string; data: ArrayBuffer; lastModified: number }[]> {
  const dv = new DataView(zipData.buffer);
  const files: { name: string; data: ArrayBuffer; lastModified: number }[] = [];
  let offset = 0;

  while (offset < zipData.length) {
    const signature = dv.getUint32(offset, true);
    if (signature !== 0x04034b50) break;

    offset += 4;
    const compressionMethod = dv.getUint16(offset + 4, true);
    const modTime = dv.getUint16(offset + 6, true);
    const modDate = dv.getUint16(offset + 8, true);
    const crc32Stored = dv.getUint32(offset + 10, true);
    const compressedSize = dv.getUint32(offset + 14, true);
    const uncompressedSize = dv.getUint32(offset + 18, true);
    const fileNameLength = dv.getUint16(offset + 22, true);
    const extraFieldLength = dv.getUint16(offset + 24, true);

    offset += 26;
    const fileName = td.decode(
      zipData.subarray(offset, offset + fileNameLength)
    );
    offset += fileNameLength + extraFieldLength;

    const lastModified = new Date(
      ((modDate >> 9) & 0x7f) + 1980,
      ((modDate >> 5) & 0x0f) - 1,
      modDate & 0x1f,
      (modTime >> 11) & 0x1f,
      (modTime >> 5) & 0x3f,
      (modTime & 0x1f) * 2
    );

    let fileData: Uint8Array;
    if (compressionMethod === 0) {
      fileData = zipData.subarray(offset, offset + compressedSize);
      if (crc32(fileData) !== crc32Stored) {
        throw new Error(`CRC32 mismatch for ${fileName}`);
      }
    } else if (compressionMethod === 8 && hasDecompressionStreams) {
      const gzipData = new Uint8Array(compressedSize + 18);
      gzipData.set([0x1f, 0x8b, 0x08, 0, 0, 0, 0, 0, 0, 0x03]);
      gzipData.set(zipData.subarray(offset, offset + compressedSize), 10);
      new DataView(gzipData.buffer).setUint32(
        compressedSize + 10,
        crc32Stored,
        true
      );
      new DataView(gzipData.buffer).setUint32(
        compressedSize + 14,
        uncompressedSize,
        true
      );

      const ds = new DecompressionStream("gzip");
      const writer = ds.writable.getWriter();
      const reader = ds.readable.getReader();
      writer.write(gzipData);
      writer.close();

      fileData = new Uint8Array(uncompressedSize);
      let written = 0;
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        fileData.set(value, written);
        written += value.length;
      }
    } else {
      throw new Error(`Unsupported compression method ${compressionMethod}`);
    }

    files.push({
      name: fileName,
      data: fileData.buffer,
      lastModified: lastModified.getTime(),
    });
    offset += compressedSize;
  }

  return files;
}

export function mergeZipFiles(
  fileInfos: {
    localHeader: Uint8Array;
    compressedData: Uint8Array;
    uncompressedSize: number;
    compressedSize: number;
    crc: number;
    method: number;
  }[]
): File {
  const localHeaderOffsets: number[] = [];
  const parts: Uint8Array[] = [];
  let offset = 0;

  // 本地文件头和数据
  for (let i = 0; i < fileInfos.length; i++) {
    const info = fileInfos[i];
    localHeaderOffsets[i] = offset;
    parts.push(info.localHeader);
    parts.push(info.compressedData);
    offset += info.localHeader.length + info.compressedData.length;
  }

  const centralDirectoryOffset = offset;
  for (let i = 0; i < fileInfos.length; i++) {
    const info = fileInfos[i];
    const fileNameLength = info.localHeader[26] + (info.localHeader[27] << 8);
    const filePath = info.localHeader.subarray(30, 30 + fileNameLength);
    const cd = new Uint8Array(46 + filePath.length); // 固定 46 字节 + 文件名
    let b = 0;
    cd[b++] = 0x50;
    cd[b++] = 0x4b;
    cd[b++] = 0x01;
    cd[b++] = 0x02; // 签名
    cd[b++] = 20;
    cd[b++] = 0; // version made by
    cd[b++] = 20;
    cd[b++] = 0; // version needed
    cd.set(info.localHeader.subarray(6, 26), b);
    b += 20; // 标志到文件名长度之前
    cd[b++] = filePath.length & 0xff;
    cd[b++] = filePath.length >> 8; // 文件名长度
    cd[b++] = 0;
    cd[b++] = 0; // 额外字段长度
    cd[b++] = 0;
    cd[b++] = 0; // 文件注释长度
    cd[b++] = 0;
    cd[b++] = 0; // 磁盘编号
    cd[b++] = 0;
    cd[b++] = 0; // 内部文件属性
    cd[b++] = 0;
    cd[b++] = 0;
    cd[b++] = 0;
    cd[b++] = 0; // 外部文件属性
    cd[b++] = localHeaderOffsets[i] & 0xff;
    cd[b++] = (localHeaderOffsets[i] >> 8) & 0xff;
    cd[b++] = (localHeaderOffsets[i] >> 16) & 0xff;
    cd[b++] = localHeaderOffsets[i] >> 24;
    cd.set(filePath, b); // 写入文件名
    parts.push(cd);
  }

  const centralDirectorySize = parts
    .slice(fileInfos.length * 2)
    .reduce((sum, part) => sum + part.length, 0);
  const eocd = new Uint8Array(22);
  let b = 0;
  eocd[b++] = 0x50;
  eocd[b++] = 0x4b;
  eocd[b++] = 0x05;
  eocd[b++] = 0x06;
  eocd[b++] = 0;
  eocd[b++] = 0;
  eocd[b++] = 0;
  eocd[b++] = 0;
  eocd[b++] = fileInfos.length & 0xff;
  eocd[b++] = fileInfos.length >> 8;
  eocd[b++] = fileInfos.length & 0xff;
  eocd[b++] = fileInfos.length >> 8;
  eocd[b++] = centralDirectorySize & 0xff;
  eocd[b++] = (centralDirectorySize >> 8) & 0xff;
  eocd[b++] = (centralDirectorySize >> 16) & 0xff;
  eocd[b++] = centralDirectorySize >> 24;
  eocd[b++] = centralDirectoryOffset & 0xff;
  eocd[b++] = (centralDirectoryOffset >> 8) & 0xff;
  eocd[b++] = (centralDirectoryOffset >> 16) & 0xff;
  eocd[b++] = centralDirectoryOffset >> 24;
  eocd[b++] = 0;
  eocd[b++] = 0;
  parts.push(eocd);

  const totalLength = parts.reduce((sum, part) => sum + part.length, 0);
  const zip = new Uint8Array(totalLength);
  let pos = 0;
  for (const part of parts) {
    zip.set(part, pos);
    pos += part.length;
  }

  return new File([zip], "archive.zip", {
    type: "application/zip",
    lastModified: Date.now(),
  });
}

export async function runTasks<T>(
  taskFns: Array<() => Promise<T>>, // 任务函数数组
  maxConcurrency: number // 最大并行执行数量
): Promise<T[]> {
  // 输入验证
  if (!Array.isArray(taskFns) || taskFns.length === 0) {
    return Promise.resolve([]);
  }
  if (maxConcurrency < 1) {
    throw new Error('maxConcurrency must be at least 1');
  }

  const results: T[] = new Array(taskFns.length);
  const executing = new Set<Promise<any>>(); // 跟踪正在执行的任务
  let index = 0; // 当前任务索引

  // 执行单个任务的辅助函数
  const executeTask = async (): Promise<void> => {
    while (index < taskFns.length) {
      const currentIndex = index++;
      const task = taskFns[currentIndex];
      
      const promise = task();
      executing.add(promise);
      try {
        const result = await promise;
        results[currentIndex] = result;
      } catch (error) {
        results[currentIndex] = await Promise.reject(error);
      } finally {
        executing.delete(promise);
      }
      
      // 如果还有任务且当前并发数小于最大值，继续执行
      if (index < taskFns.length && executing.size < maxConcurrency) {
        await executeTask();
      }
    }
  };

  // 启动初始并发任务
  const initialTasks = Math.min(maxConcurrency, taskFns.length);
  const workers = Array(initialTasks).fill(null).map(() => executeTask());

  // 等待所有任务完成
  await Promise.all(workers);
  return results;
}
