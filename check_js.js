const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'index.html');
let content = fs.readFileSync(filePath, 'utf8');

// 检查从第1137行开始的script标签内容
const scriptStart = content.indexOf('<script>', 1130);
const scriptEnd = content.lastIndexOf('</script>');

if (scriptStart !== -1 && scriptEnd !== -1) {
    const scriptContent = content.substring(scriptStart + '<script>'.length, scriptEnd);
    console.log('Script content length:', scriptContent.length);
    
    // 检查括号配对
    let openBraces = 0;
    let openParens = 0;
    let openBrackets = 0;
    
    for (let i = 0; i < scriptContent.length; i++) {
        const char = scriptContent[i];
        if (char === '{') openBraces++;
        else if (char === '}') openBraces--;
        else if (char === '(') openParens++;
        else if (char === ')') openParens--;
        else if (char === '[') openBrackets++;
        else if (char === ']') openBrackets--;
    }
    
    console.log('Open braces:', openBraces);
    console.log('Open parens:', openParens);
    console.log('Open brackets:', openBrackets);
    
    // 打印最后200个字符
    console.log('\nLast 200 characters of script:');
    console.log(scriptContent.substring(Math.max(0, scriptContent.length - 200)));
}
