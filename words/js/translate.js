import {MD5} from "./utils.js";
function jsonpRequest(url, callbackName, params) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        const queryString = Object.keys(params)
            .map((key) => `${key}=${encodeURIComponent(params[key])}`)
            .join('&');
        script.src = `${url}?${queryString}&callback=${callbackName}`;

        // 定义回调函数
        window[callbackName] = (data) => {
            resolve(data); // 成功时调用
            delete window[callbackName]; // 清理全局回调
            document.head.removeChild(script);
        };

        script.onerror = (error) => {
            reject(error); // 发生错误时
        };

        document.head.appendChild(script); // 添加 script 元素
    });
}

export async function searchWordHandler(searchWord) {
    const appid = '20200424000428689';
    const key = 'drJp2hpTuTmt7Jn0yi_O';
    const salt = new Date().getTime();
    const query = searchWord;
    const from = 'en';
    const to = 'zh';
    const str1 = appid + query + salt + key;
    const sign = MD5(str1);

    const url = 'https://api.fanyi.baidu.com/api/trans/vip/translate';
    const params = {
        q: query,
        appid,
        salt,
        from,
        to,
        sign,
    };

    try {
        // 使用 async/await 等待 JSONP 请求完成
        const data = await jsonpRequest(url, 'jsonpCallback', params);

        if (data.trans_result) {
            return data.trans_result[0].dst; // 设置翻译结果
        } else {
            return null
        }
    } catch (error) {
        console.error('JSONP 请求失败:', error);
        return null
    }
}

export async function deepl(text) {
    const res = await fetch('https://parse.ali.glwsq.cn/parse/functions/deepl', {
        method: 'POST',
        headers: {
            'X-Parse-Application-Id': 'happen-app',
            'Content-Type': 'application/json'
        },
        // body: '{\n    "text": ["I have the number of a really good affordable computer repair shop at home."],\n    "lang": "ZH"\n}',
        body: JSON.stringify({
            'text': [
                text
            ],
            'lang': 'ZH'
        })
    });
    const data = await res.json();
    console.log(data);
    return data;
}