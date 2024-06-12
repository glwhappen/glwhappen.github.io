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
      console.log(results)
      articles = results.map(article => ({
        id: article.id,
        title: article.get('title'),
        content: article.get('content'),
        user: article.get('user').id,
        public: article.getACL().getPublicReadAccess()
      }));
      console.log(articles)
      return articles
    } catch (error) {
      console.error('Error while fetching articles', error);
      return null
    }
  }


  export async function fetchPublicArticles() {
    let articles = [];
  
    const currentUser = Parse.User.current();
  
    const Article = Parse.Object.extend("Articles");
    const query = new Parse.Query(Article);
  
    // updatedAt 降序
    query.descending("updatedAt");
  
    // 不是自己创建的
    query.notEqualTo('user', currentUser);
    // user 不为空
    query.exists('user');
  
    // 公开的
    // query.equalTo('public', true);
  
    try {
      const results = await query.find();
  
      articles = results.map(article => ({
        id: article.id,
        title: article.get('title'),
        content: article.get('content'),
        user: article.get('user').id,
        public: article.getACL().getPublicReadAccess()
      }));
  
      return articles;
    } catch (error) {
      console.error('Error while fetching public articles', error);
      return null;
    }
  }