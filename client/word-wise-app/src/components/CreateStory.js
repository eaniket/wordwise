import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createStory } from '../api';
import { PageShell } from './PageShell';

export const CreateStory = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({ title: '', narrative: '' });
    const [error, setError] = useState('');
    const update = (event) => setForm({ ...form, [event.target.name]: event.target.value });
    const submit = async (event) => {
        event.preventDefault();
        setError('');
        try {
            const story = await createStory({ ...form, narrative_word_count: form.narrative.trim().split(/\s+/).filter(Boolean).length, words: [] });
            navigate(`/read/${story.id}`);
        } catch (reason) {
            setError(reason.message);
        }
    };

    return <PageShell><main className="create-page">
        <Link className="back-link" to="/explore">Back to stories</Link>
        <p className="eyebrow">Build your reading practice</p><h1>Create a story</h1>
        <form onSubmit={submit} className="story-form">
            <label>Title<input required name="title" value={form.title} onChange={update} /></label>
            <label>Story<textarea required name="narrative" rows="12" value={form.narrative} onChange={update} /></label>
            {error && <p className="error-message">{error}</p>}
            <button type="submit">Save story</button>
        </form>
    </main></PageShell>;
};