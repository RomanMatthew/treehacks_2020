"""
Created on Sat Feb 15 21:46:10 2020
Matthew Roman
treehacks_2020
@author: matthew

Image processing meant to send images to microsoft prediction software
and retrieve an image of predicted shapes
"""
from azure.cognitiveservices.vision.customvision.prediction import CustomVisionPredictionClient
import os
import cv2
#import tree_classifier


def retrieve_predictions(image):
    
    cwd = os.getcwd()
    
    full_filepath = cwd+"/"+image+".jpg"
    filewrite = cv2.imwrite(full_filepath, image)
    
    # TODO send to amal's prediction software, return the image
    """
    
    
    

