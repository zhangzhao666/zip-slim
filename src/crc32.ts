let T: Int32Array[] | null = null;

const init = () => {
  const i32 = Int32Array;
  const T0 = new i32(256);
  const t = new i32(4096);
  let c: number, n: number, v: number;

  // 初始化 CRC32 查找表
  for (n = 0; n < 256; n++) {
    c = n;
    for (let i = 0; i < 8; i++) {
      c = c & 1 ? (-306674912 ^ (c >>> 1)) : c >>> 1;
    }
    t[n] = T0[n] = c;
  }
  for (n = 0; n < 256; n++) {
    v = T0[n];
    for (c = 256 + n; c < 4096; c += 256) {
      v = t[c] = (v >>> 8) ^ T0[v & 255];
    }
  }
  T = [T0];
  for (n = 1; n < 16; n++) {
    T[n] = t.subarray(n * 256, (n + 1) * 256);
  }
};

export const crc32 = (data: Uint8Array, seed = 0): number => {
  if (!T) init();
  const [T0, T1, T2, T3, T4, T5, T6, T7, T8, T9, Ta, Tb, Tc, Td, Te, Tf] = T!;
  let crc = seed ^ -1;
  let i = 0;
  const l = data.length - 15;

  // 批量处理 16 字节块
  while (i < l) {
    crc =
      Tf[data[i++] ^ (crc & 255)] ^
      Te[data[i++] ^ ((crc >> 8) & 255)] ^
      Td[data[i++] ^ ((crc >> 16) & 255)] ^
      Tc[data[i++] ^ (crc >>> 24)] ^
      Tb[data[i++]] ^
      Ta[data[i++]] ^
      T9[data[i++]] ^
      T8[data[i++]] ^
      T7[data[i++]] ^
      T6[data[i++]] ^
      T5[data[i++]] ^
      T4[data[i++]] ^
      T3[data[i++]] ^
      T2[data[i++]] ^
      T1[data[i++]] ^
      T0[data[i++]];
  }

  // 处理剩余字节
  while (i < data.length) {
    crc = (crc >>> 8) ^ T0[(crc ^ data[i++]) & 255];
  }

  return ~crc >>> 0; // 确保返回无符号整数
};
