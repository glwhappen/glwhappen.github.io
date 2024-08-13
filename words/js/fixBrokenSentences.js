export function fixBrokenSentences(text) {
    const lines = text.split('\n');
    let fixedText = '';
    let carryOver = '';
    let lastLineWasEmpty = false; // Track if the last processed line was empty

    lines.forEach((line, index) => {
        line = line.trim();
        if (line) {
            if (line.startsWith('#')) {
                // Flush the carryOver content before processing #
                if (carryOver) {
                    fixedText += carryOver + '\n';
                    carryOver = '';
                }
                // Add an empty line before the line starting with #
                fixedText += '\n' + line + '\n\n';
                lastLineWasEmpty = false; // Reset the flag
            } else {
                if (carryOver) {
                    line = carryOver + ' ' + line;
                    carryOver = '';
                }
                if (!line.endsWith('.') && index !== lines.length - 1) {
                    carryOver = line;
                } else {
                    fixedText += line + '\n';
                    if (lastLineWasEmpty) {
                        fixedText += '\n';
                        lastLineWasEmpty = false;
                    }
                }
            }
        } else {
            if (!carryOver && !lastLineWasEmpty) {
                lastLineWasEmpty = true;
            }
        }
    });

    // Flush any remaining carryOver content
    if (carryOver) {
        fixedText += carryOver + '\n';
    }

    return fixedText;
}
