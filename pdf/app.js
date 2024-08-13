document.getElementById('pdf-upload').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
        const fileReader = new FileReader();
        fileReader.onload = function() {
            const typedArray = new Uint8Array(this.result);
            pdfjsLib.getDocument(typedArray).promise.then(pdf => {
                let pdfText = "";
                const numPages = pdf.numPages;
                const promises = [];

                for (let i = 1; i <= numPages; i++) {
                    promises.push(
                        pdf.getPage(i).then(page => {
                            return page.getTextContent().then(textContent => {
                                let pageText = "";
                                let lastY, textLine = '';
                                textContent.items.forEach(item => {
                                    if (lastY === item.transform[5] || !lastY) {
                                        textLine += item.str + ' ';
                                    } else {
                                        if (shouldMerge(textLine)) {
                                            pageText += textLine.trim() + ' ';
                                        } else {
                                            pageText += textLine.trim() + '\n';
                                        }
                                        textLine = item.str + ' ';
                                    }
                                    lastY = item.transform[5];
                                });
                                pageText += textLine.trim() + '\n';
                                pdfText += pageText + '\n';
                            });
                        })
                    );
                }

                Promise.all(promises).then(() => {
                    document.getElementById('pdf-content').innerText = pdfText;
                });
            });
        };
        fileReader.readAsArrayBuffer(file);
    } else {
        alert('Please upload a valid PDF file.');
    }
});

function shouldMerge(textLine) {
    // 定义合并逻辑，例如检测文本行是否为短行或以特定标点符号结束
    const trimmedLine = textLine.trim();
    if (trimmedLine.length < 40 || /^[a-z]/.test(trimmedLine)) {
        return true;
    }
    return false;
}
