// import packageInfo from '../../package.json'
// import Toastify from "./toastify-js"
/**
 * 公共的小工具
 * @module utils/utils
 * @requires crypto-js 用来加密
 */
// import CryptoJS from './crypto-js'
/**
 * 防抖函数
 * @param fn 传入的函数
 * @param wait 等待的时间，默认600毫秒
 */
export function debounce(fn, wait) {
  wait = wait || 600

  if (window['' + fn]) clearTimeout(window['' + fn])
  window['' + fn] = setTimeout(() => {
    fn()
  }, wait)
}

export function showToastSuccess(message) {
  const toastElement = Toastify({
    text: message,
    gravity: 'bottom',
    position: 'right',
    duration: 10000,
    close: false,
    backgroundColor: "linear-gradient(to right, #00b09b, #96c93d)", // 绿色调，表示成功
  })
  toastElement.showToast()
}

export function showToastError(message) {
  const toastElement = Toastify({
    text: message,
    gravity: 'bottom',
    position: 'right',
    duration: 10000,
    close: false,
    backgroundColor: "linear-gradient(to right, #ff5f6d, #ffc371)", // 红色调，表示失败
  })
  toastElement.showToast()
}

/**
 * 节流函数
 */
export function throttle(fn, wait) {
  wait = wait || 600

  if (window['' + fn]) return
  fn()
  window['' + fn] = setTimeout(() => {
    fn()
    window['' + fn] = null
  }, wait)
}

/**
 * 控制台输出版本信息
 * @example
 * idea-note
 * 版 本 号：0.8.0
 * 编译日期：2022-11-23 01:51:34
 */
export function copyRightConsole() {
  /* 样式代码 */
  const projectNameStyle = 'font-size: 20px;font-weight: 600;color: rgb(244,167,89);'
  const descriptionStyle = 'font-style: oblique;font-size:14px;color: rgb(244,167,89);font-weight: 400;'
  const versionStyle = 'color: rgb(30,152,255);padding:8px 0 2px;'
  const dateTimeStyle = 'color: rgb(30,152,255);padding:0 0 5px;'

  /* 内容代码 */
  const projectName = packageInfo.name || ''
  const description = packageInfo.description || ''
  const version = `版 本 号：${packageInfo.version}` //     【ArcGIS API for JavaScript 版本：${packageInfo?.dependencies?.['@c_arcgis/core'] || packageInfo?.dependencies?.['@arcgis/core']}】
  const dateTime = `编译日期：${timeFormat(window.versionTime)}`

  // 空格有意义，不要格式化
  console.log(`%c${description} %c${projectName}
%c${version}
%c${dateTime}`, projectNameStyle, descriptionStyle, versionStyle, dateTimeStyle)
}

/**
 * 时间格式化函数
 * @param time
 * @returns {string}
 */
export function timeFormat(time) {
  // 检查时间戳长度，判断是秒还是毫秒，并据此转换成统一的毫秒时间戳
  const timestamp = time.toString().length === 10 ? time * 1000 : time;

  const dat = new Date(timestamp);

  // 一个小函数用于补零操作
  const pad = (number) => (number < 10 ? `0${number}` : number);

  // 获取年月日，时间
  const year = dat.getFullYear();
  const mon = pad(dat.getMonth() + 1);
  const day = pad(dat.getDate());
  const hour = pad(dat.getHours());
  const min = pad(dat.getMinutes());
  const sec = pad(dat.getSeconds());

  const newDate = `${year}-${mon}-${day} ${hour}:${min}:${sec}`;
  return newDate;
}

/**
 * @summary 拷贝内容到剪切板
 * @param text {String} 要拷贝的内容
 */
export async function copyToClipbrd(text) {
  try {
    await navigator.clipboard.writeText(text)
    console.log('Text successfully copied to clipboard')
  } catch (err) {
    console.error('Unable to copy text to clipboard', err)
  }
}

/**
 * 密钥是 www.glwsq.cn
 * @summary 对文本进行对称加密
 * @tutorial 笔记的加密与解密
 * @param data {String} 要加密的字符串
 * @returns {String} 加密后的字符串
 */
export function encrypt(data) {
  const ciphertext = CryptoJS.AES.encrypt(data, 'www.glwsq.cn').toString()
  return ciphertext
}

/**
 * 密钥是 www.glwsq.cn
 * @summary 对加密后的文本进行解密
 * @tutorial 笔记的加密与解密
 * @param data {String} 要解密的字符串
 * @returns {string} 解密后的字符串
 */
export function decrypt(data) {
  const bytes = CryptoJS.AES.decrypt(data, 'www.glwsq.cn')
  const originalText = bytes.toString(CryptoJS.enc.Utf8)
  return originalText
}

/**
 * 可以指定种子的随机函数发生器
 * @summary 随机数发生器
 * @constructor
 */
export class SeedRand {
  /**
   * 构造函数
   * @param options {{seed: Number, be: Number}} `seed 种子，be 保留位数`
   */
  constructor(options) {
    const _options = {
      seed: Date.now(), // 随机种子
      be: 0 // 保留小数点
    }
    for (const b in options) _options[b] = options[b]
    this.seed = (_options.seed || Date.now()) % 999999999
    this.be = _options.be
  }

  /**
   * 取一个随机整数
   * @param max {number} 最大值（0开始，不超过该值） 默认10
   * @returns {number} 返回一个随机数
   */
  next(max) {
    max = max || 10
    this.seed = (this.seed * 9301 + 49297) % 233280
    const val = this.seed / 233280.0
    return Number((val * max).toFixed(this.be))
  }
}

export function encryptExport(data) {

}

export function decryptExport(data) {

}


export function MD5(string) {

  function RotateLeft(lValue, iShiftBits) {
    return (lValue<<iShiftBits) | (lValue>>>(32-iShiftBits));
  }

  function AddUnsigned(lX,lY) {
    var lX4,lY4,lX8,lY8,lResult;
    lX8 = (lX & 0x80000000);
    lY8 = (lY & 0x80000000);
    lX4 = (lX & 0x40000000);
    lY4 = (lY & 0x40000000);
    lResult = (lX & 0x3FFFFFFF)+(lY & 0x3FFFFFFF);
    if (lX4 & lY4) {
      return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
    }
    if (lX4 | lY4) {
      if (lResult & 0x40000000) {
        return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
      } else {
        return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
      }
    } else {
      return (lResult ^ lX8 ^ lY8);
    }
  }

  function F(x,y,z) { return (x & y) | ((~x) & z); }
  function G(x,y,z) { return (x & z) | (y & (~z)); }
  function H(x,y,z) { return (x ^ y ^ z); }
  function I(x,y,z) { return (y ^ (x | (~z))); }

  function FF(a,b,c,d,x,s,ac) {
    a = AddUnsigned(a, AddUnsigned(AddUnsigned(F(b, c, d), x), ac));
    return AddUnsigned(RotateLeft(a, s), b);
  };

  function GG(a,b,c,d,x,s,ac) {
    a = AddUnsigned(a, AddUnsigned(AddUnsigned(G(b, c, d), x), ac));
    return AddUnsigned(RotateLeft(a, s), b);
  };

  function HH(a,b,c,d,x,s,ac) {
    a = AddUnsigned(a, AddUnsigned(AddUnsigned(H(b, c, d), x), ac));
    return AddUnsigned(RotateLeft(a, s), b);
  };

  function II(a,b,c,d,x,s,ac) {
    a = AddUnsigned(a, AddUnsigned(AddUnsigned(I(b, c, d), x), ac));
    return AddUnsigned(RotateLeft(a, s), b);
  };

  function ConvertToWordArray(string) {
    var lWordCount;
    var lMessageLength = string.length;
    var lNumberOfWords_temp1=lMessageLength + 8;
    var lNumberOfWords_temp2=(lNumberOfWords_temp1-(lNumberOfWords_temp1 % 64))/64;
    var lNumberOfWords = (lNumberOfWords_temp2+1)*16;
    var lWordArray=Array(lNumberOfWords-1);
    var lBytePosition = 0;
    var lByteCount = 0;
    while ( lByteCount < lMessageLength ) {
      lWordCount = (lByteCount-(lByteCount % 4))/4;
      lBytePosition = (lByteCount % 4)*8;
      lWordArray[lWordCount] = (lWordArray[lWordCount] | (string.charCodeAt(lByteCount)<<lBytePosition));
      lByteCount++;
    }
    lWordCount = (lByteCount-(lByteCount % 4))/4;
    lBytePosition = (lByteCount % 4)*8;
    lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80<<lBytePosition);
    lWordArray[lNumberOfWords-2] = lMessageLength<<3;
    lWordArray[lNumberOfWords-1] = lMessageLength>>>29;
    return lWordArray;
  };

  function WordToHex(lValue) {
    var WordToHexValue="",WordToHexValue_temp="",lByte,lCount;
    for (lCount = 0;lCount<=3;lCount++) {
      lByte = (lValue>>>(lCount*8)) & 255;
      WordToHexValue_temp = "0" + lByte.toString(16);
      WordToHexValue = WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length-2,2);
    }
    return WordToHexValue;
  };

  function Utf8Encode(string) {
    string = string.replace(/\r\n/g,"\n");
    var utftext = "";

    for (var n = 0; n < string.length; n++) {

      var c = string.charCodeAt(n);

      if (c < 128) {
        utftext += String.fromCharCode(c);
      }
      else if((c > 127) && (c < 2048)) {
        utftext += String.fromCharCode((c >> 6) | 192);
        utftext += String.fromCharCode((c & 63) | 128);
      }
      else {
        utftext += String.fromCharCode((c >> 12) | 224);
        utftext += String.fromCharCode(((c >> 6) & 63) | 128);
        utftext += String.fromCharCode((c & 63) | 128);
      }

    }

    return utftext;
  };

  var x=Array();
  var k,AA,BB,CC,DD,a,b,c,d;
  var S11=7, S12=12, S13=17, S14=22;
  var S21=5, S22=9 , S23=14, S24=20;
  var S31=4, S32=11, S33=16, S34=23;
  var S41=6, S42=10, S43=15, S44=21;

  string = Utf8Encode(string);

  x = ConvertToWordArray(string);

  a = 0x67452301; b = 0xEFCDAB89; c = 0x98BADCFE; d = 0x10325476;

  for (k=0;k<x.length;k+=16) {
    AA=a; BB=b; CC=c; DD=d;
    a=FF(a,b,c,d,x[k+0], S11,0xD76AA478);
    d=FF(d,a,b,c,x[k+1], S12,0xE8C7B756);
    c=FF(c,d,a,b,x[k+2], S13,0x242070DB);
    b=FF(b,c,d,a,x[k+3], S14,0xC1BDCEEE);
    a=FF(a,b,c,d,x[k+4], S11,0xF57C0FAF);
    d=FF(d,a,b,c,x[k+5], S12,0x4787C62A);
    c=FF(c,d,a,b,x[k+6], S13,0xA8304613);
    b=FF(b,c,d,a,x[k+7], S14,0xFD469501);
    a=FF(a,b,c,d,x[k+8], S11,0x698098D8);
    d=FF(d,a,b,c,x[k+9], S12,0x8B44F7AF);
    c=FF(c,d,a,b,x[k+10],S13,0xFFFF5BB1);
    b=FF(b,c,d,a,x[k+11],S14,0x895CD7BE);
    a=FF(a,b,c,d,x[k+12],S11,0x6B901122);
    d=FF(d,a,b,c,x[k+13],S12,0xFD987193);
    c=FF(c,d,a,b,x[k+14],S13,0xA679438E);
    b=FF(b,c,d,a,x[k+15],S14,0x49B40821);
    a=GG(a,b,c,d,x[k+1], S21,0xF61E2562);
    d=GG(d,a,b,c,x[k+6], S22,0xC040B340);
    c=GG(c,d,a,b,x[k+11],S23,0x265E5A51);
    b=GG(b,c,d,a,x[k+0], S24,0xE9B6C7AA);
    a=GG(a,b,c,d,x[k+5], S21,0xD62F105D);
    d=GG(d,a,b,c,x[k+10],S22,0x2441453);
    c=GG(c,d,a,b,x[k+15],S23,0xD8A1E681);
    b=GG(b,c,d,a,x[k+4], S24,0xE7D3FBC8);
    a=GG(a,b,c,d,x[k+9], S21,0x21E1CDE6);
    d=GG(d,a,b,c,x[k+14],S22,0xC33707D6);
    c=GG(c,d,a,b,x[k+3], S23,0xF4D50D87);
    b=GG(b,c,d,a,x[k+8], S24,0x455A14ED);
    a=GG(a,b,c,d,x[k+13],S21,0xA9E3E905);
    d=GG(d,a,b,c,x[k+2], S22,0xFCEFA3F8);
    c=GG(c,d,a,b,x[k+7], S23,0x676F02D9);
    b=GG(b,c,d,a,x[k+12],S24,0x8D2A4C8A);
    a=HH(a,b,c,d,x[k+5], S31,0xFFFA3942);
    d=HH(d,a,b,c,x[k+8], S32,0x8771F681);
    c=HH(c,d,a,b,x[k+11],S33,0x6D9D6122);
    b=HH(b,c,d,a,x[k+14],S34,0xFDE5380C);
    a=HH(a,b,c,d,x[k+1], S31,0xA4BEEA44);
    d=HH(d,a,b,c,x[k+4], S32,0x4BDECFA9);
    c=HH(c,d,a,b,x[k+7], S33,0xF6BB4B60);
    b=HH(b,c,d,a,x[k+10],S34,0xBEBFBC70);
    a=HH(a,b,c,d,x[k+13],S31,0x289B7EC6);
    d=HH(d,a,b,c,x[k+0], S32,0xEAA127FA);
    c=HH(c,d,a,b,x[k+3], S33,0xD4EF3085);
    b=HH(b,c,d,a,x[k+6], S34,0x4881D05);
    a=HH(a,b,c,d,x[k+9], S31,0xD9D4D039);
    d=HH(d,a,b,c,x[k+12],S32,0xE6DB99E5);
    c=HH(c,d,a,b,x[k+15],S33,0x1FA27CF8);
    b=HH(b,c,d,a,x[k+2], S34,0xC4AC5665);
    a=II(a,b,c,d,x[k+0], S41,0xF4292244);
    d=II(d,a,b,c,x[k+7], S42,0x432AFF97);
    c=II(c,d,a,b,x[k+14],S43,0xAB9423A7);
    b=II(b,c,d,a,x[k+5], S44,0xFC93A039);
    a=II(a,b,c,d,x[k+12],S41,0x655B59C3);
    d=II(d,a,b,c,x[k+3], S42,0x8F0CCC92);
    c=II(c,d,a,b,x[k+10],S43,0xFFEFF47D);
    b=II(b,c,d,a,x[k+1], S44,0x85845DD1);
    a=II(a,b,c,d,x[k+8], S41,0x6FA87E4F);
    d=II(d,a,b,c,x[k+15],S42,0xFE2CE6E0);
    c=II(c,d,a,b,x[k+6], S43,0xA3014314);
    b=II(b,c,d,a,x[k+13],S44,0x4E0811A1);
    a=II(a,b,c,d,x[k+4], S41,0xF7537E82);
    d=II(d,a,b,c,x[k+11],S42,0xBD3AF235);
    c=II(c,d,a,b,x[k+2], S43,0x2AD7D2BB);
    b=II(b,c,d,a,x[k+9], S44,0xEB86D391);
    a=AddUnsigned(a,AA);
    b=AddUnsigned(b,BB);
    c=AddUnsigned(c,CC);
    d=AddUnsigned(d,DD);
  }

  var temp = WordToHex(a)+WordToHex(b)+WordToHex(c)+WordToHex(d);

  return temp.toLowerCase();
}
