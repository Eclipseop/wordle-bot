import * as fs from 'fs';
const fsPromises = fs.promises;
import * as readLine from 'readline';

const rl = readLine.createInterface({
    input: process.stdin,
    output: process.stdout
});

const getWordList = async (): Promise<string[]> => {
    const wordList = await fsPromises.readFile('./words.txt', 'utf8');
    
    const words = wordList.split('\r\n');
    return words;
}

type State = {
    letter: string,
    checked: boolean,
    contains: boolean,
    checkedPosition: number[] | undefined,
}

const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');

let letters: State[] = alphabet.map(letter => ({
    letter,
    checked: false,
    contains: false,
    checkedPosition: undefined,
}));

let FOR_SURE = ['','','','',''];

const arraysEqual = (a: any[], b: any[]) => {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length != b.length) return false;
    a.sort();
    b.sort();

    for (let i = 0; i < a.length; ++i) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}

const generateGuess = async (currentState: State[]): Promise<string> => {
    const availableLetters: string[] = currentState.filter(state => !state.checked || state.contains).map(state => state.letter);

    if (availableLetters.length === 26) {
        return 'beast';
    }

    const goodLetters: string[] = currentState.filter(state => state.contains).map(state => state.letter);
    console.log(`Good letters: ${goodLetters}`);

    const wordList = await getWordList();
    const filteredWordList = wordList.filter(word => {
        const wordLetters = word.split('');

        const goodLettersInWord = [...new Set(wordLetters.filter(letter => goodLetters.includes(letter)))];
        for (let letter of wordLetters) {
            if (!availableLetters.includes(letter)) {
                return false;
            }
            
        }
        return arraysEqual(goodLettersInWord, goodLetters);
    });

    console.log(`[1/3] Filtered out ${100 - Math.round((filteredWordList.length / wordList.length) * 100)}% of words. ${filteredWordList.length} possible words left.`);

    const filetedWordList2 = filteredWordList.filter(word => {
        for (let i = 0; i < word.length; i++) {
            const gLetter = FOR_SURE[i];
            const guessLetter = word[i];

            if (gLetter === '') continue;

            if (gLetter !== guessLetter) {
                return false;
            }
        }
        return true;
    });
    console.log(`[2/3] Filtered out ${100 - Math.round((filetedWordList2.length / wordList.length) * 100)}% of words. ${filetedWordList2.length} possible words left.`);

    const wrongPositionLetters = currentState.filter(state => state.checkedPosition && state.checkedPosition.length > 0);

    const filteredWordList3 = filetedWordList2.filter(word => {
        for (let i = 0; i < word.length; i++) {
            const guessLetter = word[i];

            if (FOR_SURE[i] === guessLetter) continue;

            const previousChecks = wrongPositionLetters.find(state => state.checkedPosition && state.letter === guessLetter);

            if (previousChecks && previousChecks.checkedPosition && previousChecks.checkedPosition.includes(i)) {
                return false;
            }
        }
        return true;
    });
    console.log(`[3/3] Filtered out ${100 - Math.round((filteredWordList3.length / wordList.length) * 100)}% of wordss. ${filteredWordList3.length} possible words left.`);

     return filteredWordList3[0];
}

const submitResults = (guess: string, results: string) => {
    for (let i = 0; i < guess.length; i++) {
        const letter = guess[i];
        const result = results[i];
        const state = letters.find(state => state.letter === letter);
        if (!state) return

        state.checked = true;
        if (result === 'y') {
            state.contains = true;
            FOR_SURE[i] = letter;
            state.checkedPosition = state.checkedPosition ? [...state.checkedPosition, i] : [i];
        } else if (result === 'm') {
            state.contains = true;
            state.checkedPosition = state.checkedPosition ? [...state.checkedPosition, i] : [i];
        }
    }
}

const main = async () => {

    for (let i = 0; i < 6; i++) {
        const guess = await generateGuess(letters);
        console.log(`Guess: ${guess}`);
        const results: string = await new Promise(res => {
            rl.question('What were the results? (y/m/n) ', res);
        });
        submitResults(guess, results);
        if (results === 'yyyyy') {
            console.log('nice :)')
            break;
        }
    }

}

main();