### Assignment 2: WebGL Intro

The source code is available [here](https://github.com/RobethX/CS420X/blob/main/assignment2/).

---

*NOTE: I experienced memory leaks while using Firefox. I recommend using Chrome to avoid this issue.*

<iframe width="100%" style="aspect-ratio: 1/1" src="webgl.html" title="WebGL" frameborder="0" scrolling="no"></iframe>

Click [here](webgl.html) for a fullscreen view.

---

For this assignment I created a psychadelic trip shader for the camera. I started by creating a drunk wobble effect by offsetting the fragment coordinates with 2D noise. This wobble effect adds time-based distortion to the camera's image. The speed of the wobble can be adjusted (or disabled entirely) using the Tweakpane parameters menu. To build off what I learned in the first assignment, I aded additional distortion in the form of a configurable magnifying bubble following the cursor around. I then mixed the camera's input with a constantly shifting cloud of rainbow noise to add a colorful psychadelic look. This rainbow noise cloud was generated using three Fractal Brownian Motion functions with slightly different inputs. Finally, I outlined any edges from the camera's input using a Sobel filter. I made both the color of the outlines and the threshold of the edge detection adjustable in the parameters menu.