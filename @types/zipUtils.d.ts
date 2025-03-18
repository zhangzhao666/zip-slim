export declare function compressSingleFile(fileData: Uint8Array, fileName: string, compressWhenPossible: boolean, lastModified?: Date): Promise<{
    localHeader: Uint8Array;
    compressedData: Uint8Array;
    uncompressedSize: number;
    compressedSize: number;
    crc: number;
    method: number;
}>;
export declare function decompressZip(zipData: Uint8Array): Promise<{
    name: string;
    data: ArrayBuffer;
    lastModified: number;
}[]>;
export declare function mergeZipFiles(fileInfos: {
    localHeader: Uint8Array;
    compressedData: Uint8Array;
    uncompressedSize: number;
    compressedSize: number;
    crc: number;
    method: number;
}[]): File;
export declare function runTasks<T>(taskFns: Array<() => Promise<T>>, // 任务函数数组
maxConcurrency: number): Promise<T[]>;
