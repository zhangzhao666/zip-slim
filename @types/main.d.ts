import { crc32 } from "./crc32";
declare function zip(files: File[], compressWhenPossible?: boolean): Promise<File>;
declare function unZip(zipFile: File): Promise<File[]>;
declare function zipWithWorker(files: File[], compressWhenPossible?: boolean): Promise<File>;
declare function unZipWithWorker(zipFile: File): Promise<File[]>;
export { zip, unZip, zipWithWorker, unZipWithWorker, crc32 };
