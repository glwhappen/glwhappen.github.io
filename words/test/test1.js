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
const a = ```

<span>你好</span>
```
console.log(cleanHTML4(a))