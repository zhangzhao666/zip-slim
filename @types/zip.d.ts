type GzipReadFn = (data: Uint8Array) => () => Promise<{
    value: Uint8Array;
    done: boolean;
}>;
/**
 * 压缩文件为 ZIP
 * @param inputFiles 输入文件数组
 * @param compressWhenPossible 是否尝试压缩
 * @param gzipReadFn 自定义 GZIP 读取函数
 * @returns 压缩后的 ZIP 文件
 */
export declare function zip(inputFiles: File[], compressWhenPossible?: boolean, gzipReadFn?: GzipReadFn): Promise<File>;
export {};
