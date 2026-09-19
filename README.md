# WordWise

WordWise is a vocabulary learning app that presents vocabulary in short stories and supports timed reading practice. The repository currently contains a working Flask/Jinja application and a separate React dashboard prototype.

## Current application

The root Flask app is the integrated product surface:

- Homepage: `/homepage`
- Story reader: `/read?doc_id=<story-id>`
- All stories: `/alldocs`
- Health check: `/`
- Firestore JSON API: `/add`, `/batchAdd`, `/list`, `/update`, `/delete`, `/batchDelete`
- Voting/subscription endpoints: `/pollvote`, `/upvote`, `/addSubscriber`

The app reads stories, subscriber records, and the shared upvote count from Firestore. Story records contain a title, narrative, narrative word count, and vocabulary entries with a word, part of speech, and meaning.

## Important security notice

The current checkout contains `config/firebaseKey.json`, including a Firebase service-account private key, and the file is tracked by Git. Treat that credential as compromised: revoke/rotate it before using the project, remove the file from version control, and configure credentials through the deployment environment. Do not commit replacement credentials.

## Prerequisites

- Python 3.11 or a compatible Python 3 version
- Node.js and npm for the React prototype
- A Firebase project with Firestore enabled
- Server-side Firebase credentials supplied securely at runtime

## Run the Flask application

From the repository root:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python app.py
```

The server listens on `http://localhost:8080` by default. Set `PORT` to use another port. The current code expects Firebase credentials at `config/firebaseKey.json`, so credential configuration must be resolved before startup or the initialization will fail.

## Run the React prototype

The React project is independent of the Flask process:

```bash
cd client/word-wise-app
npm install
npm start
```

Available scripts:

```bash
npm start       # development server
npm run build   # production build
npm test        # test runner
```

The React prototype currently renders a dashboard, navigation, and homepage shell. It does not fetch stories from Flask or Firestore, and its `/explore` and `/feedback` navigation links do not yet have registered routes.

## Story data

`resources/json_converter.py` converts the backtick-delimited draft in `resources/wordwise_draft.txt` into `resources/parsedData.json`:

```bash
cd resources
python json_converter.py
```

The generated records can be loaded into Firestore through `/batchAdd` using a JSON request body. The server adds a generated `id` to each inserted story.

## Validation

Backend syntax check:

```bash
python -m py_compile app.py resources/json_converter.py
```

React checks:

```bash
cd client/word-wise-app
npm run build
CI=true npm test -- --watchAll=false
```

At the time of this documentation pass, Python compilation and the React production build succeed. The React build reports a missing `alt` prop on the homepage image. The test command cannot start in the current checkout because the installed `node_modules` does not contain the declared `react-router-dom` dependency; run `npm install` before investigating test behavior.

## Repository map

```text
app.py                         Flask routes and Firestore integration
templates/                     Server-rendered homepage, story list, and reader
static/                        Legacy UI styles, scripts, and image assets
resources/                     Story source text, generated JSON, and converter
client/word-wise-app/          Independent Create React App prototype
config/                        Local Firebase configuration location
requirements.txt               Python dependencies
```

See [research.md](research.md) for the detailed architecture, data flow, validation results, risks, and open design questions.
