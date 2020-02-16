#!/usr/bin/env python3

import time
import custom_vision as vis
import pygame
import pygame.camera
import websocket
import _thread as thread

take_picture = False


def on_ws_message(ws, message):
    global take_picture
    if message == 'take_picture':
        take_picture = True


def connect_ws():
    global take_picture
    uri = 'ws://localhost:8000/command-stream'
    client = websocket.WebSocketApp(uri, on_message=on_ws_message)
    def run():
        client.run_forever()
    thread.start_new_thread(run, ())

def camera_loop():
    global take_picture

    pygame.camera.init()

    print('Loading webcam...')
    camera = pygame.camera.Camera("/dev/video2", (640, 480))
    # Allow Webcam to warm up
    camera.start()

    while True:
        frame = camera.get_image()

        # TODO integrate the frontent function that gives you this boolean
        if take_picture:
            print('Took picture!')
            pygame.image.save(frame, 'webcam.jpg')
            trees = vis.custom_vision_tree('webcam.jpg')
            print(trees)
            take_picture = False

            """
            # TODO postprocessing function
            planted_tree_map = SOME FUNCTION
            """

if __name__ == "__main__":
    connect_ws()
    camera_loop()
