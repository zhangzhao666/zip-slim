import { crc32 } from "./crc32";

const td = new TextDecoder("utf-8");
const hasDecompressionStreams = typeof DecompressionStream !== "undefined";

/**
 * 解压 ZIP 文件
 * @param zipFile 输入的 ZIP 文件
 * @returns 解压后的文件数组
 */
export async function unZip(zipFile: File): Promise<File[]> {
  const zipArrayBuffer = await zipFile.arrayBuffer();
  const zipData = new Uint8Array(zipArrayBuffer);
  const dv = new DataView(zipData.buffer, zipData.byteOffset, zipData.byteLength);
  const files: File[] = [];
  let offset = 0;

  while (offset < zipData.length) {
    const signature = dv.getUint32(offset, true);
    if (signature !== 0x04034b50) break;

    offset += 4;

    const version = dv.getUint16(offset, true);
    const flags = dv.getUint16(offset + 2, true);
    const compressionMethod = dv.getUint16(offset + 4, true);
    const modTime = dv.getUint16(offset + 6, true);
    const modDate = dv.getUint16(offset + 8, true);
    const crc32Stored = dv.getUint32(offset + 10, true);
    const compressedSize = dv.getUint32(offset + 14, true);
    const uncompressedSize = dv.getUint32(offset + 18, true);
    const fileNameLength = dv.getUint16(offset + 22, true);
    const extraFieldLength = dv.getUint16(offset + 24, true);

    offset += 26;

    const fileNameBytes = zipData.subarray(offset, offset + fileNameLength);
    const fileName = td.decode(fileNameBytes);
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
      const calculatedCrc = crc32(fileData);
      if (calculatedCrc !== crc32Stored) {
        throw new Error(`CRC32 mismatch for file ${fileName}: calculated=${calculatedCrc.toString(16)}, stored=${crc32Stored.toString(16)}`);
      }
    } else if (compressionMethod === 8 && hasDecompressionStreams) {
      const gzipData = new Uint8Array(compressedSize + 18);
      gzipData.set([0x1f, 0x8b, 0x08, 0, 0, 0, 0, 0, 0, 0x03]);
      gzipData.set(zipData.subarray(offset, offset + compressedSize), 10);
      new DataView(gzipData.buffer).setUint32(compressedSize + 10, crc32Stored, true);
      new DataView(gzipData.buffer).setUint32(compressedSize + 14, uncompressedSize, true);

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
      throw new Error(`Unsupported compression method ${compressionMethod} for file ${fileName}`);
    }

    const file = new File([fileData], fileName, {
      lastModified: lastModified.getTime(),
    });
    files.push(file);
    offset += compressedSize;
  }

  return files;
}