# seedHacks

Drone-mounted tree planter with a splash of ML magic!

## Description

**Our planet's in dire straits.**

It's not a secret that over the past several decades, as residential, commercial, and industrial demands have skyrocketed across several industries around the globe, deforestation has become a major problem facing humanity. Though we depend on trees and forests for so much, they seem to be one of our fastest depleting natural resources. As our primary provider for oxygen and one of our biggest global carbon sinks, this is very dangerous news.

**seedHacks is a tool to help save the world.**

Through the use of cloud-based image classification, live video feed, geospatial optimization, and robotic flight optimization, we've made seedHacks to facilitate reforestation at a rate and efficiency that people might not be able to offer. Using our tech, a drone collecting simple birds-eye images of a forest can compute the optimal positions for seeds to be planted, aiming to approach a desired forest density collected from the user. Once it has this map, planting them's just a robotics problem! Easy, right?

## How did we build?

We broke the project up into three main parts: video feed and image collection, image tagging and seed location optimization, and user interface/display.
 
To tackle image/video, we landed on using pygame to set up a constant feed and collect images from that feed upon user request.
 
We then send those captured images to a Microsoft could computing server, where we trained an object detection model using Azure's custom-vision platform which returns a tagged image with locations of the trees in the overhead image. 
Finally, we send to an optimization algorithm that utilizes all the free space possible as well as some distance constraints to fill the available space with as many trees as possible. All this was wrapped up in an elegant and easy-to-interpret UI that allows us to work together with the expertise of users to make the best end-result possible!

## Technical Notes

- Azure custom vision was used to train an object detection model that could label tree and trees. We used about 33 images found online to train this machine learning model, resulting in a precision of 82.5% 

- We used the custom vision API to send our aerial view images of forests to the prediction endpoint which returned predictions consisting of confidence level, label, and a bounding box. 

- We then parsed the output of the object detection by creating a 2D numpy array in Python representing the original image. We filled indices of the array with 1’s where pixels were labeled as “tree” or “trees” with at least a 50% confidence. At the same time, we extracted the max width and height of the canopy of the trees to automate the process for users. The users are allowed to input a buffer, as a percentage, which increases the bounding box for tree growth based on the current , this is especially important if the roots of the tree need space to grow or the tree species is competitive. 
 
- After the 2D array was filled with pre-existing trees, we iterated through the array to find places where new trees could be planted such that there was enough space for the tree to mature to its full canopy size. We labeled these indices with 2 to differentiate between existing trees and potential new trees.

## What did we learn?

First off, that selecting and training good object detector can be complicated and mysterious, but definitely worth putting some time into. Though our initial models had promise, we needed to optimize for overhead forest views, which is not something that's used to train too many. 

Second, that keeping it simple is sometimes better for realizing ideas well. We were very excited to get our hands on a Jetson Nano and trick it out with AlwaysAI's amazing technologies, but we realized some time in that because we didn't actually end up using the hardware and software to the fullest of their abilities, they might not be the best approach to our particular problems. So, we simplified! 

Finally, that the applicability of cutting-edge environmental robotics carries a lot of promise going forward. With not too much time, we managed to develop a somewhat sophisticated system that could potentially have a huge impact - and we hope to be able to contribute more to the field in the future!

## What's next for seedHacks?

Next steps for our project would include:

- Further optimization on seed location (more technical approach using botantical/silvological expertise, etc) 

- Training object detector better and better to pick out individual and clusters of trees from an overhead view

- More training on burnt trees and forests 

- Robotic pathfinding systems to automatically execute paths through a forest space 

- Actuators on drones to make seed planting possible 

- Generalizing to aquatic and other ecosystems
