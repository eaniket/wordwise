import mainLogo from './WordWiseLogo.png';
import { Link } from 'react-router-dom';

export const WordWiseHome = () => {
    return(
        <div className="row">
            <div className="col">
                <div className="header">
                    <s>Cram</s> Enjoy learning new words
                </div>
                <div className="sub-header">
                    Take the friction out of mugging up words by using your 
                    <strong> brain-friendly</strong> guide <strong>WordWise</strong>. 
                    Learn words via engaging stories along with <strong>timed-practice </strong> 
                    for reading comprehension.
                </div>
                <div className="action-btn">
                    <Link className="explore" to="/explore">Explore stories</Link>
                    <Link className="create" to="/test">Test your knowledge</Link>
                </div>
            </div>
            <div className="col">
                <div className="dashboard-img"><img src={mainLogo} alt="WordWise vocabulary learning" /></div>
            </div>
        </div>
    )
}