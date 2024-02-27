import './App.css';
import 'typeface-roboto';
import { useState, useRef } from 'react';
import wordList from './wordList';
import { useContext } from 'react';
import { KeyboardColorContext } from './KeyboardColorContext';

function Grid({ grid, children }) {
  return (
    <div className="grid-wrapper">
      {children}
      <div className="letter-grid">
        {grid.map((el, i) => (
          <div className={el?.color} key={i}>
            {el?.letter}
          </div>
        ))}
      </div>
    </div>
  );
}

function Key({ input }) {
  const keyboardColors = useContext(KeyboardColorContext);
  const color = keyboardColors.find(k => k.letter === input)?.color;
  return (
    <div className={`key ${color}`}>
      {input === 'Delete' ? <i className="fa-solid fa-delete-left"></i> : input}
    </div>
  );
}

function FirstRow() {
  return (
    <div className="first-row">
      <Key input={'Q'}></Key>
      <Key input={'W'}></Key>
      <Key input={'E'}></Key>
      <Key input={'R'}></Key>
      <Key input={'T'}></Key>
      <Key input={'Y'}></Key>
      <Key input={'U'}></Key>
      <Key input={'I'}></Key>
      <Key input={'O'}></Key>
      <Key input={'P'}></Key>
    </div>
  );
}

function SecondRow() {
  return (
    <div className="second-row">
      <Key input={'A'}></Key>
      <Key input={'S'}></Key>
      <Key input={'D'}></Key>
      <Key input={'F'}></Key>
      <Key input={'G'}></Key>
      <Key input={'H'}></Key>
      <Key input={'J'}></Key>
      <Key input={'K'}></Key>
      <Key input={'L'}></Key>
    </div>
  );
}
function ThirdRow() {
  return (
    <div className="third-row">
      <Key input={'Delete'}></Key>
      <Key input={'Z'}></Key>
      <Key input={'X'}></Key>
      <Key input={'C'}></Key>
      <Key input={'V'}></Key>
      <Key input={'B'}></Key>
      <Key input={'N'}></Key>
      <Key input={'M'}></Key>
      <Key input={'Enter'}></Key>
    </div>
  );
}

function Keyboard({ onEnterKey, onBackspace, onLetterKey, isGameEnd }) {
  function onKeyboard(e) {
    const key = e.target.closest('.key');
    if (!key) return;
    const pressedKey = key.textContent;
    if (pressedKey === 'Enter') onEnterKey();
    else if (!pressedKey) onBackspace();
    else onLetterKey(pressedKey);
  }

  return (
    <div
      className={`keyboard ${isGameEnd ? 'no-click' : ''}`}
      onClick={onKeyboard}
    >
      <FirstRow />
      <SecondRow />
      <ThirdRow />
    </div>
  );
}

function Message({
  msg,
  setMsg,
  isGameEnd,
  setIsGameEnd,
  setGrid,
  setKeyboardColors,
  nextSquareRef,
}) {
  return (
    <div className="message">
      {msg}
      {isGameEnd && (
        <button
          onClick={() => {
            setIsGameEnd(false);
            setMsg(null);
            setGrid(initialGrid);
            setKeyboardColors([]);
            nextSquareRef.current = 0;
          }}
          className="btn-reset"
        >
          play again
        </button>
      )}
    </div>
  );
}

function App() {
  const [grid, setGrid] = useState(initialGrid);
  const [currentGuess, setCurrentGuess] = useState('');
  const nextSquareRef = useRef(0);
  const [msg, setMsg] = useState(null);
  const [answer] = useState(
    wordList[Math.trunc(Math.random() * 9385) - 1].word.toUpperCase()
  );
  const attemptedLetters = useRef([]);
  const [keyboardColors, setKeyboardColors] = useState([]);
  const [isGameEnd, setIsGameEnd] = useState(false);

  function isRealWord(wordToCheck) {
    return wordList.some(w => w.word === wordToCheck);
  }

  function showMsg(msg, plyAgain = false) {
    setMsg(msg);
    plyAgain || setTimeout(() => setMsg(null), 1000);
  }

  function onLetterKey(key) {
    if (currentGuess.length > 4) return;
    setGrid(
      grid.map((ltr, i) =>
        i === nextSquareRef.current ? { letter: key, color: '' } : ltr
      )
    );
    setCurrentGuess(currentGuess + key);
    nextSquareRef.current += 1;
  }

  function onBackspace() {
    if (currentGuess.length === 0) return;
    const currentSquare = nextSquareRef.current - 1;
    setGrid(grid.map((ltr, i) => (i === currentSquare ? null : ltr)));
    setCurrentGuess(currentGuess.slice(0, currentGuess.length - 1));
    nextSquareRef.current -= 1;
  }

  async function onEnterKey() {
    if (currentGuess.length < 5) return showMsg('Too short');
    if (!isRealWord(currentGuess.toLowerCase()))
      return showMsg('Word not found');
    console.log(answer);
    coloriseGrid(getGridColors(Array.from(currentGuess)));
    getKeyboardColors(Array.from(currentGuess));
    setCurrentGuess('');
    if (currentGuess === answer) {
      showMsg('You won', true);
      setIsGameEnd(true);
    } else if (nextSquareRef.current === 30) {
      showMsg('Yo lost', true);
      setIsGameEnd(true);
    }
  }

  function getGridColors(letters) {
    const answerArr = Array.from(answer);
    const colorArr = letters.map((letter, i) => {
      if (!answerArr.includes(letter)) return 'grey';
      else if (letter === answerArr[i]) return 'green';
      else return 'yellow';
    });
    return colorArr;
  }

  function coloriseGrid(colors) {
    const start = nextSquareRef.current - 5;
    const end = nextSquareRef.current - 1;
    const newGrid = grid.map((letter, i) => {
      return i >= start && i <= end
        ? { ...letter, color: colors[i % 5] }
        : letter;
    });
    setGrid(newGrid);
  }

  function getKeyboardColors(letters) {
    const answerArr = Array.from(answer);
    const attempts = letters.map((letter, i) => {
      if (!answerArr.includes(letter)) return { letter, color: 'grey' };
      else if (letter === answerArr[i]) return { letter, color: 'green' };
      else return { letter, color: 'yellow' };
    });
    attempts.forEach(attempt => {
      const index = attemptedLetters.current.findIndex(
        ltr => ltr.letter === attempt.letter
      );
      index === -1
        ? attemptedLetters.current.push(attempt)
        : (attemptedLetters[index] = attempt);
    });
    setKeyboardColors(attemptedLetters.current);
  }

  return (
    <section>
      <Grid grid={grid}>
        {msg && (
          <Message
            msg={msg}
            setMsg={setMsg}
            isGameEnd={isGameEnd}
            setIsGameEnd={setIsGameEnd}
            setGrid={setGrid}
            setKeyboardColors={setKeyboardColors}
            nextSquareRef={nextSquareRef}
          />
        )}
      </Grid>
      <KeyboardColorContext.Provider value={keyboardColors}>
        <Keyboard
          onEnterKey={onEnterKey}
          onBackspace={onBackspace}
          onLetterKey={onLetterKey}
          isGameEnd={isGameEnd}
        />
      </KeyboardColorContext.Provider>
    </section>
  );
}

export default App;

const initialGrid = Array(30).fill({ letter: '', color: '' });
