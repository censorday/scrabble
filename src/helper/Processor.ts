import StrictEventEmitter from "strict-event-emitter-types";
import { EventEmitter } from "events";
import captureImage from "../imageProcessing/captureImage";
import {generateText} from "./TesseractHelper";

export type VideoReadyPayload = { width: number; height: number };

interface ProcessorEvents {
  videoReady: VideoReadyPayload;
}

type ProcessorEventEmitter = StrictEventEmitter<EventEmitter, ProcessorEvents>;

export default class Processor extends (EventEmitter as {
  new (): ProcessorEventEmitter;
}) {
  // the source for our video
  video!: HTMLVideoElement;
  // is the video actually running?
  isVideoRunning: boolean = false;
  // are we in the middle of processing a frame?
  isProcessing: boolean = false;

  /**
   * Start streaming video from the back camera of a phone (or webcam on a computer)
   * @param video A video element - needs to be on the page for iOS to work
   */
  async startVideo(video: HTMLVideoElement) {
    this.video = video;
      // start up the video feed
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: 360, height: 320 },
        audio: false,
      });
      // grab the video dimensions once it has started up
      const canPlayListener = () => {
          this.video.removeEventListener("canplay", canPlayListener);
          this.emit("videoReady", {
            width: this.video.videoWidth,
            height: this.video.videoHeight,
          });
          this.isVideoRunning = true;
      };
      this.video.addEventListener("canplay", canPlayListener);
      this.video.srcObject = stream;
      this.video.play();
  }

  takePuzzleSnapshot = async (isPuzzle: boolean) => {
    const image = captureImage(this.video);
    const imageString = URL.createObjectURL(image);
    const stringPatterns = await generateText(imageString, isPuzzle);
    console.log('stringPatterns', stringPatterns);
    return stringPatterns;
  };
}
