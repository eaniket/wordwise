import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getStory } from '../api';
import { PageShell } from './PageShell';
import thumbnail from './thumbnail.png';
import thumbnailMeaning from './thumbnail_meaning.png';

export const Reader = () => {
    const { storyId } = useParams();
    const [story, setStory] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        getStory(storyId).then(setStory).catch((reason) => setError(reason.message));
    }, [storyId]);

    const renderParagraph = (paragraph) => {
        if (!story?.words?.length) return paragraph;
        const wordMap = new Map(story.words.map((word) => [word.word.toLowerCase(), word]));
        const vocabularyPattern = story.words
            .map((word) => word.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
            .sort((first, second) => second.length - first.length)
            .join('|');
        const parts = paragraph.split(new RegExp(`\\b(${vocabularyPattern})\\b`, 'gi'));

        return parts.map((part, index) => {
            const word = wordMap.get(part.toLowerCase());
            if (!word) return <span key={`${part}-${index}`}>{part}</span>;
            return <span className="vocabulary-term" tabIndex="0" key={`${part}-${index}`} data-meaning={word.meaning}>{part}</span>;
        });
    };

    return <PageShell><main className="reader-page">
        <Link className="back-link" to="/explore">Back to stories</Link>
        {error && <p className="error-message">{error}</p>}
        {story && <>
            <h1 className="reader-title">{story.title}</h1>
            <div className="reader-hero">
                <div className="reader-thumbnail"><img src={thumbnail} alt="Story thumbnail" /></div>
                <div className="reader-intro">
                    <article className="narrative">{story.narrative.split('\n').map((paragraph, index) => <p key={`${paragraph}-${index}`}>{renderParagraph(paragraph)}</p>)}</article>
                </div>
            </div>
            <section className="vocabulary">
                <div className="section-heading"><p className="eyebrow">Vocabulary</p></div>
                <div className="vocabulary-layout">
                    <div className="vocabulary-list">{story.words?.map((word) => <div className="word" key={word.word}><strong>{word.word}</strong><span>{word.type}</span><p>{word.meaning}</p></div>)}</div>
                    <div className="vocabulary-image"><img src={thumbnailMeaning} alt="Vocabulary learning illustration" /></div>
                </div>
                <Link className="test-button vocabulary-test-button" to={`/test/${story.id}`}>Test your knowledge</Link>
            </section>
        </>}
    </main></PageShell>;
};