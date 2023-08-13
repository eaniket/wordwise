document.addEventListener('DOMContentLoaded', () => {
  const exploreButton = document.getElementById('explore-button');
  const exploreContent = document.getElementById('explore-content');

  exploreButton.addEventListener('click', () => {
    exploreContent.classList.add('active');
    setTimeout(() => {
      document.body.style.overflow = 'hidden';
    }, 500); // Adjust the timeout to match the transition duration
  });

  // If you want to go back to the main content
  // you can add another button and reverse the process:
  const backButton = document.querySelector('.back-button');
  backButton.addEventListener('click', () => {
    exploreContent.classList.remove('active');
    document.body.style.overflow = 'auto';
  });
});
