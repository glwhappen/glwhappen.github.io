export function fixBrokenSentences(text) {
    const lines = text.split('\n');
    let fixedText = '';
    let carryOver = '';
    let lastLineWasEmpty = false; // Track if the last processed line was empty

    lines.forEach((line, index) => {
        // Trim to remove any starting or trailing white spaces
        line = line.trim();
        if (line) {
            if (carryOver) {
                // Combine the carry over text with the current line
                line = carryOver + ' ' + line;
                carryOver = ''; // Clear the carry over text
            }
            // Check if the line ends with a period or if it's the last line
            if (!line.endsWith('.') && index !== lines.length - 1) {
                carryOver = line; // Save the line to carry over to the next line
            } else {
                // Add the complete sentence to the fixed text
                fixedText += line + '\n';
                if (lastLineWasEmpty) {
                    // Add an extra newline if the last line was empty
                    fixedText += '\n';
                    lastLineWasEmpty = false; // Reset the flag
                }
            }
        } else {
            // If the line is empty and there's no carryOver, mark it
            if (!carryOver && !lastLineWasEmpty) {
                lastLineWasEmpty = true; // Set the flag if it's a genuine empty line between sentences
            }
        }
    });

    // Check if there's any remaining carry over text and add it
    if (carryOver) {
        fixedText += carryOver + '\n';
    }

    return fixedText;
}

// Example usage:
const text = `Deep Neural Networks (DNNs) are prevalent across a broad range of applications. Despite their success, the complexity and opaque

nature of DNNs pose significant challenges in debugging and re

pairing DNN models, limiting their reliability and broader adoption.

In this paper, we propose MLM4DNN, an element-based automated

DNN repair method. Unlike previous techniques that focus on post

training adjustments or rely heavily on predefined bug patterns,

MLM4DNN repairs DNNs by leveraging a fine-tuned Masked Lan

guage Model (MLM) to predict correct fixes for 9 predefined key

elements in DNNs. We construct a large-scale dataset by masking

9 key elements from the correct DNN source code, and then force

the MLM to restore the correct elements to learn the deep seman

tics that ensure the normal functionalities of DNNs. Afterwards,

a light-weight static analysis tool is designed to filter out low

quality patches to enhance the repair efficiency, and an automated

validation process is performed to check the correctness of the

remaining patches. We evaluate MLM4DNN on two benchmarks,

namely 𝐵𝑒𝑛𝑐ℎ𝑚𝑎𝑟𝑘51 and 𝐵𝑒𝑛𝑐ℎ𝑚𝑎𝑟𝑘38, which differ in evaluation

strategies. MLM4DNN is capable of fixing 49% and 42% bugs on

two benchmarks respectively, achieving better repair performance

than five state-of-the-art repair methods. Furthermore, MLM4DNN

also achieves better efficiency with 130.6% speedup compared with

the existing methods.

I love you.`;

// console.log(fixBrokenSentences(text));
