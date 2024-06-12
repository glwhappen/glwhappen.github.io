

const baseUrl = 'https://auth.ali.glwsq.cn';

/**
 * 获取音节划分
 * @param {string} word - 要划分的单词
 * @returns {Promise<string>} - 音节划分结果
 */
export async function getSyllableSplit(word) {
    try {
        // 构建请求URL
        const requestUrl = `${baseUrl}/syllable_split?word=${word}`;

        // 发起GET请求
        const response = await axios.get(requestUrl);

        // 返回音节划分
        return response.data.syllable_split;
    } catch (error) {
        // 处理错误
        // throw new Error(`Error fetching syllable split: ${error.message}`);
        return ''
    }
}


export async function getYoudao(word) {
    try {
      // 构建请求URL
      const requestUrl = `${baseUrl}/youdao_word?word=${word}`;
  
      // 发起GET请求
      const response = await fetch(requestUrl);
  
      // 检查响应状态
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status}`);
      }
  
      // 解析JSON数据
      const data = await response.json();
  
      // 返回音节划分
      return data;
    } catch (error) {
      // 处理错误
      console.error(`Error fetching syllable split: ${error.message}`); // 打印错误信息
      return ''; // 返回空字符串，表示获取失败
    }
  }
// /**
//  * 获取音节划分
//  * @param {string} word - 要划分的单词
//  * @returns {Promise<string>} - 音节划分结果
//  */
// export async function getYoudao(word) {
//     try {
//         // 构建请求URL
//         const requestUrl = `${baseUrl}/youdao_word?word=${word}`;

//         // 发起GET请求
//         const response = await axios.get(requestUrl);

//         // 返回音节划分
//         return response.data;
//     } catch (error) {
//         // 处理错误
//         // throw new Error(`Error fetching syllable split: ${error.message}`);
//         return ''
//     }
// }

// 使用异步函数来请求音节划分
(async () => {
    try {
        const word = 'programming';
        const syllableSplit = await getSyllableSplit(word);
        console.log(`Syllable split for '${word}': ${syllableSplit}`);
        const youdao = await  getYoudao(word);
        console.log('考试分类', youdao['ec']['exam_type'])
        console.log('专业解释', youdao['ec']['special'])
        console.log('单词翻译', youdao['ec']['word']['trs'])
        console.log('单词复数', youdao['ec']['word']['wfs'])
        console.log('中考句子', youdao['individual']['pastExamSents'])
        // console.log(youdao)

    } catch (error) {
        console.error(error);
    }
})();
