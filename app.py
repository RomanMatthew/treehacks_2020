#!/usr/bin/env python3

import time
import custom_vision as vis
import pygame
import pygame.camera
import requests
import _thread as thread
import websocket

SERVER_URL = 'localhost:8000'
take_picture = False

def on_ws_message(ws, message):
    global take_picture
    print('Got message!')
    if message == 'take_picture':
        take_picture = True

def connect_ws():
    global take_picture
    print('Connecting web socket...')
    uri = 'ws://' + SERVER_URL + '/command-stream'
    client = websocket.WebSocketApp(uri, on_message=on_ws_message)
    print('Web socket connected!')
    def run():
        client.run_forever()
    thread.start_new_thread(run, ())

def upload_image_data(image_data):
    uri = 'http://' + SERVER_URL + '/api/image-data'
    requests.post(uri, json=image_data)

def upload_image(img_path):
    uri = 'http://' + SERVER_URL + '/api/image'
    requests.post(uri, files={'image': open(img_path, 'rb')})

def camera_loop():
    global take_picture

    pygame.camera.init()

    print('Loading webcam...')
    camera = pygame.camera.Camera("/dev/video3", (640, 480))
    # Allow Webcam to warm up
    camera.start()

    print('Webcam loaded!')
    while True:
        frame = camera.get_image()

        # TODO integrate the frontent function that gives you this boolean
        if take_picture:
            print('Took picture!')
            pygame.image.save(frame, 'webcam.jpg')
            trees = vis.custom_vision_tree('webcam.jpg')
            upload_image('webcam.jpg')
            upload_image_data(trees)
            take_picture = False

            """
            # TODO postprocessing function
            planted_tree_map = SOME FUNCTION
            """

if __name__ == "__main__":
    connect_ws()
    camera_loop()
