import { Fragment, useEffect, useState } from 'react';

import { Link, useParams } from 'react-router-dom';

import { getStories, getStory, getTrueFalseQuestions } from '../api';

import { PageShell } from './PageShell';

const shuffle = (items) => [...items].sort(() => Math.random() - 0.5);

export const VocabularyTest = () => {
    const { storyId } = useParams();

    const [story, setStory] = useState(null);
    const [error, setError] = useState('');
    const [quiz, setQuiz] = useState(null);

    const [matches, setMatches] = useState({});
    const [draggedMeaning, setDraggedMeaning] = useState(null);

    const [fillAnswers, setFillAnswers] = useState({});
    const [draggedFillWord, setDraggedFillWord] = useState('');
    const [truthAnswers, setTruthAnswers] = useState({});
    const [feedback, setFeedback] = useState({});
    const [activeType, setActiveType] = useState('');

    useEffect(() => {
        const storyRequest = storyId
            ? getStory(storyId)
            : getStories().then((stories) => stories[0]);

        storyRequest
            .then((selectedStory) => selectedStory ? setStory(selectedStory) : setError('No stories are available for the test.'))
            .catch((reason) => setError(reason.message));
    }, [storyId]);

    useEffect(() => {
        if (!story?.words?.length) return;

        let cancelled = false;

        const prepareQuiz = async () => {
            const authoredQuestions = await getTrueFalseQuestions();
            if (cancelled) return;

            const words = story.words;
        const fillQuestions = words.map((fillWord) => {
            const escapedWord = fillWord.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const sentence = story.narrative.split(/[.!?]/).find((part) => new RegExp(`\\b${escapedWord}\\b`, 'i').test(part));
            return {
                word: fillWord.word,
                sentence: sentence ? sentence.trim().replace(new RegExp(`\\b${escapedWord}\\b`, 'i'), '_____') : `The story uses _____ to mean ${fillWord.meaning}.`,
            };
        });

            const storyWords = new Set(words.map((word) => word.word.toLowerCase()));
            const truthQuestions = authoredQuestions.sentences
                .filter((question) => storyWords.has(question.word.toLowerCase()))
                .map((question) => ({
                    word: question.word,
                    sentence: question.sentence,
                    isCorrect: question.answer.toLowerCase() === 'correct',
                }));

            setQuiz({
                words,
                meanings: shuffle(words.map((word) => word.meaning)),
                fillQuestions,
                truthQuestions,
            });

            setMatches({});
            setFillAnswers({});
            setTruthAnswers({});
            setFeedback({});
        };

        prepareQuiz().catch((reason) => setError(reason.message));
        return () => { cancelled = true; };
    }, [story]);

    if (error) {
        return (
            <PageShell>
                <main className="test-page">
                    <p className="error-message">{error}</p>
                </main>
            </PageShell>
        );
    }

    if (!story || !quiz) {
        return (
            <PageShell>
                <main className="test-page">
                    <p className="eyebrow">Preparing test...</p>
                </main>
            </PageShell>
        );
    }

    const submitMatch = () => {
        const correct = quiz.words.every(
            (word) => matches[word.word] === word.meaning
        );

        setFeedback((current) => ({
            ...current,
            match: correct
                ? 'Correct! Every word is matched to its meaning.'
                : 'Some matches are incorrect. Try again.',
        }));
    };

    const allFillAnswered = quiz.fillQuestions.every(
        (question) => Boolean(fillAnswers[question.word])
    );
    const availableFillWords = quiz.words
        .map((word) => word.word)
        .filter((word) => !Object.values(fillAnswers).includes(word));

    const dropFillWord = (questionWord) => {
        if (!draggedFillWord) return;

        setFillAnswers((current) => {
            const next = { ...current };
            const previousQuestion = Object.keys(next).find(
                (key) => next[key] === draggedFillWord
            );

            if (previousQuestion && previousQuestion !== questionWord) {
                next[previousQuestion] = next[questionWord] || '';
            }

            next[questionWord] = draggedFillWord;
            return next;
        });
        setDraggedFillWord('');
        setFeedback((current) => ({ ...current, fill: '' }));
    };

    const submitFill = () => {
        const correct = quiz.fillQuestions.every(
            (question) => fillAnswers[question.word] === question.word
        );

        setFeedback((current) => ({
            ...current,
            fill: correct
                ? 'Correct! Every blank is filled correctly.'
                : 'Some answers are incorrect. Try again.',
        }));
    };

    const submitTruth = () => {
        const correct = quiz.truthQuestions.every(
            (question) =>
                (truthAnswers[question.word] === 'true') === question.isCorrect
        );

        setFeedback((current) => ({
            ...current,
            truth: correct
                    ? 'Correct! Every True/False answer matches the story vocabulary.'
                    : 'Some answers are incorrect. Check the story vocabulary and try again.',
        }));
    };

    const allTruthAnswered = quiz.truthQuestions.every(
        (question) => Boolean(truthAnswers[question.word])
    );

    const allWordsMatched = quiz.words.every(
        (word) => Boolean(matches[word.word])
    );

    /*
     * The matching board is a two-column grid.
     * - Left column: fixed words.
     * - Right column: draggable meanings.
     *
     * Once a meaning is matched, it is assigned to the same grid row
     * as its word. Unmatched meanings fill the remaining rows, preserving
     * the shuffled list.
     */
    const matchedMeaningRows = new Map();

    quiz.words.forEach((word, index) => {
        if (matches[word.word]) {
            matchedMeaningRows.set(matches[word.word], index + 1);
        }
    });

    const availableRows = quiz.words
        .map((_, index) => index + 1)
        .filter(
            (row) =>
                ![...matchedMeaningRows.values()].includes(row)
        );

    let nextAvailableRow = 0;

    const meaningPlacement = quiz.meanings.map((meaning) => {
        const matchedRow = matchedMeaningRows.get(meaning);

        if (matchedRow) {
            return {
                meaning,
                row: matchedRow,
                matched: true,
            };
        }

        const row = availableRows[nextAvailableRow];
        nextAvailableRow += 1;

        return {
            meaning,
            row,
            matched: false,
        };
    });

    const dropMeaning = (targetWord) => {
        if (!draggedMeaning) return;

        setMatches((current) => {
            const next = { ...current };

            const sourceWord = Object.keys(next).find(
                (word) => next[word] === draggedMeaning
            );

            const targetMeaning = next[targetWord];

            /*
             * If the target already contains a meaning, swap the two
             * meanings instead of losing the existing match.
             */
            if (sourceWord && sourceWord !== targetWord) {
                next[sourceWord] = targetMeaning || '';
            }

            next[targetWord] = draggedMeaning;

            return next;
        });

        setDraggedMeaning(null);
        setFeedback((current) => ({ ...current, match: '' }));
    };

    return (
        <PageShell>
            <main className="test-page">
                <Link
                    className="back-link"
                    to={`/read/${story.id}`}
                >
                    <span aria-hidden="true">&#8592;</span> Back to story
                </Link>

                {!activeType && (
                    <section className="test-type-grid">
                        <button
                            type="button"
                            className="test-type-card"
                            onClick={() => setActiveType('match')}
                        >
                            <span className="test-type-number">01</span>
                            <strong>Match the following</strong>
                            <span>
                                Connect each word to its meaning
                            </span>
                        </button>

                        <button
                            type="button"
                            className="test-type-card"
                            onClick={() => setActiveType('fill')}
                        >
                            <span className="test-type-number">02</span>
                            <strong>Fill in the blanks</strong>
                            <span>
                                Choose the word that completes the sentence
                            </span>
                        </button>

                        <button
                            type="button"
                            className="test-type-card"
                            onClick={() => setActiveType('truth')}
                        >
                            <span className="test-type-number">03</span>
                            <strong>Is it correct?</strong>
                            <span>
                                Decide whether the statement is true or false
                            </span>
                        </button>
                    </section>
                )}

                {activeType === 'match' && (
                    <section className="question-card match-question-card">
                        <p className="question-progress">
                            Match the following
                        </p>

                        <h2>
                            Drag each meaning to its correct word.
                        </h2>

                        <div
                            className="matching-board"
                            style={{
                                "--match-count": quiz.words.length,
                            }}
                        >
                            {/* Fixed words — left column */}
                            <div className="matching-column matching-words">
                                {quiz.words.map((word, index) => {
                                    const isMatched =
                                        Boolean(matches[word.word]);

                                    return (
                                        <div
                                            className={`match-row ${
                                                isMatched
                                                    ? 'is-matched'
                                                    : ''
                                            }`}
                                            key={word.word}
                                            style={{
                                                gridRow: index + 1,
                                            }}
                                            onDragOver={(event) => {
                                                event.preventDefault();
                                                event.dataTransfer.dropEffect =
                                                    'move';
                                            }}
                                            onDrop={() =>
                                                dropMeaning(word.word)
                                            }
                                        >
                                            <div className="match-word">
                                                {word.word}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Shuffled meanings — right column */}
                            <div className="matching-column matching-meanings">
                                {meaningPlacement.map(
                                    ({
                                        meaning,
                                        row,
                                        matched,
                                    }) => (
                                        <div
                                            className={`match-meaning ${
                                                matched
                                                    ? 'meaning-matched'
                                                    : ''
                                            }`}
                                            draggable
                                            key={meaning}
                                            style={{
                                                gridRow: row,
                                            }}
                                            onDragStart={(event) => {
                                                setDraggedMeaning(meaning);
                                                event.dataTransfer.effectAllowed =
                                                    'move';
                                            }}
                                            onDragEnd={() =>
                                                setDraggedMeaning(null)
                                            }
                                        >
                                            {meaning}
                                        </div>
                                    )
                                )}
                            </div>
                        </div>

                        <div className="matching-submit">
                            <button
                                className="test-button"
                                type="button"
                                onClick={submitMatch}
                                disabled={!allWordsMatched}
                            >
                                Submit matching
                            </button>
                        </div>

                        {feedback.match && (
                            <p className="test-feedback">
                                {feedback.match}
                            </p>
                        )}
                    </section>
                )}

                {activeType === 'fill' && (
                    <section className="question-card fill-question-card">
                        <p className="question-progress">
                            Fill in the blanks
                        </p>

                        <h2>Drag each word into the correct blank.</h2>

                        <div className="fill-word-bank">
                            {availableFillWords.map((word) => (
                                <div
                                    className="fill-word-nudge"
                                    draggable
                                    key={word}
                                    onDragStart={() =>
                                        setDraggedFillWord(word)
                                    }
                                >
                                    {word}
                                </div>
                            ))}
                        </div>

                        <div className="fill-question-list">
                            {quiz.fillQuestions.map((question, index) => (
                                <div className="fill-question" key={question.word}>
                                    <span className="fill-question-number">
                                        {index + 1}
                                    </span>
                                    <p>
                                        {question.sentence
                                            .split('_____')
                                            .map((part, partIndex) => (
                                                <Fragment
                                                    key={`${question.word}-${partIndex}`}
                                                >
                                                    {part}
                                                    {partIndex === 0 && (
                                                        <span
                                                            className="fill-blank"
                                                            onDragOver={(event) =>
                                                                event.preventDefault()
                                                            }
                                                            onDrop={() =>
                                                                dropFillWord(question.word)
                                                            }
                                                        >
                                                            {fillAnswers[question.word]}
                                                        </span>
                                                    )}
                                                </Fragment>
                                            ))}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div className="matching-submit">
                            <button
                                className="test-button"
                                type="button"
                                onClick={submitFill}
                                disabled={!allFillAnswered}
                            >
                                Submit answers
                            </button>
                        </div>

                        {feedback.fill && (
                            <p className="test-feedback">
                                {feedback.fill}
                            </p>
                        )}
                    </section>
                )}

                {activeType === 'truth' && (
                    <section className="question-card truth-question-card">
                        <p className="question-progress">
                            Is it correct?
                        </p>

                        <div className="truth-question-list">
                            {quiz.truthQuestions.map((question, index) => (
                                <div className="truth-question" key={question.word}>
                                    <span className="fill-question-number">
                                        {index + 1}
                                    </span>
                                    <p>
                                        {question.sentence}
                                    </p>
                                    <div className="truth-options">
                                        {['true', 'false'].map((answer) => (
                                            <button
                                                className={
                                                    truthAnswers[question.word] === answer
                                                        ? 'answer selected'
                                                        : 'answer'
                                                }
                                                type="button"
                                                key={answer}
                                                onClick={() =>
                                                    setTruthAnswers((current) => ({
                                                        ...current,
                                                        [question.word]: answer,
                                                    }))
                                                }
                                            >
                                                {answer === 'true' ? 'True' : 'False'}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button
                            className="test-button truth-submit-button"
                            type="button"
                            onClick={submitTruth}
                            disabled={!allTruthAnswered}
                        >
                            Submit answer
                        </button>

                        {feedback.truth && (
                            <p className="test-feedback">
                                {feedback.truth}
                            </p>
                        )}
                    </section>
                )}
            </main>
        </PageShell>
    );
};
