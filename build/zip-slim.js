var e={775:e=>{e.exports=function(e,t,r,n){var a=self||window;try{try{var o;try{o=new a.Blob([e])}catch(t){(o=new(a.BlobBuilder||a.WebKitBlobBuilder||a.MozBlobBuilder||a.MSBlobBuilder)).append(e),o=o.getBlob()}var s=a.URL||a.webkitURL,i=s.createObjectURL(o),c=new a[t](i,r);return s.revokeObjectURL(i),c}catch(n){return new a[t]("data:application/javascript,".concat(encodeURIComponent(e)),r)}}catch(e){if(!n)throw Error("Inline worker is not supported");return new a[t](n,r)}}}},t={};function r(n){var a=t[n];if(void 0!==a)return a.exports;var o=t[n]={exports:{}};return e[n](o,o.exports,r),o.exports}r.n=e=>{var t=e&&e.__esModule?()=>e.default:()=>e;return r.d(t,{a:t}),t},r.d=(e,t)=>{for(var n in t)r.o(t,n)&&!r.o(e,n)&&Object.defineProperty(e,n,{enumerable:!0,get:t[n]})},r.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),(()=>{var e;if("string"==typeof import.meta.url&&(e=import.meta.url),!e)throw new Error("Automatic publicPath is not supported in this browser");e=e.replace(/^blob:/,"").replace(/#.*$/,"").replace(/\?.*$/,"").replace(/\/[^\/]+$/,"/"),r.p=e})();var n={};r.d(n,{QR:()=>o,bt:()=>y,B3:()=>b,yU:()=>p,As:()=>m});let a=null;const o=(e,t=0)=>{a||(()=>{const e=Int32Array,t=new e(256),r=new e(4096);let n,o,s;for(o=0;o<256;o++){n=o;for(let e=0;e<8;e++)n=1&n?-306674912^n>>>1:n>>>1;r[o]=t[o]=n}for(o=0;o<256;o++)for(s=t[o],n=256+o;n<4096;n+=256)s=r[n]=s>>>8^t[255&s];for(a=[t],o=1;o<16;o++)a[o]=r.subarray(256*o,256*(o+1))})();const[r,n,o,s,i,c,l,d,f,u,h,w,g,p,y,m]=a;let b=~t,S=0;const U=e.length-15;for(;S<U;)b=m[e[S++]^255&b]^y[e[S++]^b>>8&255]^p[e[S++]^b>>16&255]^g[e[S++]^b>>>24]^w[e[S++]]^h[e[S++]]^u[e[S++]]^f[e[S++]]^d[e[S++]]^l[e[S++]]^c[e[S++]]^i[e[S++]]^s[e[S++]]^o[e[S++]]^n[e[S++]]^r[e[S++]];for(;S<e.length;)b=b>>>8^r[255&(b^e[S++])];return~b>>>0},s=new TextEncoder,i=new TextDecoder("utf-8"),c="undefined"!=typeof CompressionStream,l="undefined"!=typeof DecompressionStream;async function d(e,t,r,n=new Date){const a=e,i=s.encode(t),l=a.length,d=o(a),{mtime:f,mdate:u}={mtime:((h=n).getSeconds()/2|0)+(h.getMinutes()<<5)+(h.getHours()<<11),mdate:h.getDate()+(h.getMonth()+1<<5)+(h.getFullYear()-1980<<9)};var h;let w=l,g=0,p=a;if(r&&c)try{const e=new CompressionStream("gzip"),t=e.writable.getWriter(),r=e.readable.getReader();t.write(a),t.close();const n=[];let o=0;for(;;){const{value:e,done:t}=await r.read();if(t)break;e&&(n.push(e),o+=e.length)}const s=new Uint8Array(o);let i=0;for(const e of n)s.set(e,i),i+=e.length;const c=s.subarray(10,o-8);c.length<l&&(w=c.length,p=c,g=8)}catch(e){}const y=30+i.length,m=new Uint8Array(y);let b=0;return m[b++]=80,m[b++]=75,m[b++]=3,m[b++]=4,m[b++]=20,m[b++]=0,m[b++]=0,m[b++]=0,m[b++]=g,m[b++]=0,m[b++]=255&f,m[b++]=f>>8,m[b++]=255&u,m[b++]=u>>8,m[b++]=255&d,m[b++]=d>>8&255,m[b++]=d>>16&255,m[b++]=d>>24,m[b++]=255&w,m[b++]=w>>8&255,m[b++]=w>>16&255,m[b++]=w>>24,m[b++]=255&l,m[b++]=l>>8&255,m[b++]=l>>16&255,m[b++]=l>>24,m[b++]=255&i.length,m[b++]=i.length>>8,m[b++]=0,m[b++]=0,m.set(i,30),{localHeader:m,compressedData:p,uncompressedSize:l,compressedSize:w,crc:d,method:g}}function f(e){const t=[],r=[];let n=0;for(let a=0;a<e.length;a++){const o=e[a];t[a]=n,r.push(o.localHeader),r.push(o.compressedData),n+=o.localHeader.length+o.compressedData.length}const a=n;for(let n=0;n<e.length;n++){const a=e[n],o=a.localHeader[26]+(a.localHeader[27]<<8),s=a.localHeader.subarray(30,30+o),i=new Uint8Array(46+s.length);let c=0;i[c++]=80,i[c++]=75,i[c++]=1,i[c++]=2,i[c++]=20,i[c++]=0,i[c++]=20,i[c++]=0,i.set(a.localHeader.subarray(6,26),c),c+=20,i[c++]=255&s.length,i[c++]=s.length>>8,i[c++]=0,i[c++]=0,i[c++]=0,i[c++]=0,i[c++]=0,i[c++]=0,i[c++]=0,i[c++]=0,i[c++]=0,i[c++]=0,i[c++]=0,i[c++]=0,i[c++]=255&t[n],i[c++]=t[n]>>8&255,i[c++]=t[n]>>16&255,i[c++]=t[n]>>24,i.set(s,c),r.push(i)}const o=r.slice(2*e.length).reduce(((e,t)=>e+t.length),0),s=new Uint8Array(22);let i=0;s[i++]=80,s[i++]=75,s[i++]=5,s[i++]=6,s[i++]=0,s[i++]=0,s[i++]=0,s[i++]=0,s[i++]=255&e.length,s[i++]=e.length>>8,s[i++]=255&e.length,s[i++]=e.length>>8,s[i++]=255&o,s[i++]=o>>8&255,s[i++]=o>>16&255,s[i++]=o>>24,s[i++]=255&a,s[i++]=a>>8&255,s[i++]=a>>16&255,s[i++]=a>>24,s[i++]=0,s[i++]=0,r.push(s);const c=r.reduce(((e,t)=>e+t.length),0),l=new Uint8Array(c);let d=0;for(const e of r)l.set(e,d),d+=e.length;return new File([l],"archive.zip",{type:"application/zip",lastModified:Date.now()})}var u=r(775),h=r.n(u);function w(){return h()('let e=null;const t=(t,r=0)=>{e||(()=>{const t=Int32Array,r=new t(256),s=new t(4096);let n,o,a;for(o=0;o<256;o++){n=o;for(let e=0;e<8;e++)n=1&n?-306674912^n>>>1:n>>>1;s[o]=r[o]=n}for(o=0;o<256;o++)for(a=r[o],n=256+o;n<4096;n+=256)a=s[n]=a>>>8^r[255&a];for(e=[r],o=1;o<16;o++)e[o]=s.subarray(256*o,256*(o+1))})();const[s,n,o,a,c,l,d,i,f,m,g,h,u,p,w,y]=e;let S=~r,b=0;const z=t.length-15;for(;b<z;)S=y[t[b++]^255&S]^w[t[b++]^S>>8&255]^p[t[b++]^S>>16&255]^u[t[b++]^S>>>24]^h[t[b++]]^g[t[b++]]^m[t[b++]]^f[t[b++]]^i[t[b++]]^d[t[b++]]^l[t[b++]]^c[t[b++]]^a[t[b++]]^o[t[b++]]^n[t[b++]]^s[t[b++]];for(;b<t.length;)S=S>>>8^s[255&(S^t[b++])];return~S>>>0},r=new TextEncoder,s=(new TextDecoder("utf-8"),"undefined"!=typeof CompressionStream);self.onmessage=async e=>{const{fileData:n,fileName:o,compressWhenPossible:a}=e.data;try{const e=await async function(e,n,o,a=new Date){const c=e,l=r.encode(n),d=c.length,i=t(c),{mtime:f,mdate:m}={mtime:((g=a).getSeconds()/2|0)+(g.getMinutes()<<5)+(g.getHours()<<11),mdate:g.getDate()+(g.getMonth()+1<<5)+(g.getFullYear()-1980<<9)};var g;let h=d,u=0,p=c;if(o&&s)try{const e=new CompressionStream("gzip"),t=e.writable.getWriter(),r=e.readable.getReader();t.write(c),t.close();const s=[];let n=0;for(;;){const{value:e,done:t}=await r.read();if(t)break;e&&(s.push(e),n+=e.length)}const o=new Uint8Array(n);let a=0;for(const e of s)o.set(e,a),a+=e.length;const l=o.subarray(10,n-8);l.length<d&&(h=l.length,p=l,u=8)}catch(e){}const w=30+l.length,y=new Uint8Array(w);let S=0;return y[S++]=80,y[S++]=75,y[S++]=3,y[S++]=4,y[S++]=20,y[S++]=0,y[S++]=0,y[S++]=0,y[S++]=u,y[S++]=0,y[S++]=255&f,y[S++]=f>>8,y[S++]=255&m,y[S++]=m>>8,y[S++]=255&i,y[S++]=i>>8&255,y[S++]=i>>16&255,y[S++]=i>>24,y[S++]=255&h,y[S++]=h>>8&255,y[S++]=h>>16&255,y[S++]=h>>24,y[S++]=255&d,y[S++]=d>>8&255,y[S++]=d>>16&255,y[S++]=d>>24,y[S++]=255&l.length,y[S++]=l.length>>8,y[S++]=0,y[S++]=0,y.set(l,30),{localHeader:y,compressedData:p,uncompressedSize:d,compressedSize:h,crc:i,method:u}}(new Uint8Array(n),o,a),c=new Uint8Array(e.localHeader.length+e.compressedData.length);c.set(e.localHeader),c.set(e.compressedData,e.localHeader.length),self.postMessage({result:c.buffer,fileName:o,uncompressedSize:e.uncompressedSize,compressedSize:e.compressedSize,crc:e.crc,method:e.method},{transfer:[c.buffer]})}catch(e){self.postMessage({error:e})}};',"Worker",void 0,r.p+"singleFileZip.worker.js")}function g(){return h()('let e=null;const t=(t,r=0)=>{e||(()=>{const t=Int32Array,r=new t(256),n=new t(4096);let a,s,o;for(s=0;s<256;s++){a=s;for(let e=0;e<8;e++)a=1&a?-306674912^a>>>1:a>>>1;n[s]=r[s]=a}for(s=0;s<256;s++)for(o=r[s],a=256+s;a<4096;a+=256)o=n[a]=o>>>8^r[255&o];for(e=[r],s=1;s<16;s++)e[s]=n.subarray(256*s,256*(s+1))})();const[n,a,s,o,i,f,c,l,w,g,u,d,U,m,p,y]=e;let b=~r,h=0;const D=t.length-15;for(;h<D;)b=y[t[h++]^255&b]^p[t[h++]^b>>8&255]^m[t[h++]^b>>16&255]^U[t[h++]^b>>>24]^d[t[h++]]^u[t[h++]]^g[t[h++]]^w[t[h++]]^l[t[h++]]^c[t[h++]]^f[t[h++]]^i[t[h++]]^o[t[h++]]^s[t[h++]]^a[t[h++]]^n[t[h++]];for(;h<t.length;)b=b>>>8^n[255&(b^t[h++])];return~b>>>0},r=(new TextEncoder,new TextDecoder("utf-8")),n="undefined"!=typeof DecompressionStream;self.onmessage=async e=>{try{const a=await async function(e){const a=new DataView(e.buffer),s=[];let o=0;for(;o<e.length&&67324752===a.getUint32(o,!0);){o+=4;const i=a.getUint16(o+4,!0),f=a.getUint16(o+6,!0),c=a.getUint16(o+8,!0),l=a.getUint32(o+10,!0),w=a.getUint32(o+14,!0),g=a.getUint32(o+18,!0),u=a.getUint16(o+22,!0),d=a.getUint16(o+24,!0);o+=26;const U=r.decode(e.subarray(o,o+u));o+=u+d;const m=new Date(1980+(c>>9&127),(c>>5&15)-1,31&c,f>>11&31,f>>5&63,2*(31&f));let p;if(0===i){if(p=e.subarray(o,o+w),t(p)!==l)throw new Error(`CRC32 mismatch for ${U}`)}else{if(8!==i||!n)throw new Error(`Unsupported compression method ${i}`);{const t=new Uint8Array(w+18);t.set([31,139,8,0,0,0,0,0,0,3]),t.set(e.subarray(o,o+w),10),new DataView(t.buffer).setUint32(w+10,l,!0),new DataView(t.buffer).setUint32(w+14,g,!0);const r=new DecompressionStream("gzip"),n=r.writable.getWriter(),a=r.readable.getReader();n.write(t),n.close(),p=new Uint8Array(g);let s=0;for(;;){const{value:e,done:t}=await a.read();if(t)break;p.set(e,s),s+=e.length}}}s.push({name:U,data:p.buffer,lastModified:m.getTime()}),o+=w}return s}(new Uint8Array(e.data.zipData));self.postMessage({result:a},{transfer:a.map((e=>e.data))})}catch(e){self.postMessage({error:e})}};',"Worker",void 0,r.p+"unzip.worker.js")}async function p(e,t=!0){const r=[];for(const n of e){const e=new Uint8Array(await n.arrayBuffer()),a=await d(e,n.name,t,new Date(n.lastModified));r.push(a)}return f(r)}async function y(e){const t=new Uint8Array(await e.arrayBuffer()),r=await async function(e){const t=new DataView(e.buffer),r=[];let n=0;for(;n<e.length&&67324752===t.getUint32(n,!0);){n+=4;const a=t.getUint16(n+4,!0),s=t.getUint16(n+6,!0),c=t.getUint16(n+8,!0),d=t.getUint32(n+10,!0),f=t.getUint32(n+14,!0),u=t.getUint32(n+18,!0),h=t.getUint16(n+22,!0),w=t.getUint16(n+24,!0);n+=26;const g=i.decode(e.subarray(n,n+h));n+=h+w;const p=new Date(1980+(c>>9&127),(c>>5&15)-1,31&c,s>>11&31,s>>5&63,2*(31&s));let y;if(0===a){if(y=e.subarray(n,n+f),o(y)!==d)throw new Error(`CRC32 mismatch for ${g}`)}else{if(8!==a||!l)throw new Error(`Unsupported compression method ${a}`);{const t=new Uint8Array(f+18);t.set([31,139,8,0,0,0,0,0,0,3]),t.set(e.subarray(n,n+f),10),new DataView(t.buffer).setUint32(f+10,d,!0),new DataView(t.buffer).setUint32(f+14,u,!0);const r=new DecompressionStream("gzip"),a=r.writable.getWriter(),o=r.readable.getReader();a.write(t),a.close(),y=new Uint8Array(u);let s=0;for(;;){const{value:e,done:t}=await o.read();if(t)break;y.set(e,s),s+=e.length}}}r.push({name:g,data:y.buffer,lastModified:p.getTime()}),n+=f}return r}(t);return r.map((e=>new File([e.data],e.name,{lastModified:e.lastModified})))}async function m(e,t=!0,r=200){const n=e.map((e=>()=>new Promise(((r,n)=>{const a=new w;a.onmessage=e=>{if(e.data.error)n(new Error(e.data.error));else{const t=new Uint8Array(e.data.result),n={localHeader:t.subarray(0,30+t[26]+(t[27]<<8)),compressedData:t.subarray(30+t[26]+(t[27]<<8)),uncompressedSize:e.data.uncompressedSize,compressedSize:e.data.compressedSize,crc:e.data.crc,method:e.data.method};r(n)}a.terminate()},a.onerror=e=>{n(e),a.terminate()},e.arrayBuffer().then((r=>{a.postMessage({fileData:r,fileName:e.name,compressWhenPossible:t},[r])}))})))),a=await async function(e,t){if(!Array.isArray(e)||0===e.length)return Promise.resolve([]);if(t<1)throw new Error("maxConcurrency must be at least 1");const r=new Array(e.length),n=new Set;let a=0;const o=async()=>{for(;a<e.length;){const s=a++,i=(0,e[s])();n.add(i);try{const e=await i;r[s]=e}catch(e){r[s]=await Promise.reject(e)}finally{n.delete(i)}a<e.length&&n.size<t&&await o()}},s=Math.min(t,e.length),i=Array(s).fill(null).map((()=>o()));return await Promise.all(i),r}(n,r);return f(a)}async function b(e){return new Promise(((t,r)=>{const n=new g;n.onmessage=e=>{if(e.data.error)r(new Error(e.data.error));else{const r=e.data.result.map((e=>new File([e.data],e.name,{lastModified:e.lastModified})));t(r)}n.terminate()},n.onerror=e=>{r(e),n.terminate()},e.arrayBuffer().then((e=>n.postMessage({zipData:e},[e])))}))}var S=n.QR,U=n.bt,D=n.B3,z=n.yU,A=n.As;export{S as crc32,U as unZip,D as unZipWithWorker,z as zip,A as zipWithWorker};