#!/usr/bin/env python3

import time
#import tree_classifier as tc
import asyncio
import pygame
import pygame.camera
import websockets

take_picture = False

async def ws_listener():
    uri = "whoop" #TODO, DEFINE WHAT THE URI IS
    async with websockets.connect("ws://localhost:8000") as websocket:
        while True:
            msg = await websocket.recv()
            take_picture = True if msg=="take_picture" else False
            print("Recieved command: ", take_picture)

async def camera_loop():
    pygame.camera.init()

    camera = pygame.camera.Camera("/dev/video2", (640, 480))
    # Allow Webcam to warm up
    time.sleep(2.0)
    camera.start()

    # loop detection
    # GET INPUT FROM THE USER HAHA
    while True:
        frame = camera.get_image()
        print(frame)
        
        # TODO integrate the frontent function that gives you this boolean
        if (take_picture):
            pass
            
            """
            # TODO postprocessing function
            planted_tree_map = SOME FUNCTION
            """

async def main():
    await asyncio.gather(
        ws_listener(),
        camera_loop(),
    )

if __name__ == "__main__":
    asyncio.get_event_loop().run_until_complete(main())
