### Assignment 4: Physarum

The source code is available [here](https://github.com/RobethX/CS420X/blob/main/assignment4/).

---

<iframe width="100%" style="aspect-ratio: 1/1" src="webgl.html" title="WebGL" frameborder="0" scrolling="no"></iframe>

Click [here](webgl.html) for a fullscreen view.

---

Preset 1: Default
: This preset is based off parameters from the template code. On starting/restarting the simulation with this preset, the agents cluster immediately into narrow paths. As time goes on, the ends of these paths feel around for others, merging into eachother. The agents move slowly and have moderately long, sweeping sensors. These factors, combined with a high chemical trail strength, lead to forming paths that tend to simplify in geometry, closing in on themselves to optimize arbitrary routes. After enough time this preset can lead to a fairly stable without too much change.

Preset 2: Smoke
: The *Smoke* preset is ment to resemble the whisps of smoke. This effect, which can take a minute to settle in, is caused primarily by changing three parameters from default. First the rotation angle is decreased significantly so that the path of the agents is smoothed out. Then, the speed of the agents is increased to create whispy winding loops. The third and final key change for this preset is decreasing the sensor distance so that the whisps shift and dissipate naturally. The remaining changed parameters constitute minor visual tweaks.

Preset 3: Coral
: The *Coral* preset is the most abstract of the four included. The resulting visual is a shimmering sea of tight geometry similar to that seen on stony coral. Despite the fairly slow evolution of the pattern, the agent speed is set very high. A combination of a high agent rotation angle and low sensor distance keep the clusters of agents from moving too far while adding the ghostly TV-static effect to the visuals. Unlike with the other presets, this effect does not evolve much over time.

Preset 4: Sand
: With tiny, high opacity agents, the *Sand* preset models the flow of individual particles of sand. This preset uses a high sensor distance and a low chemical trail strength to create fast-moving rivers of particles. Resetting the simulation on this preset shows the particles flow into almost dune-like formations before dispersing further into rapidly-moving streams and dust-like clouds of disoriented agents. This preset evolves quite a bit over time, and it is fun to play with the parameters as it goes on.