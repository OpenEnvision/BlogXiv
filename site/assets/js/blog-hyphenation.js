(function setupBlogHyphenation(global) {
    const softHyphen = '\u00AD';

    function hyphenateWord(word) {
        if (word.length < 5) return word;

        return Array.from(word)
            .map((character, index) => {
                const canBreakAfter = index >= 1 && index <= word.length - 3;
                return canBreakAfter ? `${character}${softHyphen}` : character;
            })
            .join('');
    }

    function hyphenateTitle(value) {
        return String(value).replace(/[A-Za-z]{5,}/g, hyphenateWord);
    }

    global.BlogXivHyphenation = { hyphenateTitle };
})(window);
