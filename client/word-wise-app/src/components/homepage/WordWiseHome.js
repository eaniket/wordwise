import mainLogo from './WordWiseLogo.png';

export const WordWiseHome = () => {
    return(
        <div className="row">
            <div className="col">
                <div className="header">
                    <s>Cram</s> Enjoy the GRE vocab
                </div>
                <div className="sub-header">
                    Take the friction out of mugging up GRE words by using your <strong>brain-friendly</strong> guide <strong>WordWise</strong>. Learn words via engaging stories along with <strong>timed-practice</strong> for reading comprehension.
                </div>
                <div className="action-btn">
                    <button className="explore">Explore</button>
                    <button className="create"><i class="fa-solid fa-play"></i> Create</button>
                </div>
            </div>
            <div className="col">
                <div className="dashboard-img"><img src={mainLogo}></img></div>
            </div>
        </div>
    )
}