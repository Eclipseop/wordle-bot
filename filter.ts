import { State } from '.';

const arraysEqual = (a: unknown[], b: unknown[]) => {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length != b.length) return false;
  a.sort();
  b.sort();

  for (let i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
};

export const filterOnlyWordsWithGuaranteedLetters = (wordList: string[], state: State[]): string[] => {
    
  const wordMustContain: string[] = state.filter(s => s.contains).map(s => s.letter);

  return wordList.filter(word => {
    const letters = word.split('');

    const availableLettersInWord = [...new Set(
      letters.filter(l => wordMustContain.includes(l))
    )];

    return arraysEqual(availableLettersInWord, wordMustContain);
  });
};

// Bad letters are letters we've guessed and we got an answer of no.
export const filterOutBadLetters = (wordList: string[], state: State[]): string[] => {
  const availableLetters: string[] = state.filter(s => !s.checked || s.contains).map(s => s.letter);

  return wordList.filter(word => {
    const letters = word.split('');

    for (const letter of letters) {
      if (!availableLetters.includes(letter)) return false;
    }

    return true;
  });
};

export const filterOutGuessedWords = (wordList: string[], guessedWords: string[]): string[] => {
  return wordList.filter(word => {
    return !guessedWords.includes(word);
  });
};

export const filterOnlyAbsolutePosition = (wordList: string[], guaranteedLetters: string[]): string[] => {
  return wordList.filter(word => {
    for (let i = 0; i < word.length; i++) {
      const gLetter = guaranteedLetters[i];
      const guessLetter = word[i];

      if (gLetter === '') continue;

      if (gLetter !== guessLetter) {
        return false;
      }
    }
    return true;
  });
};

export const filterOutWrongPositionLetters = (wordList: string[], state: State[], guaranteedLetters: string[]): string[] => {
  const wrongPositionLetters = state.filter(s => s.checkedPosition && s.checkedPosition.length > 0);
    
  return wordList.filter(word => {
    for (let i = 0; i < word.length; i++) {
      const letter = word[i];

      if (guaranteedLetters[i] === letter) continue;
            
      const previousPositions = wrongPositionLetters.find(s => s.letter === letter);
      if (previousPositions && previousPositions.checkedPosition?.includes(i)) {
        return false;
      }
    }
    return true;
  });
};