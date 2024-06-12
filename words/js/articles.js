// 初始化 Parse



export async function fetchArticles() {
    let articles = [];

    const currentUser = Parse.User.current();

    const Article = Parse.Object.extend("Articles");
    const query = new Parse.Query(Article);
    // query.ascending("updatedAt");
    // updatedAt 降序
    query.descending("updatedAt");
    // 自己创建的
    query.equalTo('user', currentUser);
    console.log(currentUser)


    try {
      const results = await query.find();
      articles = results.map(article => ({
        id: article.id,
        title: article.get('title'),
        content: article.get('content')
      }));
      return articles
    } catch (error) {
      console.error('Error while fetching articles', error);
      return null
    }
  }