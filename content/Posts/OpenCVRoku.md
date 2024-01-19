---
author:
  name: "Abhi Poluri"
date: 2023-03-18
linktitle: Gesture Controlled Roku
type:
- post
- posts
title: Gesture Recognition and Roku TV Control with OpenCV and Roku Python Library
weight: 10
series:
- Hugo 101
categories:
- Coding
---

## Importing Libraries

The code imports several Python libraries required for different tasks:

- OpenCV: For computer vision.
- numpy: For numerical operations.
- mediapipe: For hand tracking.
- TensorFlow: For machine learning.
- Roku library: For controlling a Roku TV.

## Roku Setup

The code initializes a Roku object with the IP address of the Roku TV. This is the device the code will control.

## Mediapipe Initialization

It initializes the mediapipe library for hand tracking. A Hands object is created with specific configuration parameters for the hand tracking model.

## Loading Gesture Recognizer Model

The code loads a pre-trained machine learning model (presumably for gesture recognition) using TensorFlow's Keras API. The model is loaded from a file named 'mp_hand_gesture' and is designed to classify hand gestures.

## Loading Class Names

The code reads a list of class names from a file named 'gesture.names.' These class names correspond to the gestures the model can recognize, and they are stored in the 'classNames' list.

## Webcam Initialization

The code initializes the webcam using OpenCV's VideoCapture function, setting it to capture video from the default camera (usually index 0).

## Main Loop

The core of the program is a while loop that continually captures frames from the webcam, processes them, recognizes gestures, and controls the Roku TV.

### Frame Processing

- Each frame is read from the webcam and stored in the 'frame' variable.
- The frame is flipped horizontally to ensure that the captured hand gestures match the user's perspective.
- The frame is converted from BGR color format to RGB format (required for the hand tracking model).

### Hand Tracking

- The mediapipe 'hands' object processes the RGB frame to detect hand landmarks.
- Detected landmarks are drawn on the frame using 'mpDraw.draw_landmarks.'

### Gesture Recognition

- For each detected hand, the landmarks are extracted.
- These landmarks are fed into the loaded gesture recognition model, and a prediction is made.
- The predicted class (gesture) is determined using 'np.argmax,' and the corresponding class name is retrieved from the 'classNames' list.

### Roku TV Control

- Depending on the recognized gesture, the code sends specific remote control commands to the Roku TV using the Roku library. For example, a 'peace' gesture corresponds to the 'home' command, 'thumbs up' to 'up,' and so on.

### Displaying Output

- The recognized gesture's class name is displayed on the frame using OpenCV's 'cv2.putText.'
- The frame with landmarks and gesture information is displayed in a window named "Output."

### Exit Condition

- The program exits the loop if the user presses the 'q' key.

## Cleanup

After exiting the loop, the program releases the webcam and closes all active OpenCV windows.

In summary, this code combines OpenCV, mediapipe, TensorFlow, and the Roku library to create an interactive system where users can control their Roku TV by making specific hand gestures in front of their webcam.

Here is the code for the program

'''
  import cv2
  import numpy as np
  import mediapipe as mp
  import tensorflow as tf
  from tensorflow.keras.models import load_model
  from roku import Roku
  import time
  roku = Roku('x')
  start = time.time()


  # initialize mediapipe
  mpHands = mp.solutions.hands
  hands = mpHands.Hands(max_num_hands=1, min_detection_confidence=0.7)
  mpDraw = mp.solutions.drawing_utils

  # Load the gesture recognizer model
  model = load_model('mp_hand_gesture')

  # Load class names
  f = open('gesture.names', 'r')
  classNames = f.read().split('\n')
  f.close()
  print(classNames)


  # Initialize the webcam
  cap = cv2.VideoCapture(0)

  while True:
    # Read each frame from the webcam
    _, frame = cap.read()

    x, y, c = frame.shape

    # Flip the frame vertically
    frame = cv2.flip(frame, 1)
    framergb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

    # Get hand landmark prediction
    result = hands.process(framergb)

    # print(result)
    
    className = ''

    # post process the result
    if result.multi_hand_landmarks:
        landmarks = []
        for handslms in result.multi_hand_landmarks:
            for lm in handslms.landmark:
                # print(id, lm)
                lmx = int(lm.x * x)
                lmy = int(lm.y * y)

                landmarks.append([lmx, lmy])

            # Drawing landmarks on frames
            mpDraw.draw_landmarks(frame, handslms, mpHands.HAND_CONNECTIONS)

            # Predict gesture
            prediction = model.predict([landmarks])
            # print(prediction)
            classID = np.argmax(prediction)
            className = classNames[classID]

    # show the prediction on the frame
    cv2.putText(frame, className, (10, 50), cv2.FONT_HERSHEY_SIMPLEX, 
                   1, (0,0,255), 2, cv2.LINE_AA)

    if className == 'peace':
        roku.home()
        time.sleep(1)

    if className == 'thumbs up':
        roku.up()
        time.sleep(1)

    if className == 'thumbs down':
        roku.down()
        time.sleep(1)

    if className == 'rock':
        roku.left()
        time.sleep(1)

    if className == 'fist':
        roku.right()
        time.sleep(1)

    if className == 'okay':
        roku.select()
        time.sleep(1)

    if className == 'live long':
        roku.back()
        time.sleep(1)


    # Show the final output
    cv2.imshow("Output", frame)

    if cv2.waitKey(1) == ord('q'):
        break
    # release the webcam and destroy all active windows  
    cap.release()
    cv2.destroyAllWindows()

    
