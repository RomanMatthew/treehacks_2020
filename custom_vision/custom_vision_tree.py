from azure.cognitiveservices.vision.customvision.prediction import CustomVisionPredictionClient

def custom_vision_tree(image_url = "test3.jpg"):
	# Now there is a trained endpoint that can be used to make a prediction
	prediction_key = "76809942034442f885008ba934ce7d46"
	ENDPOINT = "https://westus2.api.cognitive.microsoft.com"
	predictor = CustomVisionPredictionClient(prediction_key, endpoint=ENDPOINT)
	publish_iteration_name = "Iteration1"
	projectid = "9de0692a-7292-4998-a7e4-a14e053ce677"

	with open(image_url, "rb") as image_contents:
	    results = predictor.detect_image(
	        projectid, publish_iteration_name, image_contents.read())

	# Display the results.   
	print(results) 
	for prediction in results.predictions:
	    print("\t" + prediction.tag_name + ": {0:.2f}% bbox.left = {1:.2f}, bbox.top = {2:.2f}, bbox.width = {3:.2f}, bbox.height = {4:.2f}".format(prediction.probability * 100, prediction.bounding_box.left, prediction.bounding_box.top, prediction.bounding_box.width, prediction.bounding_box.height))
	return results
# custom_vision_tree()