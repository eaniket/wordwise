import { WordWiseHome } from "./homepage/WordWiseHome";
import { WordWiseNav } from "./navbar/WordWiseNav";

export const Dashboard = () => {
    return(
        <div className="container wordwise-dashboard">
            <WordWiseNav/>
            <WordWiseHome/>
        </div>
    )
}