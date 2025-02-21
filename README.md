# zip-slim

A lightweight ZIP compression and decompression library for modern JavaScript environments, with a package size of only 7KB.

## Features
- Compress files into ZIP format
- Decompress ZIP files
- Supports both uncompressed and deflate (gzip) compression methods
- Built with TypeScript for type safety
- Implement compression and decompression based on the latest client API

## Installation

```bash
npm install zip-slim
```

# Usage
## Compressing Files

```bash
import { zip } from "zip-slim";

const files = [new File(["Hello World"], "hello.txt")];
zip(files).then((zipFile) => {
  console.log("ZIP file created:", zipFile);
});
```

## Decompressing Files

```bash
import { unZip } from "zip-slim";

unZip(zipFile).then((files) => {
  console.log("Extracted files:", files);
});
```

## Requirements
- Modern browser with CompressionStream and DecompressionStream support (for deflate compression/decompression)

## License

[MIT](/LICENSE)