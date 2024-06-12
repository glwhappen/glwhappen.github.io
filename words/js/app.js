const { createApp, ref, computed, reactive, h, onMounted, nextTick } = Vue;
import {fetchArticles} from './articles.js';
// 初始化 Parse
Parse.initialize("happen-app", "YOUR_JAVASCRIPT_KEY");
Parse.serverURL = 'https://parse.glwsq.cn/parse';

function fadeToBlack(percentage) {
    // 将百分比限制在 0-100 之间
    percentage = Math.max(0, Math.min(100, percentage));
  
    // 计算 RGB 分量的变化值
    const rChange = Math.round((85 - 0) * (percentage / 100));
    const gChange = Math.round((85 - 0) * (percentage / 100));
    const bChange = Math.round((85 - 0) * (percentage / 100));
  
    // 计算新的 RGB 值
    const newR = 85 - rChange;
    const newG = 85 - gChange;
    const newB = 85 - bChange;
  
    // 将 RGB 值转换为十六进制颜色
    const newHex = "#" + ((newR << 16) | (newG << 8) | newB).toString(16).padStart(6, "0");
    return newHex;
  }
function getMasteryColor(masteryPercentage) {
    // 将掌握程度映射到色相范围（0 - 120）
    const hue = 120 - (masteryPercentage / 100) * 120; 
    // 固定饱和度和亮度
    const saturation = 100; 
    const lightness = 50; 
    // 返回 HSL 颜色字符串
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`; 
  }

const app = createApp({
  setup() {
    const currentUser = ref(Parse.User.current());
    if (!currentUser.value) {
      window.location.href = '/login.html';
    }
    function logout() {
      Parse.User.logOut();
      currentUser.value = null;
      window.location.href = '/login.html';
    }
    const articles = ref([
      { title: '文章标题1', content: '文章内容1' },
      { title: '文章标题2', content: '文章内容2' }
    ]);
    const selectedArticle = ref(null);

    function deleteArticle() {
      if (selectedArticle.value) {
        const Article = Parse.Object.extend("Articles");
        const query = new Parse.Query(Article);
  
        query.get(selectedArticle.value.id).then(article => {
          article.destroy().then(async () => {
            articles.value =await fetchArticles();
            ElementPlus.ElMessage.success("删除成功")
            nextTick(() => {
              // selectedArticle.value = articles.value[0];
              selectArticle(articles.value[0]);

            })
          });
        });
      }
    }

    const editableRef = ref(null);


    function selectArticle(article) {
      selectedArticle.value = article;
      nextTick(() => {
        let word_list = [{
            word: 'apple',
            // 查询次数
            count: 5,
            // 掌握程度
            mastery: 5
        },{
            word: 'Hawking',
            // 查询次数
            count: 10,
            // 掌握程度
            mastery: 10
        }];

        let content = article.content;
        
        for (const word of word_list) {
          const regex = new RegExp(`\\b${word.word}\\b`, 'gi'); // 动态生成正则表达式
          content = content.replace(regex, `<span class="word" style="color: ${fadeToBlack((1 - word.mastery / word.count) * 100)};">${word.word}</span>`);
        }
        
        editableRef.value.innerHTML = content;

      })
      // fetchArticleInfo(article);
      // fetchArticleTranslation(article);
    }
    async function updateArticle(article) {
      console.log(article)
      const Article = Parse.Object.extend("Articles");
      const query = new Parse.Query(Article);
      const articleObj = await query.get(article.id);
      articleObj.set('title', article.title);
      articleObj.set('content', article.content);
      try {
        await articleObj.save();
        articles.value =await fetchArticles();
      } catch (error) {
        console.error('Error while updating the article', error);
        ElementPlus.ElMessage.success("更新文章失败")
      }
    }

    async function addArticle() {
      const Article = Parse.Object.extend('Articles');
      const article = new Article();
      article.set('title', '新文章标题');
      article.set('content', '新文章内容');
    //   article.set('translation', '新文章翻译');
      
      // 设置 ACL
      const acl = new Parse.ACL(currentUser.value);
      acl.setReadAccess(currentUser.value, true);
      acl.setWriteAccess(currentUser.value, true);
      article.setACL(acl);
      article.set("user", currentUser.value);

      await article.save();
      articles.value = await fetchArticles();
      ElementPlus.ElMessage.success("添加成功")
      nextTick(() => {
        // selectedArticle.value = articles.value[0];
        selectArticle(articles.value[0]);
      });
      
    }
    onMounted(async () => {
      articles.value = await fetchArticles();
      nextTick(() =>{
        selectArticle(articles.value[0]);
        // selectedArticle.value = articles.value[0];
      })
    });

    let fontSize = ref(16);
    
    // function highlightApple() {
    //   this.$nextTick(() => {
    //     const editable = this.$refs.editable;
    //     const regex = /\bapple\b/gi; // 匹配 "apple" 单词
    //     editable.innerHTML = editable.textContent.replace(regex, '<span style="color: green;">apple</span>');
    //   });
    // }
    function updateContent() {
      // selectedArticle.value.content = editableRef.value.textContent;
      selectedArticle.value.content = editableRef.value.innerHTML.replace(/<span class="word"[^>]*>|<\/span>/g, '');
      updateArticle(selectedArticle.value);
    }
    function selectionchange() {
      const selection = window.getSelection();
      console.log('adf')
      if (!selection.isCollapsed) {
        // 选区不为空，且在 editableRef 元素内
        const selectedText = selection.toString();
        console.log('选中的文本:', selectedText);
        // 在这里执行您想要的操作
      }
    }



    return {
      currentUser, articles, selectedArticle,fontSize,
      logout, addArticle, selectArticle, updateArticle, editableRef, updateContent, selectionchange, deleteArticle
    };
  }
})

app.use(createApp({
    setup() {
        onMounted = async () => {
            console.log("123")
        }
    }
}))

app.use(ElementPlus).mount('#app');
