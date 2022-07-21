### Assignment 1: Live Shader Coding

The source code is available [here](https://github.com/RobethX/CS420X/blob/main/assignment1/frag.glsl).

---

<iframe width="500" height="281.25" src="https://www.youtube.com/embed/NPxeZBs0ZCY?&autoplay=1&mute=1" title="YouTube video player" frameborder="0" allow="autoplay; fullscreen; encrypted-media; picture-in-picture"></iframe>

---

My aesthetic inspiration for this project was those [color changing squishy mesh balls](https://i.imgur.com/e6PjaBC.jpeg) I used to play with as a kid. This idea came to me as I was experimenting with the Voronoi function built into Shawn Lawson's The Force environment. Because of my interest in the Voronoi function, I made it the foundation of my animation. I used time as an input to make the Voronoi cells appear to bubble up and dissolve as they sway back and forth. I set the rotation point as the current cursor position to add an element of interaction. To make the animation more vibrant, I used a series of smoothsteps and other functions on each color channel. The result was brilliant blue bubbles pushing through a fushia net. Finally, I converted the RGB values to HSV and back to make the hue change over the course of a minute.