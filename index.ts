import * as fs from 'fs';
const fsPromises = fs.promises;
import * as readLine from 'readline';
import { filterOnlyAbsolutePosition, filterOnlyWordsWithGuaranteedLetters, filterOutBadLetters, filterOutGuessedWords, filterOutWrongPositionLetters } from './filter';

const rl = readLine.createInterface({
    input: process.stdin,
    output: process.stdout
});

const getWordList = async (): Promise<string[]> => {
    const wordList = await fsPromises.readFile('./words.txt', 'utf8');
    
    const words = wordList.split('\r\n');
    return words;
}

export type State = {
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

const gussedWords: string[] = [];

const generateGuess = async (currentState: State[]): Promise<string> => {
    const availableLetters: string[] = currentState.filter(state => !state.checked || state.contains).map(state => state.letter);

    if (availableLetters.length === 26) {
        return 'beast';
    }

    const wordList = await getWordList();

    const step1 = filterOutBadLetters(wordList, currentState);
    const step2 = filterOnlyWordsWithGuaranteedLetters(step1, currentState);
    const step3 = filterOutGuessedWords(step2, gussedWords);
    const step4 = filterOnlyAbsolutePosition(step3, FOR_SURE);
    const step5 = filterOutWrongPositionLetters(step4, currentState, FOR_SURE);

    return step5[0];
}

const submitResults = (guess: string, results: string) => {
    gussedWords.push(guess);
    
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