import { WordWiseNav } from './navbar/WordWiseNav';

export const PageShell = ({ children }) => (
    <div className="container wordwise-dashboard">
        <WordWiseNav />
        {children}
    </div>
);