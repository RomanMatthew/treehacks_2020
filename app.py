#!/usry/bin/env python

import time
import edgeiq
#import tree_classifier as tc
import asyncio
import websockets

take_picture = False

async def ws_listener(websocket, path):
    uri = "whoop" #TODO, DEFINE WHAT THE URI IS
    async with websockets.connect("ws://10.19.188.153:8000") as websocket:
        while True:
            msg = await websocket.recv()
            take_picture = True if msg=="take_picture" else False
            print("Recieved command: ", take_picture)
        
            
    

def main():
    semantic_segmentation = edgeiq.SemanticSegmentation("alwaysai/enet")
    semantic_segmentation.load(engine=edgeiq.Engine.DNN_CUDA)

    print("Loaded model:\n{}\n".format(semantic_segmentation.model_id))
    print("Engine: {}".format(semantic_segmentation.engine))
    print("Accelerator: {}\n".format(semantic_segmentation.accelerator))
    print("Labels:\n{}\n".format(semantic_segmentation.labels))

    fps = edgeiq.FPS()

    try:
        with edgeiq.WebcamVideoStream(cam=0) as video_stream, \
                edgeiq.Streamer() as streamer:
            # Allow Webcam to warm up
            time.sleep(2.0)
            fps.start()

            # loop detection
            # GET INPUT FROM THE USER HAHA
            while True:
                frame = video_stream.read()
                results = semantic_segmentation.segment_image(frame)
                
                # TODO integrate the frontent function that gives you this boolean
                if (take_picture):
                    saved_frame, full_image = video_stream.read()
                    
                    prediction = tc.retrieve_predictions(full_image)
                    
                    """
                    # TODO postprocessing function
                    planted_tree_map = SOME FUNCTION
                    """

                # Generate text to display on streamer
                text = ["Model: {}".format(semantic_segmentation.model_id)]
                text.append("Inference time: {:1.3f} s".format(results.duration))
                text.append("Legend:")
                text.append(semantic_segmentation.build_legend())

                streamer.send_data(frame, text)
                

                fps.update()

                if streamer.check_exit():
                    break

    finally:
        fps.stop()
        print("elapsed time: {:.2f}".format(fps.get_elapsed_seconds()))
        print("approx. FPS: {:.2f}".format(fps.compute_fps()))

        print("Program Ending")


if __name__ == "__main__":
    main()
