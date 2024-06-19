
/**
 * 获取用户单词列表
 * @returns {Promise<Array>} - 用户单词列表
 */
export async function getUserWords() {
    const currentUser = Parse.User.current();
    const UserWords = Parse.Object.extend('UserWords');
    const query = new Parse.Query(UserWords);
    query.equalTo('user', currentUser);
    const limit = 100; // 每次查询的限制，可以根据需要调整

    let allUserWords = [];
    let skip = 0; // 跳过的数量
    while (true) {
      query.limit(limit);
      query.skip(skip);
      const userWords = await query.find();
      allUserWords = allUserWords.concat(userWords);

      if (userWords.length < limit) {
        // 如果返回的结果少于 limit，说明已经获取了所有数据
        break;
      }

      skip += limit; // 增加跳过的数量
    }

    return allUserWords;
  }

  
/**
 * 获取用户单词列表-未掌握
 * @returns {Promise<Array>} - 用户未掌握单词列表
 */
export async function getUserWordsLearn() {
    const currentUser = Parse.User.current();
    const UserWords = Parse.Object.extend('UserWords');
    const query = new Parse.Query(UserWords);
    query.equalTo('user', currentUser);


    return allUserWords;
  }
