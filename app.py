# app.py

# Required Imports
import os
import json
import random
from uuid import uuid4
from flask import Flask, request, jsonify, render_template, redirect
from firebase_admin import credentials, firestore, initialize_app

# Initialize Flask App
app = Flask(__name__)


@app.after_request
def add_cors_headers(response):
    """Allow the React client to call the deployed Flask API."""
    origin = request.headers.get('Origin', '')
    if origin == 'http://localhost:3000' or origin.endswith('.vercel.app'):
        response.headers['Access-Control-Allow-Origin'] = origin
        response.headers['Vary'] = 'Origin'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
    return response

# Initialize Firestore DB
cred = credentials.Certificate('config/firebaseKey.json')
default_app = initialize_app(cred)
db = firestore.client()
subscribers_ref = db.collection('subscribers')
story_ref = db.collection('stories')
commons_ref = db.collection('commons')
upvote_doc = commons_ref.document('upvote')
LOCAL_STORIES_PATH = os.path.join(os.path.dirname(__file__), 'resources', 'localStories.json')


def _read_local_stories():
    stories = []
    changed = False
    if os.path.exists(LOCAL_STORIES_PATH):
        with open(LOCAL_STORIES_PATH, 'r', encoding='utf-8') as local_file:
            stories = json.load(local_file)

    with open(os.path.join(os.path.dirname(__file__), 'resources', 'parsedData.json'), 'r', encoding='utf-8') as source_file:
        source_stories = json.load(source_file)

    existing_ids = {story.get('id') for story in stories}
    for index, story in enumerate(source_stories, start=1):
        story = dict(story)
        story['id'] = story.get('id') or f'local-{index}'
        if story['id'] not in existing_ids:
            stories.append(story)
            changed = True

    for story in stories:
        if story.get('votes', 0) <= 0:
            story['votes'] = random.randint(20, 50)
            changed = True
    if changed:
        _write_local_stories(stories)
    return sorted(stories, key=lambda story: story.get('votes', 0), reverse=True)


def _write_local_stories(stories):
    with open(LOCAL_STORIES_PATH, 'w', encoding='utf-8') as local_file:
        json.dump(stories, local_file, indent=2)


@app.route('/add', methods=['POST'])
def create():
    """
        create() : Add document to Firestore collection with request body
        Ensure you pass a custom ID as part of json body in post request
        e.g. json={'id': '1', 'title': 'Write a blog post'}
    """
    try:
        story_id = story_ref.document().id
        story = request.get_json(silent=True) or {}
        story["id"] = story_id
        story_ref.document(story_id).set(story)
        return jsonify(story), 201
    except Exception as e:
        story = request.get_json(silent=True) or {}
        story['id'] = f'local-{uuid4().hex[:12]}'
        stories = _read_local_stories()
        stories.append(story)
        _write_local_stories(stories)
        return jsonify(story), 201


@app.route('/batchAdd', methods=['POST'])
def create_batch():
    """
        create_batch() : Add a list of document to Firestore collection with request body
    """
    try:
        for story in request.json:
            story_id = story_ref.document().id
            story["id"] = story_id
            story_ref.document(story_id).set(story)
        return jsonify({"success": True}), 200
    except Exception as e:
        return f"An Error Occured: {e}"


@app.route('/list', methods=['GET'])
def read():
    """
        read() : Fetches documents from Firestore collection as JSON
        story : Return document that matches query ID
        all_stories : Return all documents
    """
    try:
        # Check if ID was passed to URL query
        story_id = request.args.get('id')    
        if story_id:
            story = story_ref.document(story_id).get()
            story_data = story.to_dict()
            if 'votes' not in story_data:
                story_data['votes'] = random.randint(20, 50)
                story_ref.document(story_id).set({'votes': story_data['votes']}, merge=True)
            return jsonify(story_data), 200
        else:
            all_stories = []
            for doc in story_ref.stream():
                story_data = doc.to_dict()
                if story_data.get('votes', 0) <= 0:
                    story_data['votes'] = random.randint(20, 50)
                    story_ref.document(doc.id).set({'votes': story_data['votes']}, merge=True)
                all_stories.append(story_data)
            return jsonify(sorted(all_stories, key=lambda story: story.get('votes', 0), reverse=True)), 200
    except Exception as e:
        stories = _read_local_stories()
        story_id = request.args.get('id')
        if story_id:
            story = next((item for item in stories if item.get('id') == story_id), None)
            if story is None:
                return jsonify({'error': 'Story not found'}), 404
            return jsonify(story), 200
        return jsonify(stories), 200


@app.route('/true-false', methods=['GET'])
def true_false_questions():
    """Return the authored True/False vocabulary questions."""
    questions_path = os.path.join(os.path.dirname(__file__), 'resources', 'true_false.json')
    try:
        with open(questions_path, 'r', encoding='utf-8') as questions_file:
            return jsonify(json.load(questions_file)), 200
    except (OSError, json.JSONDecodeError) as error:
        return jsonify({'error': f'Unable to load True/False questions: {error}'}), 500


@app.route('/vote', methods=['POST'])
def vote_story():
    """Increment and return the vote count for one story."""
    story_id = request.args.get('id')
    if not story_id:
        return jsonify({'error': 'Story id is required'}), 400

    try:
        story_document = story_ref.document(story_id)
        story_snapshot = story_document.get()
        if not story_snapshot.exists:
            return jsonify({'error': 'Story not found'}), 404
        story_document.update({'votes': firestore.Increment(1)})
        updated_story = story_document.get().to_dict()
        return jsonify({'votes': updated_story.get('votes', 1)}), 200
    except Exception:
        stories = _read_local_stories()
        story = next((item for item in stories if item.get('id') == story_id), None)
        if story is None:
            return jsonify({'error': 'Story not found'}), 404
        story['votes'] = story.get('votes', 0) + 1
        _write_local_stories(stories)
        return jsonify({'votes': story['votes']}), 200


@app.route('/update', methods=['POST', 'PUT'])
def update():
    """
        update() : Update document in Firestore collection with request body
        Ensure you pass a custom ID as part of json body in post request
        e.g. json={'id': '1', 'title': 'Write a blog post today'}
    """
    try:
        id = request.json['id']
        story_ref.document(id).update(request.json)
        return jsonify({"success": True}), 200
    except Exception as e:
        return f"An Error Occured: {e}"


@app.route('/delete', methods=['GET', 'DELETE'])
def delete():
    """
        delete() : Delete a document from Firestore collection
    """
    try:
        # Check for ID in URL query
        story_id = request.args.get('id')
        story_ref.document(story_id).delete()
        return jsonify({"success": True}), 200
    except Exception as e:
        return f"An Error Occured: {e}"


@app.route('/batchDelete', methods=['GET'])
def delete_batch():
    """
        delete_batch() : Delete a list of document to Firestore collection
    """
    try:
        for doc in story_ref.stream():
            story_ref.document(doc.to_dict()["id"]).delete()
        return jsonify({"success": True}), 200
    except Exception as e:
        return f"An Error Occured: {e}"


@app.route('/', methods=['GET'])
def root():
    """
        root() : Test to check server is up
    """
    return "Congratulations! You've reached the Wordwise server"


@app.route('/pollvote', methods=['GET'])
def pollvote():
    """
        pollvote() : Poll existing upvote count from database
    """
    try:
        upvote_count = upvote_doc.get()
        return jsonify(upvote_count.to_dict()), 200
    except Exception as e:
        return f"An Error Occured: {e}"


@app.route('/upvote', methods=['GET'])
def upvote():
    """
        upvote() : Increase upvote count of the website on database
        Return updated upvote count from database
    """
    try:
        existing_vote = upvote_doc.get().to_dict()
        new_vote = existing_vote["upvote_count"] + 1
        new_upvote = {"upvote_count": new_vote}
        upvote_doc.update(new_upvote)
        return jsonify({"success": True}), 200
    except Exception as e:
        return f"An Error Occured: {e}"


@app.route('/addSubscriber', methods=['POST'])
def add_subscriber():
    """
        add_subscriber() : Add subscriber to Firestore collection with request body
        json = { 'name': 'John Doe', 'email': 'john.doe@xmail.com'}
    """
    try:
        subscribers_ref.document(request.json["email"]).set(request.json)
        return jsonify({"success": True}), 200
    except Exception as e:
        return f"An Error Occured: {e}"


@app.route('/homepage')
def start():
    """
        start() : Navigate to homepage
    """
    try:
        # Check if ID was passed to URL query
        all_stories = [doc.to_dict() for doc in story_ref.stream()]
        upvote_count = upvote_doc.get()
        return render_template('main.html', docs = all_stories, upvote = upvote_count.to_dict())
    except Exception as e:
        return "Error! Please try again later!"


@app.route('/read')
def read_page():
    """
        read_page() : Navigate to read single story page
    """
    doc_id = request.args.get("doc_id")
    story = story_ref.document(doc_id).get()
    story = story.to_dict()
    return render_template('read.html', doc_data = story)


@app.route('/alldocs')
def load_docs():
    """
        load_docs() : Navigate to show all stories page
    """
    all_stories = [doc.to_dict() for doc in story_ref.stream()]
    final_docs = jsonify(all_stories)
    return render_template('alldocs.html', all_docs = all_stories)

    
port = int(os.environ.get('PORT', 8080))

if __name__ == '__main__':
    app.run(threaded=True, host='0.0.0.0', port=port)