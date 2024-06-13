const { createApp, ref, computed, reactive, h, onMounted, nextTick } = Vue;
import {fetchArticles, fetchPublicArticles} from './articles.js';
import {searchWordHandler} from "./translate.js";
import {getSyllableSplit, getYoudao} from "./english.js";
import {findWords} from './word.js'
import {jieba} from './jujigeba.js'
// 初始化 Parse
Parse.initialize("happen-app", "YOUR_JAVASCRIPT_KEY");
Parse.serverURL = 'https://parse.glwsq.cn/parse';

function deal(article, type = 'times') {
    // this.article  = this.article.replace(/\. (?!\n\n)/g, '. \n\n');

    const words = findWords(article)
    if (!words) {
      showToastError("没有找到单词")
    //   console.log("没有找到单词")
      return
    }
    this.article_word_list = wordsDeal(words)
    console.log('article_word_list', this.article_word_list)
    if (type === 'times') {
      this.article_word_list = Object.entries(this.article_word_list)
          .sort((a, b) => b[1].times - a[1].times) // 按照 "times" 属性降序排序
          .reduce((acc, [key, value]) => {
            acc[key] = value;
            return acc;
          }, {});

    } else {
      this.article_word_list = Object.entries(this.article_word_list)
          .sort((a, b) => a[1].index - b[1].index) // 按照 "times" 属性降序排序
          .reduce((acc, [key, value]) => {
            acc[key] = value;
            return acc;
          }, {});
    }
    this.dealWord()
  }

function fadeToBlack(count, mastery) {
  
    let percentage = (1 - mastery / count) * 100

    if (count - mastery >= 2) {
        return "#ba0909c6";
      }

      return '#333'

      if (percentage === 0 && count !== 0) {
        return "#047f0ec6";
      }
    // 将百分比限制在 0-100 之间
    percentage = Math.max(0, Math.min(100, percentage));
    let v = 85 // 85 是灰色
    // 计算 RGB 分量的变化值
    const rChange = Math.round((v - 0) * (percentage / 100));
    const gChange = Math.round((v - 0) * (percentage / 100));
    const bChange = Math.round((v - 0) * (percentage / 100));
  
    // 计算新的 RGB 值
    const newR = v - rChange;
    const newG = v - gChange;
    const newB = v - bChange;
  
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


function play(text, style='英式') {

    let type = 0
    if (style === '英式') {
      type = 1
    } else if (style === '美式') {
      type = 2
    } else {
      return
    }
    var voice = document.getElementById('voice'); //获取到audio元素
    voice.src = 'http://dict.youdao.com/dictvoice?type=' + type + '&audio=' + text;
    if (voice.paused) { //判断音乐是否在播放中，暂停状态
      nextTick(() => {
        voice.play().catch(error => {
          voice.src = 'http://dict.youdao.com/dictvoice?type=' + type + '&audio=' + text;
          console.log(`重试播放失败: ${text},${voice.src}, ${error}`);
          voice.play().catch(e => console.error(`重试播放失败: ${text}, ${e}`));
        });
      })


    } else { //播放状态
      voice.pause(); //音乐停止
    }
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
      { title: '列表加载中', content: '内容加载中' },
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
    let word_list = ref([])

    // async function getUserWords() {
    //     const UserWords = Parse.Object.extend('UserWords');
    //     const query = new Parse.Query(UserWords);
    //     query.equalTo('user', currentUser.value);
    //     const userWords = await query.find();
    //     word_list.value = userWords.map(userWord => ({
    //         word: userWord.get('word'),
    //         count: userWord.get('count'),
    //         mastery: userWord.get('mastery')
    //     }));
    // }
    async function getUserWords() {
        const UserWords = Parse.Object.extend('UserWords');
        const query = new Parse.Query(UserWords);
        query.equalTo('user', currentUser.value);
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
      
        word_list.value = allUserWords.map(userWord => ({
          word: userWord.get('word'),
          count: userWord.get('count'),
          mastery: userWord.get('mastery')
        }));
      }
    async function getUserWord(word) {
        const UserWords = Parse.Object.extend('UserWords');
        const query = new Parse.Query(UserWords);
        query.equalTo('user', currentUser.value);
        query.equalTo('word', word);
        return await query.first();
    }
    // selectedUserWord 计算属性
    const selectedUserWord = computed(() => word_list.value.find(word => word.word === selectedText.value.trim()));
    // 判断选中的是否是单词 计算属性
    const isWordSelected = computed(() => selectedText.value.trim().split(' ').length === 1);

    function selectArticle(article) {
      selectedArticle.value = article;
      
      nextTick(async () => {
        await getUserWords();
        let content = article.content;
        
        // for (const word of word_list.value) {
        //   const regex = new RegExp(`\\b${word.word}\\b`, 'gi'); // 动态生成正则表达式
        //   // if(('' + word.word).find('-') != -1) {
        //     console.log("word", word)
        //   // }
        //   content = content.replace(regex, `<span class="word word-${word.word}" style="color: ${fadeToBlack(word.count, word.mastery)};">${word.word}</span>`);
        // }

        for (const word of word_list.value) {
          const regex = new RegExp(`\\b${word.word}\\b`, 'g');
          content = content.replace(regex, `__PLACEHOLDER_${word.word}__`);
        }
        
        for (const word of word_list.value) {
          const placeholderRegex = new RegExp(`__PLACEHOLDER_${word.word}__`, 'g');
          content = content.replace(placeholderRegex, `<span class="word word-${word.word}" style="color: ${fadeToBlack(word.count, word.mastery)};">${word.word}</span>`);
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
        ElementPlus.ElMessage.error("更新文章失败")
      }
    }
    async function publicArticle(articleId) {
        const Article = Parse.Object.extend('Articles');
        const query = new Parse.Query(Article);
        const article = await query.get(articleId); // 获取要公开的文章
      
        // 检查当前用户是否是文章的作者
        if (article.get("user").id !== currentUser.value.id) {
          ElementPlus.ElMessage.error("您没有权限修改此文章");
          return;
        }
        console.log("publicArticle", article)
        // // 获取当前文章的 ACL
        // const _public = article.getACL().getPublicReadAccess();
        // // 设置 ACL，公开文章，但只能读取
        // const acl = new Parse.ACL();
        // acl.setPublicReadAccess(!_public);
        // acl.setPublicWriteAccess(false);
        // article.setACL(acl);
            // 获取当前 ACL 并判断是否公开
        const acl = article.getACL();
        const isPublic = acl.getPublicReadAccess();
          // 切换公开状态
        acl.setPublicReadAccess(!isPublic);
        article.setACL(acl);
        try {
          await article.save();
          ElementPlus.ElMessage.success(isPublic ? "文章已设为私密" : "文章已公开");
          // 更新文章列表
          articles.value = await fetchArticles();
        } catch (error) {
          console.error("公开文章失败:", error);
          ElementPlus.ElMessage.error("公开文章失败");
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
    const publicArticles = ref([]);
    onMounted(async () => {
      articles.value = await fetchArticles();
      publicArticles.value = await fetchPublicArticles();
      console.log("公开文章", publicArticles.value)
      nextTick(() =>{
        selectArticle(articles.value[0]);
        // selectedArticle.value = articles.value[0];
      })
    });

    let fontSize = ref(24);
    
    // function highlightApple() {
    //   this.$nextTick(() => {
    //     const editable = this.$refs.editable;
    //     const regex = /\bapple\b/gi; // 匹配 "apple" 单词
    //     editable.innerHTML = editable.textContent.replace(regex, '<span style="color: green;">apple</span>');
    //   });
    // }
    function cleanHTML2(htmlString) {
        // 替换 <span> 标签
        htmlString = htmlString.replace(/<span[^>]*>(.*?)<\/span>/gs, '$1');
      
        // 替换 <p> 标签，并在每个 <p> 标签内容后添加换行符
        htmlString = htmlString.replace(/<p[^>]*>(.*?)<\/p>/gs, '$1\n');
      
        return htmlString.trim(); // 去除首尾多余的空格和换行
      }
    function cleanHTML(htmlString) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlString, 'text/html');
        const iterator = document.createNodeIterator(doc.body, NodeFilter.SHOW_ELEMENT);
      
        let textContent = '1';
        let node;
        while (node = iterator.nextNode()) {
          // 如果是 <p> 标签或其他换行标签，添加换行
          if (node.nodeName === 'P' || getComputedStyle(node).display === 'block') {
            textContent += '\n';
          }
          console.log('nodeType', node.nodeType, node.innerHTML, node.nodeName)
      
          // 如果节点是文本节点，添加其文本内容
          if (node.nodeType === Node.TEXT_NODE) {
            textContent += node.nodeValue;
          }
        }
        console.log(htmlString, textContent)
        return textContent.trim(); // 去除首尾多余的换行
      }
      function cleanHTML3(htmlString) {
        // 移除所有 HTML 标签和属性，但保留换行符
        let cleanedText = htmlString.replace(/<[^>]+>/g, '');
      
        // 规范化空白字符（保留换行）
        cleanedText = cleanedText
          .replace(/&nbsp;/g, ' ') // 将 &nbsp; 替换为空格
          .replace(/\t/g, ' ')    // 将制表符替换为空格
          .replace(/ +/g, ' ');  // 将多个连续的空格合并为一个
      
        return cleanedText;
      }
      function isWordF(word) {
        // 正则表达式匹配由字母组成的单词
        const regex = /^[A-Za-z]+$/;
    
        // 判断word是否匹配正则表达式
        if (!regex.test(word)) {
            return false; // 如果不是单词，返回false
        }
    
        return true; // 如果是单词，返回true
    }
      function cleanHTML4(htmlString) {
        // 匹配所有 HTML 标签（包括自闭合标签），并捕获标签名
        const tagRegex = /<\/?(\w+)[^>]*?\/?>/g;
      
        // 替换标签，并在块级元素后添加换行
        let cleanedText = htmlString.replace(tagRegex, (match, tagName) => {
          // 块级元素列表（可以根据需要添加更多标签）
          const blockElements = ['p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote', 'pre'];
      
          // 如果是块级元素，则在后面添加换行
          if (blockElements.includes(tagName.toLowerCase())) {
            return '\n';
          } else {
            return ''; // 否则直接移除标签
          }
        });
      
        // 规范化空白字符（保留换行）
        cleanedText = cleanedText
        //   .replace(/&nbsp;/g, ' ') // 将 &nbsp; 替换为空格
        //   .replace(/\t/g, ' ')    // 将制表符替换为空格
        //   .replace(/ +/g, ' ');  // 将多个连续的空格合并为一个
      
        return cleanedText.trim(); // 去除首尾多余的空格和换行
      }
    function updateContent() {
    //   selectedArticle.value.content = editableRef.value.textContent;
    //   selectedArticle.value.content = editableRef.value.innerHTML.replace(/<span class="word"[^>]*>|<\/span>/g, '');
      selectedArticle.value.content = cleanHTML4(editableRef.value.innerHTML)
      console.log('selectedArticle.value.content', selectedArticle.value.content)
      updateArticle(selectedArticle.value);
    }
    let selectedTextTrans = ref('');
    let selectedText = ref('');
    let youdao = ref({})
    let jujigeba_html = ref('')
    function selectionchange() {
      const selection = window.getSelection();
      console.log('adf')
      if (!selection.isCollapsed) {
        // 选区不为空，且在 editableRef 元素内
        selectedText.value = selection.toString();
        console.log('选中的文本:', selectedText.value);
        // 在这里执行您想要的操作
        play(selectedText.value)
        searchWordHandler(selectedText.value).then(res => {
            selectedTextTrans.value = res
            console.log('翻译结果:', res);
        })
        // 检查是否是一个单词
        youdao.value = {}
        jujigeba_html.value = ''
        // 小于3个单词，再调用有道翻译
        if (selectedText.value.trim().split(' ').length <= 7) {
          getYoudao(selectedText.value.trim()).then(res => {
              youdao.value = res
              console.log('youdao', res)
          })
        }

        
        if (selectedText.value.trim().split(' ').length === 1) {
            // 是单词
            const word = selectedText.value.trim();
            if (word == 'span' || word == '' || word == ' ' || word == '-') {
                return
            }

          if (!isWordF(word)) {
            return 
          }
            
            console.log('是单词', word)

            // parse 查询class 为 UserWords的用户单词信息，如果存在那么count + 1，否则创建新的单词信息
            const UserWords = Parse.Object.extend('UserWords');
            const query = new Parse.Query(UserWords);
            query.equalTo('user', currentUser.value);
            query.equalTo('word', word);
            query.first().then(userWord => {
                if (userWord) {
                    userWord.increment('count');
                    userWord.save();
                    const index = word_list.value.findIndex(item => item.word === word);
                    // console.log('index', index)
                    console.log(word_list.value)
                    if (index !== -1) {
                        word_list.value[index].count++;

                    }
                } else {
                    const userWord = new UserWords();
                    userWord.set('user', currentUser.value);
                    userWord.set('word', word);
                    userWord.set('count', 1);
                    userWord.set('mastery', 0);
                    // 设置 ACL
                    const acl = new Parse.ACL(currentUser.value);
                    acl.setReadAccess(currentUser.value, true);
                    acl.setWriteAccess(currentUser.value, true);
                    userWord.setACL(acl);

                    userWord.save();
                    word_list.value.push({
                        word: word,
                        count: 1,
                        mastery: 0
                    });

                }
            });

        } else {
          jieba(selectedText.value).then(res => {
            console.log('jieba', res)
            if (res == {}) return
            jujigeba_html.value = res.html
            nextTick(() => {
              let pos = 0
              let descriptions = JSON.parse(res.descriptions)
              // let descriptions = res.descriptions

              res.analysis.split('||').forEach(part => {
                  const elements = part.split('|');
                  const index = elements[0];
                  const grammarId = elements[1];
                  console.log("grammarId", grammarId, index)
      
                  // const element = document.getElementById('f' + pos++);
                  // if (element) {
                  //     element.title = item.description;
                  // }
      
                  const desc = descriptions.find(d => d.d === grammarId);
                  if (desc) {
                      const element = document.getElementById('f' + pos++);
                      if (element) {
                          let m = desc.m
                          if (!m) {
                              m = ''
                          }
                          if (m.includes('*')) {
                              m = m.replace('*', '\n')
                          }
                          let t = desc.t
                          let g = desc.g
                          if (!t) {
                              element.title = `${desc.g}`;
                          } else {
                              if (g) {
                                  element.title = `${desc.g}: \n${desc.t} ${m}`;
                              } else {
                                  element.title = `${desc.t} ${m}`;
                              }
                              
                          }
                      }
                  }
              });
          

            })
          })

        }
      }
    }
    
    function handleBlur() {
        console.log('blur')
        let voice = document.getElementById('voice'); //获取到audio元素
        if (!voice.paused) {
          voice.pause(); //音乐停止
        }

    }
    function toMastery(word) {
        // 选中的单词 mastery == count
        const UserWords = Parse.Object.extend('UserWords');
        const query = new Parse.Query(UserWords);
        query.equalTo('user', currentUser.value);
        query.equalTo('word', word);
        query.first().then(userWord => {
            if (userWord) {
                // 让 mastery 等于 count
                userWord.set('mastery', userWord.get('count'));
                userWord.save();
                const index = word_list.value.findIndex(item => item.word === word);
                word_list.value[index].mastery = userWord.get('count');
                // 刷新文章内容
                selectArticle(selectedArticle.value);
            
            }
        });
    }



    return {
      currentUser, articles, selectedArticle,fontSize, selectedTextTrans, selectedText, selectedUserWord, toMastery, youdao, publicArticles, word_list,
      logout, addArticle, selectArticle, updateArticle, editableRef, updateContent, selectionchange, deleteArticle, handleBlur, publicArticle,
      jujigeba_html
    };
  }
})

// app.use(createApp({
//     setup() {
//         onMounted = async () => {
//             console.log("123")
//         }
//     }
// }))

app.use(ElementPlus).mount('#app');


