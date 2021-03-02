import React, { useEffect, useState } from "react";
import { MDBInput } from "mdbreact";

// import TextEntry from "../components/TextEntry";
// import MutableList from "../components/MutableList";
import Button from "../components/Button";

import styles from "./TextInput.module.css";
import { useTrack } from "../clientAnalyticsEvents";
import { puzzleLengthForRows } from "../analyticsEvents";
import Camera from "../helper/Camera";

interface Props {
  startingRows: string[];
  startingWords: string[];
  solvePuzzle: (rows: string[], words: string[]) => void;
}

const TextInput = (props: Props) => {
  const track = useTrack();

  const startingRows = props.startingRows || [];
  const startingWords = props.startingWords || [];

  useEffect(() => {
    track("input:view", {
      totalWordsCount: startingWords.length,
      puzzleLength: puzzleLengthForRows(startingRows),
      puzzleRows: startingRows.length,
    });
  }, [track, startingRows, startingWords]);

  const [text, setText] = useState(startingRows);
  const [words, setWords] = useState(startingWords);

  const setPuzzleFromImage = (puzzleString: string[], isPuzzleString: boolean) => {
    isPuzzleString ? setText(puzzleString) : setWords(puzzleString);
  };

  const onPuzzleChange = (event: React.FormEvent<HTMLInputElement>) => {
    const data = event.currentTarget.value.split("\n");
    setText(data);
  };

  const onWordsChange = (event: React.FormEvent<HTMLInputElement>) => {
    const data = event.currentTarget.value.split("\n");
    setWords(data);
  };

  return (
    <div className={styles.component}>
      <Camera getPuzzleString={(puzzleString, isPuzzleString) => setPuzzleFromImage(puzzleString, isPuzzleString)} />
      <header className={styles.header}>
        <h1>Input Wordsearch Text</h1>
      </header>

      <main className={styles.content}>
        {/* <TextEntry value={text} placeholder="Enter puzzle" onChange={setText}/> */}
        <MDBInput
          type="textarea"
          label="Enter Puzzle"
          icon="pencil-alt"
          rows={text ? text.length : 2}
          onChange={(event) => onPuzzleChange(event)}
        />

        {/* <MutableList items={words} onChange={setWords}>
          {(item) => item}
        </MutableList> */}
        <MDBInput
          type="textarea"
          label="Enter Words"
          icon="pencil-alt"
          rows={words ? words.length : 2}
          onChange={(event) => onWordsChange(event)}
        />
      </main>

      <footer className={styles.footer}>
        <Button
          onClick={() => {
            // console.log('text', text);
            // const rows = text.split("\n");
            // console.log('rows_start', rows);

            track("input:clickSolvePuzzle", {
              totalWordsCount: words ? words.length : 0,
              puzzleLength: text.length,
              puzzleRows: text.length,
            });

            props.solvePuzzle(text, words);
          }}
        >
          Solve Puzzle!
        </Button>
      </footer>
    </div>
  );
};

export default TextInput;
