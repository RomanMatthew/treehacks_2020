from azure.cognitiveservices.vision.customvision.prediction import CustomVisionPredictionClient
from azure.cognitiveservices.vision.customvision.prediction.models import Prediction
import numpy
import sys
from custom_vision_tree import custom_vision_tree
numpy.set_printoptions(threshold=sys.maxsize)
# Given a prediction result (azure.cognitiveservices.vision.customvision.prediction.models.Prediction)
# In the result, we have a 100 * 100 grid from 0.00 to 1

TREE_RAY = numpy.zeros((100, 100)) 	# Create 100 * 100 2D array 

# Fill 2D array with existing trees 
def create_grid(results):
	for prediction in results.predictions:
		top = int(prediction.bounding_box.top * 100)
		left = int(prediction.bounding_box.left * 100)
		height = int(prediction.bounding_box.height* 100) 
		width = int(prediction.bounding_box.width * 100)
		for r in range(top, height + top):
			for c in range(left, width + left):
				TREE_RAY[r][c] = 1

# Detect if a tree already exists at an index
def collision(top, left, width, height):
	if (top + height >= 100 or left + width >= 100):
		return True
	for r in range(top, top + height):
		for c in range(left, left + width):
			if (TREE_RAY[r][c] == 1 or TREE_RAY[r][c] == 2):
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
				TREE_RAY[r][c] = 2

# Main function to plant new trees 
def plant_trees(results, max_width, max_height): 
	create_grid(results)
	new_trees = loop_through(max_width, max_height)

# plant_trees(custom_vision_tree(), 15, 15)
