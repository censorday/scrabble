import React, { useEffect, useRef, useState } from "react";
//import "./App.css";
import Processor, { VideoReadyPayload } from "./Processor";
import { generateText } from "./TesseractHelper";

const processor = new Processor();


interface Props {
  getPuzzleString: (puzzle: string[], isPuzzleString: boolean) => void;
}

const Camera = (props: Props) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  const [videoWidth, setVideoWidth] = useState(100);
  const [videoHeight, setVideoHeight] = useState(100);

  // start the video playing
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      processor.startVideo(video).then(
        () => console.log("Video started"),
        (error: { message: any }) => alert(error.message)
      );
    }
  }, [videoRef]);

  // update the video scale as needed
  useEffect(() => {
    function videoReadyListener({ width, height }: VideoReadyPayload) {
      setVideoWidth(width);
      setVideoHeight(height);
    }
    processor.on("videoReady", videoReadyListener);
    return () => {
      processor.off("videoReady", videoReadyListener);
    };
  });

  const handleChange = async (event: any, isPuzzle: boolean) => {
    event.persist();
    let stringPatterns: string[] = [];
    if (event && event.target.files[0]) {
      for (var key in event.target.files) {
        if (!event.target.files.hasOwnProperty(key)) continue;
        let file = event.target.files[key];
        let imageString = URL.createObjectURL(file);
        stringPatterns = await generateText(imageString, isPuzzle);
      }
    }
    return stringPatterns;
  };

  return (
    <div>
      <label className="fileUploaderContainer">
        Upload Puzzle:&nbsp;&nbsp;
        <input
          type="file"
          id="puzzleFileUploader"
          title="Upload Puzzle"
          onChange={async (event) => {
            const puzzleString = await handleChange(event, true);
            props.getPuzzleString(puzzleString, true)
          }}
          multiple
        />
      </label>
      <br/>
      <label className="fileUploaderContainer">
        Upload Words:&nbsp;&nbsp;
        <input
          type="file"
          id="wordsFileUploader"
          title="Upload Words"
          onChange={async (event) => {
            const wordsString = await handleChange(event, false);
            props.getPuzzleString(wordsString, false)
          }}
          multiple
        />
      </label>
      <br/>
      <br/>
      <button 
          onClick={async () => {
            const puzzleString = await processor.takePuzzleSnapshot(true);
            props.getPuzzleString(puzzleString, true);
          }}
      >Snap Puzzle</button>
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      <button 
          onClick={async () => {
            const wordsString = await processor.takePuzzleSnapshot(false);
            props.getPuzzleString(wordsString, false);
          }}
      >Snap Words</button>
      <br/>
      <video
        ref={videoRef}
        className="video-preview"
        width={videoWidth}
        height={videoHeight}
        playsInline
        muted
      />
      <canvas
        ref={previewCanvasRef}
        className="preview-canvas"
        width={videoWidth}
        height={videoHeight}
      />
    </div>
  );
}

export default Camera;
