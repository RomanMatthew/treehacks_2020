# seedHacks
Drone-mounted tree planter with a splash of ML magic!

## Description

**The situation we find ourselves in as a planet is dire.**

It's not a secret that over the past several decades, as residential, commercial, and industrial demands have skyrocketed across several industries around the globe, deforestation has become a major problem in the world. Though we depend on trees for oxygen and to mitigate carbon levels in the atmosphere, they seem to be one of our fastest depleting resources.

**seedHacks is a tool to help save the world.**

Through the use of cloud-based image classification, live video feed, geospatial optimization, and robotic flight optimization, we've made seedHacks to help reclaim lost trees at a rate and efficiency that people might not be able to offer. Using our tech, a drone collecting simple birds-eye images of a sparsely populated forest can compute the optimal positions for seeds to be planted allowing for a desired future tree density given by users. Once it has this map, planting them becomes as easy as getting them into the ground.

## How did we build?

We broke the project up into three main parts: video feed and image collection, image tagging and seed location optimization, and user interface/display. To tackle image/video feed, we landed on using pygame to set up a constant video feed and collect images from that feed upon user request. We then send those collected images to a Microsoft could computing server, where we trained an object detection model using Azure's custom-vision platform, and returned a tagged JSON object with locations of the trees in the overhead image. Finally, we sent those JSON objects to an optimization algorithm that utilized all the free space possible as well as some distance constraints to fill the available space with as many trees as possible. All this was wrapped up in an elegant and easy-to-interpret UI that allows us to work together with the expertise of users to make the best end-result possible!

##What did we learn?

First off, that selecting and training good object detector can be complicated and mysterious, but definitely worth putting some time into. Though our initial models had promise, we needed to optimize for overhead forest views, which is not something that's used to train too many. Second, that keeping it simple is sometimes better for realizing ideas well. We were very excited to get our hands on a Jetson Nano and trick it out with AlwaysAI's amazing technologies, but we realized some time in that because we didn't actually end up using the hardware and software to the fullest of their abilities, they might not be the best approach to our particular problems. So, we simplified! Finally, that the applicability of cutting-edge environmental robotics carries a lot of promise going forward. With not too much time, we managed to develop a somewhat sophisticated system that could potentially have a huge impact - and we hope to be able to contribute more to the field in the future!

## How would we move forward?

Next steps for our project would include:

- Further optimization on seed location (more technical approach using botantical/silvological expertise, etc)
- Training object detector better and better to pick out individual and clusters of trees from an 
overhead view
- More training on burnt trees and forests
- Robotic pathfinding systems to automatically execute paths through a forest space
- Actuators on drones to make seed planting possible
- Generalizing to aquatic and other ecosystems, too!
