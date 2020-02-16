from azure.cognitiveservices.vision.customvision.prediction import CustomVisionPredictionClient

MINIMUM_CONFIDENCE = 0.05 # 5 percent confidence.

# Image dimensions should be in feet.
def custom_vision_tree(image_url="test_images/test1.jpg", imageWidth=120, imageHeight=90):
    # Now there is a trained endpoint that can be used to make a prediction
    prediction_key = "76809942034442f885008ba934ce7d46"
    ENDPOINT = "https://westus2.api.cognitive.microsoft.com"
    predictor = CustomVisionPredictionClient(prediction_key, endpoint=ENDPOINT)
    publish_iteration_name = "Iteration1"
    projectid = "9de0692a-7292-4998-a7e4-a14e053ce677"

    with open(image_url, "rb") as image_contents:
        results = predictor.detect_image(
            projectid, publish_iteration_name, image_contents.read())

    packed_predictions = []
    for prediction in results.predictions:
        if prediction.probability < MINIMUM_CONFIDENCE:
            continue
        bbox = prediction.bounding_box
        x = bbox.left + bbox.width / 2
        y = bbox.top + bbox.height / 2
        diameter = (bbox.width * imageWidth + bbox.height * imageHeight) / 2
        packed_predictions.append((x * imageWidth, y * imageHeight, diameter / 2))
    return packed_predictions
# custom_vision_tree()
