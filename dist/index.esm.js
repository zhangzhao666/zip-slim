var e=null,t=function(t,r){void 0===r&&(r=0),e||function(){var t,r,n,a=Int32Array,i=new a(256),o=new a(4096);for(r=0;r<256;r++){t=r;for(var u=0;u<8;u++)t=1&t?-306674912^t>>>1:t>>>1;o[r]=i[r]=t}for(r=0;r<256;r++)for(n=i[r],t=256+r;t<4096;t+=256)n=o[t]=n>>>8^i[255&n];for(e=[i],r=1;r<16;r++)e[r]=o.subarray(256*r,256*(r+1))}();for(var n=e,a=n[0],i=n[1],o=n[2],u=n[3],c=n[4],s=n[5],l=n[6],f=n[7],d=n[8],h=n[9],p=n[10],w=n[11],b=n[12],g=n[13],y=n[14],v=n[15],m=~r,U=0,S=t.length-15;U<S;)m=v[t[U++]^255&m]^y[t[U++]^m>>8&255]^g[t[U++]^m>>16&255]^b[t[U++]^m>>>24]^w[t[U++]]^p[t[U++]]^h[t[U++]]^d[t[U++]]^f[t[U++]]^l[t[U++]]^s[t[U++]]^c[t[U++]]^u[t[U++]]^o[t[U++]]^i[t[U++]]^a[t[U++]];for(;U<t.length;)m=m>>>8^a[255&(m^t[U++])];return~m>>>0};function r(e,t,r,n){return new(r||(r=Promise))((function(a,i){function o(e){try{c(n.next(e))}catch(e){i(e)}}function u(e){try{c(n.throw(e))}catch(e){i(e)}}function c(e){var t;e.done?a(e.value):(t=e.value,t instanceof r?t:new r((function(e){e(t)}))).then(o,u)}c((n=n.apply(e,t||[])).next())}))}function n(e,t){var r,n,a,i={label:0,sent:function(){if(1&a[0])throw a[1];return a[1]},trys:[],ops:[]},o=Object.create(("function"==typeof Iterator?Iterator:Object).prototype);return o.next=u(0),o.throw=u(1),o.return=u(2),"function"==typeof Symbol&&(o[Symbol.iterator]=function(){return this}),o;function u(u){return function(c){return function(u){if(r)throw new TypeError("Generator is already executing.");for(;o&&(o=0,u[0]&&(i=0)),i;)try{if(r=1,n&&(a=2&u[0]?n.return:u[0]?n.throw||((a=n.return)&&a.call(n),0):n.next)&&!(a=a.call(n,u[1])).done)return a;switch(n=0,a&&(u=[2&u[0],a.value]),u[0]){case 0:case 1:a=u;break;case 4:return i.label++,{value:u[1],done:!1};case 5:i.label++,n=u[1],u=[0];continue;case 7:u=i.ops.pop(),i.trys.pop();continue;default:if(!(a=i.trys,(a=a.length>0&&a[a.length-1])||6!==u[0]&&2!==u[0])){i=0;continue}if(3===u[0]&&(!a||u[1]>a[0]&&u[1]<a[3])){i.label=u[1];break}if(6===u[0]&&i.label<a[1]){i.label=a[1],a=u;break}if(a&&i.label<a[2]){i.label=a[2],i.ops.push(u);break}a[2]&&i.ops.pop(),i.trys.pop();continue}u=t.call(e,i)}catch(e){u=[6,e],n=0}finally{r=a=0}if(5&u[0])throw u[1];return{value:u[0]?u[1]:void 0,done:!0}}([u,c])}}}"function"==typeof SuppressedError&&SuppressedError;var a=new TextDecoder("utf-8"),i="undefined"!=typeof DecompressionStream;function o(e){return r(this,void 0,void 0,(function(){var r,o,u,c,s,l,f,d,h,p,w,b,g,y,v,m,U,S,D,x,A,E,z,M,T,k;return n(this,(function(n){switch(n.label){case 0:return[4,e.arrayBuffer()];case 1:r=n.sent(),o=new Uint8Array(r),u=new DataView(o.buffer,o.byteOffset,o.byteLength),c=[],s=0,n.label=2;case 2:if(!(s<o.length))return[3,9];if(67324752!==u.getUint32(s,!0))return[3,9];if(s+=4,u.getUint16(s,!0),u.getUint16(s+2,!0),l=u.getUint16(s+4,!0),f=u.getUint16(s+6,!0),d=u.getUint16(s+8,!0),h=u.getUint32(s+10,!0),p=u.getUint32(s+14,!0),w=u.getUint32(s+18,!0),b=u.getUint16(s+22,!0),g=u.getUint16(s+24,!0),s+=26,y=o.subarray(s,s+b),v=a.decode(y),s+=b+g,m=new Date(1980+(d>>9&127),(d>>5&15)-1,31&d,f>>11&31,f>>5&63,2*(31&f)),U=void 0,0!==l)return[3,3];if(U=o.subarray(s,s+p),(S=t(U))!==h)throw new Error("CRC32 mismatch for file ".concat(v,": calculated=").concat(S.toString(16),", stored=").concat(h.toString(16)));return[3,8];case 3:if(8!==l||!i)return[3,7];(D=new Uint8Array(p+18)).set([31,139,8,0,0,0,0,0,0,3]),D.set(o.subarray(s,s+p),10),new DataView(D.buffer).setUint32(p+10,h,!0),new DataView(D.buffer).setUint32(p+14,w,!0),x=new DecompressionStream("gzip"),A=x.writable.getWriter(),E=x.readable.getReader(),A.write(D),A.close(),U=new Uint8Array(w),z=0,n.label=4;case 4:return[4,E.read()];case 5:return M=n.sent(),T=M.value,M.done?[3,6]:(U.set(T,z),z+=T.length,[3,4]);case 6:return[3,8];case 7:throw new Error("Unsupported compression method ".concat(l," for file ").concat(v));case 8:return k=new File([U],v,{lastModified:m.getTime()}),c.push(k),s+=p,[3,2];case 9:return[2,c]}}))}))}var u="undefined"!=typeof CompressionStream,c=new TextEncoder,s=function(e){return e.reduce((function(e,t){return e+t.length}),0)},l=function(e){var t=new CompressionStream("gzip"),a=t.writable.getWriter(),i=t.readable.getReader();return a.write(e),a.close(),function(){return r(void 0,void 0,void 0,(function(){var e,t,r;return n(this,(function(n){switch(n.label){case 0:return[4,i.read()];case 1:return e=n.sent(),t=e.value,r=e.done,[2,{value:t||new Uint8Array,done:r}]}}))}))}};function f(e){return r(this,arguments,void 0,(function(e,r,a){var i,o,f,d,h,p,w,b,g,y,v,m,U,S,D,x,A,E,z,M,T,k,C,B,F,I,O,R,V,j,P,W,G,H,L,Y,q,J,K,N;return void 0===r&&(r=!0),void 0===a&&(a=l),n(this,(function(n){switch(n.label){case 0:return i=[],o=u&&r,f=e.length,d=e.map((function(e){return c.encode(e.name)})),[4,Promise.all(e.map((function(e){return e.arrayBuffer().then((function(e){return new Uint8Array(e)}))})))];case 1:h=n.sent(),p=s(h),w=s(d),b=p+30*f+w+(46*f+w)+22,g=new Date,y=new Uint8Array(b),v=0,L=0,n.label=2;case 2:if(!(L<f))return[3,16];if(i[L]=v,m=d[L],U=m.length,S=h[L],D=S.length,x=new Date(null!==(N=e[L].lastModified)&&void 0!==N?N:g),A=(x.getSeconds()/2|0)+(x.getMinutes()<<5)+(x.getHours()<<11),E=x.getDate()+(x.getMonth()+1<<5)+(x.getFullYear()-1980<<9),z=0,M=!1,y[v++]=80,y[v++]=75,y[v++]=3,y[v++]=4,y[v++]=20,y[v++]=0,y[v++]=0,y[v++]=8,T=v,y[v++]=y[v++]=0,y[v++]=255&A,y[v++]=A>>8,y[v++]=255&E,y[v++]=E>>8,k=v,v+=8,y[v++]=255&D,y[v++]=D>>8&255,y[v++]=D>>16&255,y[v++]=D>>24,y[v++]=255&U,y[v++]=U>>8,y[v++]=y[v++]=0,y.set(m,v),v+=U,!o)return[3,14];C=v,B=a(S),F=void 0,I=0,O=0,n.label=3;case 3:return[4,B()];case 4:if((W=n.sent()).done)throw new Error("Bad gzip data");if(F=W.value,O=(I=O)+F.length,I<=3&&O>3&&30&F[3-I])return M=!0,[3,6];if(O>=10)return F=F.subarray(10-I),[3,6];n.label=5;case 5:return[3,3];case 6:return v-C+F.length>=D+8?(M=!0,[3,9]):(y.set(F,v),v+=F.length,[4,B()]);case 7:if((W=n.sent()).done)return[3,9];F=W.value,n.label=8;case 8:return[3,6];case 9:if(!M)return[3,13];n.label=10;case 10:for(R=F.length,V=8-R,j=v,v=C,P=0;P<8;P++)y[v++]=P<V?y[j-V+P]:F[R-8+P];return[4,B()];case 11:if((W=n.sent()).done)return[3,13];F=W.value,n.label=12;case 12:return[3,10];case 13:v-=8,y[k++]=y[v++],y[k++]=y[v++],y[k++]=y[v++],y[k++]=y[v++],v-=4,M||(y[T]=8,z=v-C),n.label=14;case 14:o&&!M||(y.set(S,v),v+=D,z=D,G=t(S),y[k++]=255&G,y[k++]=G>>8&255,y[k++]=G>>16&255,y[k++]=G>>24),y[k++]=255&z,y[k++]=z>>8&255,y[k++]=z>>16&255,y[k++]=z>>24,n.label=15;case 15:return L++,[3,2];case 16:for(H=v,L=0;L<f;L++)Y=i[L],q=d[L],J=q.length,y[v++]=80,y[v++]=75,y[v++]=1,y[v++]=2,y[v++]=20,y[v++]=0,y[v++]=20,y[v++]=0,y.set(y.subarray(Y+6,Y+30),v),v+=24,y[v++]=y[v++]=y[v++]=y[v++]=y[v++]=y[v++]=y[v++]=y[v++]=y[v++]=y[v++]=0,y[v++]=255&Y,y[v++]=Y>>8&255,y[v++]=Y>>16&255,y[v++]=Y>>24,y.set(q,v),v+=J;return y[v++]=80,y[v++]=75,y[v++]=5,y[v++]=6,y[v++]=y[v++]=y[v++]=y[v++]=0,y[v++]=255&f,y[v++]=f>>8,y[v++]=255&f,y[v++]=f>>8,K=v-H,y[v++]=255&K,y[v++]=K>>8&255,y[v++]=K>>16&255,y[v++]=K>>24,y[v++]=255&H,y[v++]=H>>8&255,y[v++]=H>>16&255,y[v++]=H>>24,y[v++]=y[v++]=0,[2,new File([y.subarray(0,v)],"archive.zip",{type:"application/zip",lastModified:g.getTime()})]}}))}))}export{t as crc32,o as unZip,f as zip};
