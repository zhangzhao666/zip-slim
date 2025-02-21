import { describe, it, expect } from "vitest";
import { zip, unZip, crc32 } from "../src";

describe("zip-lib", () => {
  it("should calculate CRC32 correctly", () => {
    const data = new Uint8Array([0x31, 0x32, 0x33, 0x34, 0x35]);
    const result = crc32(data);
    expect(result).toBe(0xCBF53A1C);
  });
  
  it("should calculate CRC32 correctly for empty data", () => {
    const data = new Uint8Array([]);
    const result = crc32(data);
    expect(result).toBe(0);
  });

  it("should calculate CRC32 correctly for a single byte", () => {
    const data = new Uint8Array([0x01]);
    const result = crc32(data);
    expect(result).toBe(0xa505df1b);
  });

  it("should calculate CRC32 correctly for different data", () => {
    const data = new Uint8Array([0x61, 0x62, 0x63, 0x64, 0x65]);
    const result = crc32(data);
    expect(result).toBe(0x8587d865);
  });

  it("should zip and unzip a file without compression", async () => {
    const date = new Date(2021, 0, 1);
    const inputFiles = [new File(["test content"], "test.txt", { lastModified: date.getTime() })];
    const zipFile = await zip(inputFiles, false);
    const unzippedFiles = await unZip(zipFile);

    expect(unzippedFiles.length).toBe(1);
    expect(unzippedFiles[0].name).toBe("test.txt");
    const text = await unzippedFiles[0].text();
    expect(text).toBe("test content");
    expect(unzippedFiles[0].lastModified).toBe(date.getTime());
  });

  it("should handle empty files when zipping and unzipping", async () => {
    const inputFiles = [new File([], "empty.txt")];
    const zipFile = await zip(inputFiles, false);
    const unzippedFiles = await unZip(zipFile);

    expect(unzippedFiles.length).toBe(1);
    expect(unzippedFiles[0].name).toBe("empty.txt");
    const text = await unzippedFiles[0].text();
    expect(text).toBe("");
  });

  it("should handle long filenames", async () => {
    const longFilename = "a".repeat(255);
    const inputFiles = [new File(["long filename test"], longFilename)];
    const zipFile = await zip(inputFiles, false);
    const unzippedFiles = await unZip(zipFile);

    expect(unzippedFiles.length).toBe(1);
    expect(unzippedFiles[0].name).toBe(longFilename);
    const text = await unzippedFiles[0].text();
    expect(text).toBe("long filename test");
  });

  it("should handle multiple files", async () => {
    const inputFiles = [
      new File(["file 1 content"], "file1.txt"),
      new File(["file 2 content"], "file2.txt")
    ];
    const zipFile = await zip(inputFiles, false); // Disable compression
    const unzippedFiles = await unZip(zipFile);

    expect(unzippedFiles.length).toBe(2);
    expect(unzippedFiles[0].name).toBe("file1.txt");
    expect(unzippedFiles[1].name).toBe("file2.txt");
    const text1 = await unzippedFiles[0].text();
    const text2 = await unzippedFiles[1].text();
    expect(text1).toBe("file 1 content");
    expect(text2).toBe("file 2 content");
  });

  it("should handle large files (e.g., 1MB file)", async () => {
    const largeContent = new Array(1024 * 1024).fill("a").join(""); // 1MB of "a"
    const inputFiles = [new File([largeContent], "large.txt")];
    const zipFile = await zip(inputFiles, false); // Disable compression
    const unzippedFiles = await unZip(zipFile);

    expect(unzippedFiles.length).toBe(1);
    expect(unzippedFiles[0].name).toBe("large.txt");
    const text = await unzippedFiles[0].text();
    expect(text).toBe(largeContent); // Check if the file content matches
  });
});