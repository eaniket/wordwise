# app.py

# Required Imports
import os
from flask import Flask, request, jsonify, render_template, redirect
from firebase_admin import credentials, firestore, initialize_app

# Initialize Flask App
app = Flask(__name__)

# Initialize Firestore DB
cred = credentials.Certificate('config/firebaseKey.json')
default_app = initialize_app(cred)
db = firestore.client()
subscribers_ref = db.collection('subscribers')
story_ref = db.collection('stories')
commons_ref = db.collection('commons')
upvote_doc = commons_ref.document('upvote')


@app.route('/add', methods=['POST'])
def create():
    """
        create() : Add document to Firestore collection with request body
        Ensure you pass a custom ID as part of json body in post request
        e.g. json={'id': '1', 'title': 'Write a blog post'}
    """
    try:
        story_id = story_ref.document().id
        request.json["id"] = story_id
        story_ref.document(story_id).set(request.json)
        return jsonify({"success": True}), 200
    except Exception as e:
        return f"An Error Occured: {e}"


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
            return jsonify(story.to_dict()), 200
        else:
            all_stories = [doc.to_dict() for doc in story_ref.stream()]
            return jsonify(all_stories), 200
    except Exception as e:
        return f"An Error Occured: {e}"


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