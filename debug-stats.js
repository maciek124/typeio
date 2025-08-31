// Debug script to test stats calculation

function computeStatsDebug(words, typed, seconds, finished = false) {
  let spaces = 0;
  let correctWordChars = 0;
  let allCorrectChars = 0;
  let incorrectChars = 0;
  let extraChars = 0;
  let missedChars = 0;
  let correctSpaces = 0;

  // Clean up typed array
  const inputWords = typed.filter((word, index) => {
    return word.length > 0 || index < typed.length - 1;
  });
  const targetWords = words;

  console.log('Input data:', {
    inputWords,
    targetWords: targetWords.slice(0, 5),
    seconds,
    finished
  });

  for (let i = 0; i < Math.max(inputWords.length, targetWords.length); i++) {
    const inputWord = inputWords[i] ?? "";
    const targetWord = targetWords[i] ?? "";
    
    let wordCorrect = true;

    // Check if word exists in input (space was pressed)
    if (i < inputWords.length) {
      spaces++;
    }

    console.log(`Word ${i}: "${inputWord}" vs "${targetWord}"`);

    // Character by character comparison
    for (let c = 0; c < Math.max(inputWord.length, targetWord.length); c++) {
      const inputChar = inputWord[c];
      const targetChar = targetWord[c];

      if (inputChar !== undefined && targetChar !== undefined) {
        // Both characters exist
        if (inputChar === targetChar) {
          allCorrectChars++;
          console.log(`  Char ${c}: correct "${inputChar}"`);
        } else {
          incorrectChars++;
          wordCorrect = false;
          console.log(`  Char ${c}: incorrect "${inputChar}" (expected "${targetChar}")`);
        }
      } else if (inputChar !== undefined && targetChar === undefined) {
        // Extra character
        extraChars++;
        wordCorrect = false;
        console.log(`  Char ${c}: extra "${inputChar}"`);
      } else if (inputChar === undefined && targetChar !== undefined) {
        // Missing character
        const currentWordIndex = inputWords.length - 1;
        if (i < currentWordIndex || (finished && i === currentWordIndex)) {
          missedChars++;
          wordCorrect = false;
          console.log(`  Char ${c}: missed "${targetChar}"`);
        }
      }
    }

    // If word is perfect, count all its characters as correctWordChars
    if (wordCorrect && inputWord === targetWord && inputWord.length > 0) {
      correctWordChars += inputWord.length;
      console.log(`  Word perfect: +${inputWord.length} correctWordChars`);
    }

    // Count correct spaces
    if (i < inputWords.length && wordCorrect && inputWord === targetWord) {
      correctSpaces++;
      console.log(`  Correct space`);
    }
  }

  // Adjust spaces
  if (spaces > 0) {
    spaces--;
  }
  if (correctSpaces > 0 && correctSpaces > inputWords.length - 1) {
    correctSpaces = inputWords.length - 1;
  }

  const testSeconds = Math.max(seconds, 1);
  const wpm = Math.round(((correctWordChars + correctSpaces) * (60 / testSeconds)) / 5);
  const rawWpm = Math.round(((allCorrectChars + spaces + incorrectChars + extraChars) * (60 / testSeconds)) / 5);
  
  const totalTypedChars = allCorrectChars + incorrectChars + extraChars;
  const accuracy = totalTypedChars === 0 ? 0 : Math.round((allCorrectChars / totalTypedChars) * 100);

  console.log('Final counts:', {
    spaces,
    correctWordChars,
    allCorrectChars,
    incorrectChars,
    extraChars,
    missedChars,
    correctSpaces,
    totalTypedChars,
    testSeconds,
    wpm,
    rawWpm,
    accuracy
  });

  return {
    correctChars: allCorrectChars,
    incorrectChars,
    extraChars,
    missedChars,
    totalChars: totalTypedChars,
    wpm,
    rawWpm,
    accuracy
  };
}

// Test case based on the screenshot
const words = ["the", "quick", "brown", "fox", "jumps"];
const typed = ["the", "quick", "brown", ""]; // assuming they typed 3 words and stopped
const seconds = 15;
const finished = true;

console.log('=== DEBUG TEST ===');
computeStatsDebug(words, typed, seconds, finished);
