const { createApp, ref, computed, reactive, h, onMounted, nextTick } = Vue;

// 初始化 Parse
Parse.initialize("happen-app", "YOUR_JAVASCRIPT_KEY");
Parse.serverURL = 'https://parse.glwsq.cn/parse';

createApp({
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

    async function fetchArticles() {
      const Article = Parse.Object.extend("Articles");
      const query = new Parse.Query(Article);
      // query.ascending("updatedAt");
      // updatedAt 降序
      query.descending("updatedAt");
      // 自己创建的
      query.equalTo('user', currentUser.value);


      try {
        const results = await query.find();
        articles.value = results.map(article => ({
          id: article.id,
          title: article.get('title'),
          content: article.get('content')
        }));
      } catch (error) {
        console.error('Error while fetching articles', error);
      }
    }
    function deleteArticle() {
      if (selectedArticle.value) {
        const Article = Parse.Object.extend("Articles");
        const query = new Parse.Query(Article);
  
        query.get(selectedArticle.value.id).then(article => {
          article.destroy().then(async () => {
            await fetchArticles();
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

    // function selectWord(event) {
    //   const selection = window.getSelection();
    //   const range = document.createRange();

    //   // 获取点击位置
    //   const clickOffset = getClickOffset(event);

    //   // 找到点击位置所在的单词边界
    //   const start = findWordBoundary(editableRef.value.textContent, clickOffset, -1); // 向前查找
    //   const end = findWordBoundary(editableRef.value.textContent, clickOffset, 1); // 向后查找
    //   console.log(start, end);
    //   // 设置选中范围
    //   range.setStart(editableRef.value.firstChild, start);
    //   range.setEnd(editableRef.value.firstChild, end);
    //   selection.removeAllRanges();
    //   selection.addRange(range);
    // }
    function selectWord(event) {
      const selection = window.getSelection();
      if (selection.isCollapsed) {
        const range = document.createRange();

        const clickOffset = getClickOffset(event);
        // const textContent = editableRef.value.textContent;
        const textContent = selectedArticle.value.content;
        const start = findWordBoundary(textContent, clickOffset, -1);
        const end = findWordBoundary(textContent, clickOffset, 1);
        
        // if (start == -1) {
        //   start = 0;
        // }
        console.log(start, end)
        if (start >= 0 && end <= textContent.length) {
          const startNode = findNodeByOffset(editableRef.value, start);
          const endNode = findNodeByOffset(editableRef.value, end);

          range.setStart(startNode.node, startNode.offset);
          range.setEnd(endNode.node, endNode.offset);
          selection.removeAllRanges();
          selection.addRange(range);
        }
      } else {

          const selection = window.getSelection();
          if (!selection.isCollapsed) { // 确保有选中的内容
            const range = selection.getRangeAt(0);
            const fragment = range.cloneContents(); // 克隆选中的内容

            // 遍历 fragment 中的节点，去除样式标签并提取文本
            let words = [];
            const treeWalker = document.createTreeWalker(fragment, NodeFilter.SHOW_TEXT);
            while (treeWalker.nextNode()) {
              const node = treeWalker.currentNode;
              const text = node.textContent.trim();
              if (text) {
                words = words.concat(text.split(/\s+/)); // 按空格分割单词
              }
            }

            console.log("选中的单词:", words); // 输出选中的单词数组

            // 这里可以对 words 数组进行高亮或其他操作
          }
        
      }


    }

    function findNodeByOffset(node, offset) {
      let currentOffset = 0;
      const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT); // 只遍历文本节点

      while (walker.nextNode()) {
        const currentNode = walker.currentNode;
        if (currentOffset + currentNode.length >= offset) {
          return { node: currentNode, offset: offset - currentOffset };
        }
        currentOffset += currentNode.length;
      }

      return null; // 未找到
    }
    function getClickOffset(event) {
      const selection = window.getSelection();
      const range = selection.getRangeAt(0);
      const preCaretRange = range.cloneRange();
      preCaretRange.selectNodeContents(editableRef.value);
      preCaretRange.setEnd(range.endContainer, range.endOffset);
      return preCaretRange.toString().length;
    }

    // function findWordBoundary(text, offset, direction) {
    //   while (offset >= 0 && offset < text.length) {
    //     if (/\s/.test(text[offset])) { // 空格或换行
    //       return offset + (direction > 0 ? 1 : 0); // 向后查找时跳过空格
    //     }
    //     offset += direction;
    //   }
    //   return offset;
    // }
    // function findWordBoundary(text, offset, direction) {
    //   const regex = /[\w'-]+/g; // 匹配单词字符、连字符和撇号
    //   let match;

    //   while ((match = regex.exec(text)) !== null) {
    //     const wordStart = match.index;
    //     const wordEnd = wordStart + match[0].length;

    //     if (direction === -1 && wordEnd <= offset) { // 向前查找，单词结束位置在 offset 之前
    //       return wordEnd;
    //     } else if (direction === 1 && wordStart >= offset) { // 向后查找，单词起始位置在 offset 之后
    //       return wordStart;
    //     }
    //   }

    //   return offset; // 未找到单词边界，返回原偏移量
    // }
    function findWordBoundary(text, offset, direction) {
      const regex = /[\w']+/g; // 匹配单词字符、连字符和撇号
      let match;
      let lastMatchEnd = -1; // 记录上一次匹配的结束位置

      while ((match = regex.exec(text)) !== null) {
        const wordStart = match.index;
        const wordEnd = wordStart + match[0].length;

        if (direction === -1) { // 向前查找
          if (wordEnd <= offset && wordEnd > lastMatchEnd) {
            lastMatchEnd = wordEnd; // 更新上一次匹配的结束位置
          } else if (wordEnd > offset) { // 超过 offset，返回上一次匹配的结束位置
            return lastMatchEnd + 1;
          }
        } else if (direction === 1) { // 向后查找
          if (wordStart >= offset) {
            return wordStart - 1;
          }
        }
      }
      console.log(direction)

      // 如果向前查找没有找到，返回 0，向后查找没有找到，返回文本长度
      return direction === -1 ? 0 : text.length;
    }




    function selectArticle(article) {
      selectedArticle.value = article;
      nextTick(() => {
        const regex = /\bapple\b/gi; // 匹配 "apple" 单词
        // editable.innerHTML = editable.textContent.replace(regex, '<span style="color: green;">apple</span>');
        let content = article.content
        content = content.replace(regex, '<span style="color: green;">apple</span>');
        editableRef.value.innerHTML = content

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
        fetchArticles();
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
      article.set('translation', '新文章翻译');
      
      // 设置 ACL
      const acl = new Parse.ACL(currentUser.value);
      acl.setReadAccess(currentUser.value, true);
      acl.setWriteAccess(currentUser.value, true);
      article.setACL(acl);
      article.set("user", currentUser.value);

      await article.save();
      await fetchArticles();
      ElementPlus.ElMessage.success("添加成功")
      nextTick(() => {
        selectedArticle.value = articles.value[0];
      });
      
    }
    onMounted(async () => {
      await fetchArticles();
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
      selectedArticle.value.content = editableRef.value.innerHTML;
      updateArticle(selectedArticle.value);
    }
    function selectionchange() {
      const selection = window.getSelection();
      if (!selection.isCollapsed && selection.anchorNode.parentElement === editableRef.value) {
        // 选区不为空，且在 editableRef 元素内
        const selectedText = selection.toString();
        console.log('选中的文本:', selectedText);
        // 在这里执行您想要的操作
      }
    }



    return {
      currentUser, articles, selectedArticle,fontSize,
      logout, addArticle, selectArticle, updateArticle, editableRef, updateContent, selectWord, selectionchange, deleteArticle
    };
  }
}).use(ElementPlus).mount('#app');
