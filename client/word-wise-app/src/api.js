const API_BASE_URL = process.env.REACT_APP_API_URL || (
    process.env.NODE_ENV === 'production'
        ? 'https://wordwise-ivory.vercel.app'
        : ''
);

const request = async (path, options = {}) => {
    const response = await fetch(`${API_BASE_URL}${path}`, {
        headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
        ...options,
    });

    if (!response.ok) {
        const message = await response.text();
        throw new Error(message || 'The WordWise service is unavailable.');
    }
    return response.json();
};

let storiesCache = null;
let storiesRequest = null;

export const getStories = () => {
    if (storiesCache) return Promise.resolve(storiesCache);
    if (!storiesRequest) {
        storiesRequest = request('/list')
            .then((stories) => {
                storiesCache = stories;
                return stories;
            })
            .finally(() => {
                storiesRequest = null;
            });
    }
    return storiesRequest;
};
export const getStory = (storyId) => request(`/list?id=${encodeURIComponent(storyId)}`);
export const getTrueFalseQuestions = () => request('/true-false').catch(() => request('/true_false.json'));
export const voteForStory = (storyId) => request(`/vote?id=${encodeURIComponent(storyId)}`, {
    method: 'POST',
});
export const createStory = (story) => request('/add', {
    method: 'POST',
    body: JSON.stringify(story),
});