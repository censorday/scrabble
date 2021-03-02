import React, { useCallback, useState } from "react";
import {
  Editor,
  EditorState,
  ContentState,
  CompositeDecorator,
  ContentBlock,
} from "draft-js";
import styles from "./TextEntry.module.css";
import { useTrack } from "../clientAnalyticsEvents";

interface Props {
  value: string;
  onChange: (newText: string) => void;
  placeholder: string;
  //needRender: boolean;
}

type FocusState =
  | {
      focused: true;
      startingPuzzleLength: number;
    }
  | {
      focused: false;
    };

const TextEntry = React.memo((props: Props) => {
  console.log("props.value : ", props.value);
  const [editorState, setEditorState] = useState(() => {
    const decorator = new CompositeDecorator([
      { strategy: eachCharStrategy, component: HandleSpan },
    ]);

    const contentState = ContentState.createFromText(props.value);
    console.log("contentState: ", contentState);
    const editorState = EditorState.createWithContent(contentState, decorator);
    console.log("editorState: ", editorState);

    return editorState;
  });

  // useEffect(() => {
  //   setEditorState(() => {
  //     const decorator = new CompositeDecorator([
  //       { strategy: eachCharStrategy, component: HandleSpan },
  //     ]);
  
  //     const contentState = ContentState.createFromText(props.value);
  //     console.log("contentState: ", contentState);
  //     const editorState = EditorState.createWithContent(contentState, decorator);
  //     console.log("editorState: ", editorState);
  
  //     return editorState;
  //   });
  // }, [props.value]);

  const track = useTrack();

  const [focusedState, setFocusedState] = useState<FocusState>({
    focused: false,
  });
  const setFocused = useCallback(() => {
    setFocusedState({
      focused: true,
      startingPuzzleLength: editorState.getCurrentContent().getPlainText()
        .length,
    });
  }, [setFocusedState, editorState]);

  const setUnfocused = useCallback(() => {
    if (focusedState.focused) {
      track("input:editPuzzle", {
        beforeLength: focusedState.startingPuzzleLength,
        afterLength: editorState.getCurrentContent().getPlainText().length,
      });
    }

    setFocusedState({
      focused: false,
    });
  }, [focusedState, setFocusedState, track, editorState]);

  return (
    <div
      className={[styles.editor, focusedState.focused && styles.hidePlaceholder]
        .filter((e) => !!e)
        .join(" ")}
    >
      {console.log('plainText', editorState.getCurrentContent().getPlainText())}
      <Editor
        placeholder={props.placeholder}
        stripPastedStyles={true}
        editorState={editorState}
        onFocus={() => setFocused()}
        onBlur={() => setUnfocused()}
        onChange={(editorState) => {
          const contentState = editorState.getCurrentContent();
          props.onChange(contentState.getPlainText());
          setEditorState(editorState);
        }}
        blockStyleFn={blockStyleFn}
      />
    </div>
  );
});

const blockStyleFn = () => styles.block;

const eachCharStrategy = (
  contentBlock: ContentBlock,
  callback: (start: number, end: number) => void
) => {
  const text = contentBlock.getText();

  for (let i = 0; i < text.length; i++) {
    callback(i, i + 1);
  }
};

interface HandleSpanProps {
  children: React.ReactNode;
}

const HandleSpan = (props: HandleSpanProps) => (
  <span className={styles.khar}>{props.children}</span>
);

export default TextEntry;
