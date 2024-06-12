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