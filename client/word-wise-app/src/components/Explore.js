import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getStories, voteForStory } from '../api';
import { PageShell } from './PageShell';

export const Explore = () => {
    const [stories, setStories] = useState([]);
    const [error, setError] = useState('');
    const [votingStoryId, setVotingStoryId] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getStories()
            .then(setStories)
            .catch((reason) => setError(reason.message))
            .finally(() => setLoading(false));
    }, []);

    return <PageShell>
        <main className="story-page">
            {error && <p className="error-message">{error}</p>}
            <div className="story-grid">
                {loading && Array.from({ length: 4 }, (_, index) => <div className="story-card story-card-skeleton" key={`story-skeleton-${index}`} aria-hidden="true"><span /><span /><span /></div>)}
                {stories.map((story) => {
                    const storyPath = `/read/${story.id}`;
                    const vote = async (event) => {
                        event.stopPropagation();
                        setVotingStoryId(story.id);
                        try {
                            const result = await voteForStory(story.id);
                            setStories((currentStories) => currentStories.map((currentStory) => currentStory.id === story.id ? { ...currentStory, votes: result.votes } : currentStory));
                        } catch (reason) {
                            setError(reason.message);
                        } finally {
                            setVotingStoryId('');
                        }
                    };

                    const openStory = () => { window.history.pushState({}, '', storyPath); window.dispatchEvent(new PopStateEvent('popstate')); };
                    const handleCardKeyDown = (event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            openStory();
                        }
                    };

                    return <article className="story-card" key={story.id} onClick={openStory} onKeyDown={handleCardKeyDown} role="link" tabIndex="0">
                    <div className="story-card-content">
                        <h2>{story.title}</h2>
                        <p className="story-description">{story.narrative?.slice(0, 220)}... <Link className="read-more" to={storyPath} onClick={(event) => event.stopPropagation()}>Read more</Link></p>
                        <div className="word-nudges" aria-label="Words used in this story">
                            {story.words?.map((word) => <span key={word.word}>{word.word}</span>)}
                        </div>
                    </div>
                    <div className="vote-control">
                        <button className="vote-button" type="button" onClick={vote} disabled={votingStoryId === story.id} aria-label={`Vote for ${story.title}`}>
                            {story.votes ?? Math.floor(Math.random() * 31) + 20} <span aria-hidden="true">↑</span>
                        </button>
                    </div>
                </article>;
                })}
            </div>
        </main>
    </PageShell>;
};