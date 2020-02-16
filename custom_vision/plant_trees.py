from azure.cognitiveservices.vision.customvision.prediction import CustomVisionPredictionClient
from azure.cognitiveservices.vision.customvision.prediction.models import Prediction
import numpy
import sys
from custom_vision_tree import custom_vision_tree
from PIL import Image

numpy.set_printoptions(threshold=sys.maxsize)
# Given a prediction result (azure.cognitiveservices.vision.customvision.prediction.models.Prediction)
# In the result, we have a 100 * 100 grid from 0.00 to 1

TREE_RAY = numpy.zeros((100, 100))  # Create 100 * 100 2D array 
PREDICTION_CONFIDENCE = 45
BUFFER = .1
MAX_WIDTH = 0
MAX_HEIGHT = 0

# 0 = no tree, 1 = already existing tree, 2 = newly planted tree, 3 = boundary of newly planted tree
# Fill 2D array with existing trees 
def create_grid(results):
    for prediction in results.predictions:
        global MAX_HEIGHT
        global MAX_WIDTH
        if (prediction.probability * 100 >= PREDICTION_CONFIDENCE):
            
            top = int(prediction.bounding_box.top * 100)
            left = int(prediction.bounding_box.left * 100)
            height = int(prediction.bounding_box.height* 100) 
            width = int(prediction.bounding_box.width * 100)

            if (height > MAX_HEIGHT and prediction.tag_name == "tree"):
                MAX_HEIGHT = height
            if (width > MAX_WIDTH and prediction.tag_name == "tree"):
                MAX_WIDTH = width

            for r in range(top, height + top):
                for c in range(left, width + left):
                    TREE_RAY[r][c] = 1

    # Increase max width and max height if necessary 
    MAX_WIDTH = int(MAX_WIDTH + (MAX_WIDTH * BUFFER))
    MAX_HEIGHT = int(MAX_HEIGHT + (MAX_HEIGHT * BUFFER))

# Detect if a tree already exists at an index
def collision(top, left, width, height):
    if (top + height >= 100 or left + width >= 100):
        return True
    for r in range(top, top + height):
        for c in range(left, left + width):
            if (TREE_RAY[r][c] == 1 or TREE_RAY[r][c] == 2 or TREE_RAY[r][c] == 3):
                return True
    return False

# Find where new trees can be planted 
def loop_through(max_width, max_height):
    new_trees = []
    for r in range (100):
        for c in range(100):
            if (TREE_RAY[r][c] == 0):
                if (not collision(r, c, max_width, max_height)):
                    add_new_tree(r, c, max_width, max_height)
                    new_trees.append((r,c))
    return new_trees

# Label indices of new tree
def add_new_tree(top, left, max_width, max_height):
        for r in range (top, max_height + top):
            for c in range (left, max_width + left):
                if (r == top or r == max_height + top - 1 or c == left or c == max_width + left - 1):
                    TREE_RAY[r][c] = 3
                else:
                    TREE_RAY[r][c] = 2
# Main function to plant new trees 
def plant_trees(results): 
    create_grid(results)
    new_trees = loop_through(MAX_WIDTH, MAX_HEIGHT)
    color_grid()
    return new_trees

def color_grid():

    # PIL accesses images in Cartesian co-ordinates, so it is Image[columns, rows]
    img = Image.new('RGB', (100,100), "black") # create a new black image
    pixels = img.load() # create the pixel map

    for i in range(img.size[0]):    # for every col:
        for j in range(img.size[1]):    # For every row
            if (TREE_RAY[i][j] == 0):
                pixels[i,j] = (0, 0, 0)
            elif (TREE_RAY[i][j] == 1):
                pixels[i,j] = (0, 255, 0)
            elif (TREE_RAY[i][j] == 2):
                pixels[i,j] = (0, 0, 255)
            else:
                pixels[i,j] = (255, 255, 255)

    img.show()

plant_trees(custom_vision_tree())
