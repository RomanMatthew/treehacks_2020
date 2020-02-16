import time
import numpy as np
import cv2
import os
import custom_vision_tree as cvt
import asyncio
import websockets

global take_picture

async def ws_listener(websocket, path):
    async with websockets.connect("ws://10.19.188.153:8000") as websocket:
        while True:
            msg = await websocket.recv()
            take_picture = True if msg=="take_picture" else False
            print("Recieved command: ", take_picture)
        
            
    

def main():
    
    take_picture = False
    cwd = os.getcwd()

    cap = cv2.VideoCapture(0)

    try:
            time.sleep(2.0)

            # loop detection
            # GET INPUT FROM THE USER HAHA
            while True:
                ret, frame = cap.read()
                
                # TODO integrate the frontent function that gives you this boolean
                if (take_picture):
                    ret, full_image = cap.read()
                    image_name = str(full_image)+".jpg"
                    cv2.imwrite(image_name, full_image)
                    img_path = cwd+"/"+image_name
                    
                    prediction = cvt.retrieve_predictions(img_path)
                    
                    """
                    # TODO postprocessing function
                    planted_tree_map = SOME FUNCTION
                    cv2.imshow('Optimal tree planting', planted_tree_map)
                    cv2.waitKey(0)
                    cv2.destroyAllWindows()
                    """
                    take_picture = False
                    
                gray = cv2.cvtColor(np.float32(frame), cv2.COLOR_BGR2GRAY)
                
                cv2.imshow('frame',gray)
                
                if cv2.waitKey(1) & 0xFF == ord('q'):
                    break

    finally:
        cap.release()
        cv2.destroyAllWindows()
        print("Program Ending")


if __name__ == "__main__":
    main()
