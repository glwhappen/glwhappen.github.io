const Parse = require('parse/node');

Parse.initialize("happen-app", "YOUR_JAVASCRIPT_KEY");
Parse.serverURL = 'https://parse.glwsq.cn/parse';


async function login(username, password) {
    try {
        const user = await Parse.User.logIn(username, password);
        console.log('登录成功，用户信息：', user);
        const UserWords = Parse.Object.extend('UserWords');
        const queryUserWords = new Parse.Query(UserWords);
        await queryUserWords.find({ sessionToken: user.getSessionToken() })
        return user;
    } catch (error) {
        console.error('登录失败：', error);
        throw error;
    }
}

async function getUserWordsCountEqMaster(user) {
    // 第一步：查询 UserWords 类以获取单词列表
    const UserWords = Parse.Object.extend('UserWords');
    const queryUserWords = new Parse.Query(UserWords);
    queryUserWords.equalTo('user', user);
    // 查询 count 字段 不等于 mastery 字段
    queryUserWords.notEqualTo('count', 'mastery');
    // 按照 count 字段升序排列
    queryUserWords.ascending('count');
    return await queryUserWords.find({ sessionToken: user.getSessionToken() })
}

async function getUserWordsLearn(user) {
    const userWords = await getUserWordsCountEqMaster(user)

    

    // console.log(userWords)
    // 从查询结果中提取所有单词
    const words = userWords.map(uw => uw.get("word"));
    console.log(words);
    // 第二步：基于这些单词查询 Translation 类
    const queryTranslation = new Parse.Query("Translation");
    queryTranslation.containedIn("word", words);  // 假设 Translation 类中有一个 'word' 字段，存储具体单词
    // 查询 class Translation 的 translation 字段，这个字段是一个json，里面有 'ec' 子字段的项目
    // queryTranslation.select('translation.haha');

    const translations = await queryTranslation.find()
    translations.forEach((translation) => {
        console.log(`Word: ${translation.get("word")}`);
        const translation_fild = translation.get("translation");
        const ec = translation_fild.ec;a
        if(ec) {
            if (ec['exam_type']) {
                console.log(`考试分类: ${ec['exam_type']}`);
                // console.log(`Translation: ${JSON.stringify(ec)}`);
                console.log(`${translation_fild['web_trans']}`)
            }
        }
        // console.log(`Translation: ${JSON.stringify(translation.get("translation"))}`);
    });

    
    
}

// 使用异步函数来请求音节划分
(async () => {
    const user = await login('happen', 'happen')
    await getUserWordsLearn(user)
})();