// 加载 fflate 的 UMD 版本
importScripts('https://cdn.jsdelivr.net/npm/fflate@0.8.2/umd/index.min.js');

self.onmessage = (e) => {
    const { action, files, data } = e.data;

    if (action === 'compress') {
        // 使用 fflate 的 zipSync 压缩文件
        const zipped = fflate.zipSync(files, { level: 1});
        self.postMessage({
            action: 'compressed',
            result: zipped
        });
    } else if (action === 'decompress') {
        // 使用 fflate 的 unzipSync 解压 ZIP 文件
        const unzipped = fflate.unzipSync(data);
        self.postMessage({
            action: 'decompressed',
            result: unzipped
        });
    }
};
