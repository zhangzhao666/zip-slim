import { crc32 } from "./crc32";
import {
  compressSingleFile,
  decompressZip,
  mergeZipFiles,
  runTasks,
} from "./zipUtils";
// @ts-ignore
import SingleFIleZipWorker from "./workers/singleFileZip.worker";
// @ts-ignore
import unzipWorker from "./workers/unzip.worker";

interface FileInfo {
  localHeader: Uint8Array;
  compressedData: Uint8Array;
  uncompressedSize: number;
  compressedSize: number;
  crc: number;
  method: number;
}

// 主线程压缩（不使用 Worker）
async function zip(files: File[], compressWhenPossible = true): Promise<File> {
  const fileInfos: FileInfo[] = [];
  for (const file of files) {
    const fileData = new Uint8Array(await file.arrayBuffer());
    const info = await compressSingleFile(
      fileData,
      file.name,
      compressWhenPossible,
      new Date(file.lastModified)
    );
    console.log(`File: ${file.name}`, info);
    fileInfos.push(info);
  }
  const zipFile = mergeZipFiles(fileInfos);
  console.log("Generated ZIP:", new Uint8Array(await zipFile.arrayBuffer()));
  return zipFile;
}

// 主线程解压（不使用 Worker）
async function unZip(zipFile: File): Promise<File[]> {
  const zipData = new Uint8Array(await zipFile.arrayBuffer());
  const filesData = await decompressZip(zipData);
  return filesData.map(
    (f) => new File([f.data], f.name, { lastModified: f.lastModified })
  );
}

// 使用 Worker 压缩
async function zipWithWorker(
  files: File[],
  compressWhenPossible = true,
  maxConcurrency: number = 200
): Promise<File> {
  const compressionPromises = files.map(
    (file) => () =>
      new Promise<FileInfo>((resolve, reject) => {
        const worker: Worker = new SingleFIleZipWorker();
        worker.onmessage = (e) => {
          if (e.data.error) {
            reject(new Error(e.data.error));
          } else {
            const fullData = new Uint8Array(e.data.result);
            const fileInfo = {
              localHeader: fullData.subarray(
                0,
                30 + fullData[26] + (fullData[27] << 8)
              ),
              compressedData: fullData.subarray(
                30 + fullData[26] + (fullData[27] << 8)
              ),
              uncompressedSize: e.data.uncompressedSize,
              compressedSize: e.data.compressedSize,
              crc: e.data.crc,
              method: e.data.method,
            };

            resolve(fileInfo);
          }
          worker.terminate();
        };
        worker.onerror = (error) => {
          reject(error);
          worker.terminate();
        };
        file.arrayBuffer().then((ab) => {
          worker.postMessage(
            { fileData: ab, fileName: file.name, compressWhenPossible },
            [ab]
          );
        });
      })
  );
  console.time("zipWithWorker");
  const fileInfos = await runTasks<FileInfo>(compressionPromises, maxConcurrency);
  console.timeEnd("zipWithWorker");

  // 合并生成 ZIP 文件
  return mergeZipFiles(fileInfos);
}

// 使用 Worker 解压
async function unZipWithWorker(zipFile: File): Promise<File[]> {
  return new Promise((resolve, reject) => {
    const worker: Worker = new unzipWorker();
    worker.onmessage = (e) => {
      if (e.data.error) {
        reject(new Error(e.data.error));
      } else {
        const files = e.data.result.map(
          (f: { name: string; data: ArrayBuffer; lastModified: number }) =>
            new File([f.data], f.name, { lastModified: f.lastModified })
        );
        resolve(files);
      }
      worker.terminate();
    };
    worker.onerror = (error) => {
      reject(error);
      worker.terminate();
    };
    zipFile
      .arrayBuffer()
      .then((ab) => worker.postMessage({ zipData: ab }, [ab]));
  });
}

export { zip, unZip, zipWithWorker, unZipWithWorker, crc32 };
