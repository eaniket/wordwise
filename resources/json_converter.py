# Python program to convert text
# file to JSON


import json


# the file to be converted to 
# json format
filename = 'wordwise_draft.txt'

# dictionary where the lines from
# text will be stored
stories = []
# creating dictionary
with open(filename) as fh:
	data = fh.read().strip()
	chapters = data.split("Chapter")
	for chapter in chapters:
		story = {}
		story_parts = chapter.strip().split("`")
		if (len(story_parts) >= 3):
			escapes = "".join([chr(char) for char in range(1, 32)])
			title = story_parts[1].translate(str.maketrans("", "", escapes)).replace("\u201c", "").replace("\u201d", "").strip().strip("\"")
			narrative = story_parts[2].strip()
			words = []
			word_data_list = story_parts[4].strip().split("\n")
			for word_data in word_data_list:
				word_object = {}

				word_data = word_data.replace("(", ":", 1).replace(")", ":", 1).split(":")
				word = word_data[0].strip()
				type_of_word = word_data[1].strip()
				meaning = word_data[3].strip()

				word_object["word"] = word
				word_object["type"] = type_of_word
				word_object["meaning"] = meaning

				words.append(word_object)

			story["title"] = title
			story["narrative"] = narrative
			story["words"] = words

			stories.append(story)

# creating json file
# the JSON file is named as parsedData
out_file = open("parsedData.json", "w")
json.dump(stories, out_file, indent = 4, sort_keys = False)
out_file.close()
