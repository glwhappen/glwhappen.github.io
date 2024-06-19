const Parse = require('parse/node');

Parse.initialize("happen-app", "YOUR_JAVASCRIPT_KEY");
Parse.serverURL = 'https://parse.glwsq.cn/parse';
async function updateTranslation(word, newExamType) {
    const Translation = Parse.Object.extend('Translation');
    const query = new Parse.Query(Translation);
    query.equalTo('word', word);

    try {
        const translation = await query.first();
        if (translation) {
            // 更新 exam_type 字段
            translation.set('exam_type', newExamType);
            
            // 保存更新
            await translation.save();
            console.log('更新成功');
        } else {
            console.log('没有找到指定的 word，无法更新');
            // 处理未找到对象的情况，例如通过创建新对象或返回错误信息
        }
    } catch (error) {
        console.error("更新时发生错误:", error);
    }
}

async function getUserWords() {

    const Translation = Parse.Object.extend('Translation');
    const query = new Parse.Query(Translation);
    const limit = 100; // 每次查询的限制，可以根据需要调整

    // let allUserWords = [];
    let skip = 0; // 跳过的数量
    while (true) {
        query.limit(limit);
        query.skip(skip);
        const userWords = await query.find();
        userWords.forEach((translation) => {
            console.log(`Word: ${translation.get("word")}`);
            const translation_fild = translation.get("translation");
            const ec = translation_fild.ec;
            if(ec) {
                if (ec['exam_type']) {
                    console.log(`考试分类: ${ec['exam_type']}`);
                    console.log(`Translation: ${JSON.stringify(ec)}`);
                    // translation['exam_type'] = ec['exam_type']

                    // 更新 exam_type 字段
                    translation.set('exam_type', ec['exam_type']);
                    // updateTranslation(translation.get("word"), ec['exam_type'])

                    // 保存
                    try {
                        translation.save();
                    } catch (error) {

                        console.error("Error updating exam_type:", error);
                    }

                }
            }
            // console.log(`Translation: ${JSON.stringify(translation.get("translation"))}`);
        });

        if (userWords.length < limit) {
            // 如果返回的结果少于 limit，说明已经获取了所有数据
            break;
        }

        skip += limit; // 增加跳过的数量
    }

    // return allUserWords;
}

// 使用异步函数来请求音节划分
(async () => {
    getUserWords()
})();
