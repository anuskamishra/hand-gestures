import React, { useRef, useState, useEffect } from 'react';
//import logo from './logo.svg';
import * as tf from "@tensorflow/tfjs";
import * as handpose from "@tensorflow-models/handpose";
import Webcam from 'react-webcam';
import './App.css';
import { drawHand } from './utilities';

// Import new stuff
import * as fp from "fingerpose";
import victory from "./victory.png";
import thumbs_up from "./thumbs_up.png";

function App() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  const [emoji, setEmoji] = useState(null);
  const images = { thumbs_up: thumbs_up, victory: victory };

  useEffect(() => {
    const runHandpose = async () => {
      const net = await handpose.load();
      //console.log("Handpose model loaded.");
      // Loop and detect hands
      const intervalId = setInterval(() => {
        detect(net);
      }, 100);

      // Cleanup interval on component unmount
      return () => clearInterval(intervalId);
    };

    runHandpose();
  }, []);

  const detect = async (net) => {
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      // Get video properties
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;
      
      // Set video height and width
      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;

      // Set canvas height and width
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;

      // Make detections
      const hand = await net.estimateHands(video);
      //console.log(hand);

      if (hand.length > 0) {
        const GE = new fp.GestureEstimator([
          fp.Gestures.VictoryGesture,
          fp.Gestures.ThumbsUpGesture,
        ]);

        const gesture = await GE.estimate(hand[0].landmarks, 8);
        //console.log(gesture);

        if (gesture.gestures !== undefined && gesture.gestures.length > 0) {
          // Get the gesture with the highest confidence
          const maxConfidence = gesture.gestures.reduce((prev, current) => (prev.confidence > current.confidence) ? prev : current);
          setEmoji(maxConfidence.name);
          console.log(maxConfidence.name); // Log current emoji
        }
      }

      // Draw mesh
      const ctx = canvasRef.current.getContext("2d");
      drawHand(hand, ctx);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <Webcam
          ref={webcamRef}
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zIndex: 9,
            width: 640,
            height: 480,
          }}
        />
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zIndex: 9,
            width: 640,
            height: 480,
          }}
        />
        {emoji !== null ? (
          <img
            src={images[emoji]}
            style={{
              position: "absolute",
              marginLeft: "auto",
              marginRight: "auto",
              left: 0,
              right: 0,
              bottom: 50, // Adjust this value as needed
              textAlign: "center",
              height: emoji === "victory" ? 150 : 100, // Increase size for victory sign
              width: emoji === "victory" ? 150 : 100, // Ensure width matches the height for victory sign
              zIndex: 10,
            }}
          />
        ) : (
          ""
        )}
      </header>
    </div>
  );
}

export default App;
