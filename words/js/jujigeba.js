async function get_data(text) {
    const myHeaders = new Headers();
    myHeaders.append("X-Parse-Application-Id", "happen-app");
    myHeaders.append("Content-Type", "application/json");
    
    const raw = JSON.stringify({
      "text": text
    });
    
    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow"
    };
    try {
        const response = await fetch("https://parse.glwsq.cn/parse/functions/jujieba", requestOptions)
        const result = await response.json();
        // console.log(result['result'])
        const decodedURI = atob(result['result']);
        const decodedText = decodeURIComponent(decodedURI); 
        console.log(decodedText)
        return decodedText;

        // return result
    } catch (error) {
        return `Error: ${error}`;
    }

}

function deal_data(text) {
    let res = {

    }
    // const text = "***#******#***这里是要匹配的内容=**=";
    let regex = /\*{3}#\*{6}#\*{3}([\s\S]*?)=\*{2}=/;
    let match = text.match(regex);

    if (match) {
        // console.log(match[1]);  // 输出：这里是要匹配的内容
        res['html'] = match[1]
    } else {
        console.log("没有找到匹配");
    }


    // const text = "=**=这里是要匹配的内容@|||@后续的文本";
    regex = /=\*{2}=(.*?)@\|\|\|@/;
    match = text.match(regex);

    if (match) {
        // console.log(match[1]);  // 输出：这里是要匹配的内容
        res['descriptions'] = match[1];
    } else {
        console.log("没有找到匹配");
    }

    regex = /@\|\|\|@([\s\S]*?)\*{3}#\*{3}/;
    match = text.match(regex);

    if (match) {
        // console.log(match[1]);  // 输出：这里是要匹配的内容
        res['analysis'] = match[1];
    } else {
        console.log("没有找到匹配");
    }

    // console.log(res);
    return res
}


export async function jieba(text) {
    const data = await get_data(text);
    return deal_data(data)
}

// jieba("The quick brown fox jumps over the lazy dog that is sleeping.").then(console.log).catch(console.error);