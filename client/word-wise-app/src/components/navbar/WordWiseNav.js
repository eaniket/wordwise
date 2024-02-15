import wordWiseNavLogo from './Word-Logo.png';

export const WordWiseNav = () => {
    return(
        <div className="wordwise-nav">
            <nav class="navbar navbar-expand-lg">
                <div class="container-fluid">
                    <a class="navbar-brand" href="#"><img src={wordWiseNavLogo}></img> ordWise</a>
                    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                    </button>
                    <div class="collapse navbar-collapse" id="navbarNav">
                    <ul class="navbar-nav">
                        <li class="nav-item">
                        <a class="nav-link active" aria-current="page" href="#">Home</a>
                        </li>
                        <li class="nav-item">
                        <a class="nav-link" href="#">Explore</a>
                        </li>
                        <li class="nav-item">
                        <a class="nav-link" href="#">Feedback</a>
                        </li>
                    </ul>
                    </div>
                </div>
            </nav>
        </div>
    )
}