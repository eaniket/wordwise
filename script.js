document.addEventListener('DOMContentLoaded', () => {
  const mainContent = document.getElementById('main-content');
  const exploreButton = document.getElementById('explore-button');
  const exploreContent = document.getElementById('explore-content');

  // exploreButton.addEventListener('click', () => {
  //   exploreContent.classList.add('active');
  //   mainContent.classList.add('inactive');
  //   setTimeout(() => {
  //     document.body.style.overflow = 'hidden';
  //     addContentDiv();
  //   }, 500); // Adjust the timeout to match the transition duration
  // });

  // If you want to go back to the main content
  // you can add another button and reverse the process:
  // const backButton = document.querySelector('.back-button');
  // backButton.addEventListener('click', () => {
  //   exploreContent.classList.remove('active');
  //   mainContent.classList.remove('inactive');
  //   document.body.style.overflow = 'auto';
  // });
});

function addContentDiv() {    
  var exploreContentDiv=document.getElementById('explore-content');
  var mainContentDiv = document.getElementById('main-content');
  document.remove(mainContentDiv);
  document.getElementById('body').appendChild(contentDiv);
}
