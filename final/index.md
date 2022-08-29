### Final Project

The source code is available [here](https://github.com/RobethX/CS420X/blob/main/final/webgl.html).

---

<iframe width="100%" height="auto" src="webgl.html" title="WebGL" frameborder="0" scrolling="no"></iframe>

Click [here](webgl.html) for a fullscreen view.

---

For the final project, I decided to implement a Boids simulation that could be interacted with using a joystick or your device's gyroscope. To get the boids to interact with each other, I had to store all the boid data somewhere that the vertex shader could access it. Because compute shaders are not supported by default and this version of WebGL does not have buffer textures, I opted to store the boid data as a one-dimensional texture using the framebuffer. This method was far from ideal and caused me many problems along the development process. Each boid reacts to the other boids within a configurable range to create a flock. The parameters of the boid algorithm can be modified using Tweakpane. I created a virtual joystick as well as adding support for hardware gamepads to control the flow of the boids. Alongside the virtual joystick, I fed the gyroscope sensor data to the boids for additional control over the flocks on mobile devices.

---

<iframe width="500" height="281.25" src="https://www.youtube.com/embed/hg6UU6aSlhQ?&autoplay=1&mute=1" title="YouTube video player" frameborder="0" allow="autoplay; fullscreen; encrypted-media; picture-in-picture"></iframe>