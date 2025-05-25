// When the search form is submitted...
document.getElementById('search-form').addEventListener('submit', function (e) {
  e.preventDefault(); // Prevent the page from reloading
  const username = document.getElementById('username').value.trim(); // Get the username typed by the user
  if (username) {
    fetchGitHubUser(username); // If input is not empty, start fetching data
  }
});

// Show the loader spinner to indicate loading
function showLoader() {
  document.getElementById('loader').classList.remove('hidden');
}

// Hide the loader spinner when loading is done
function hideLoader() {
  document.getElementById('loader').classList.add('hidden');
}

// Fetch user profile and repos from GitHub API asynchronously
async function fetchGitHubUser(username) {
  showLoader(); // Show loading spinner
  try {
    // Get user data from GitHub API
    const userRes = await fetch(`https://api.github.com/users/${username}`);
    if (!userRes.ok) throw new Error('User not found'); // If no user, throw an error
    const userData = await userRes.json();
    renderUserProfile(userData); // Show user profile on the page

    // Now fetch their recent repos (max 5, sorted by recent updates)
    const reposRes = await fetch(`${userData.repos_url}?per_page=5&sort=updated`);
    if (!reposRes.ok) throw new Error('Error fetching repos');
    const repos = await reposRes.json();
    renderRepos(repos); // Display repos
  } catch (err) {
    alert(err.message); // Show error to user in alert box
  } finally {
    hideLoader(); // Hide spinner no matter what
  }
}

// Display user profile info in the profile section
function renderUserProfile(user) {
  const section = document.getElementById('profile-section');
  section.innerHTML = `
    <img src="${user.avatar_url}" alt="${user.login}">
    <div>
      <h2>${user.name || user.login}</h2>
      <p>${user.bio || ''}</p>
      <p>${user.location || ''}</p>
      <p>Followers: ${user.followers}</p>
      <button onclick="addToFavorites('${user.login}')">Add to Favorites</button>
    </div>
  `;
  section.classList.remove('hidden'); // Make sure this section is visible
}

// Show the list of repositories in the repos section
function renderRepos(repos) {
  const list = document.getElementById('repos-list');
  list.innerHTML = ''; // Clear any old repos
  repos.forEach(repo => {
    const li = document.createElement('li');
    li.innerHTML = `<a href="${repo.html_url}" target="_blank">${repo.name}</a> ⭐ ${repo.stargazers_count}`;
    list.appendChild(li);
  });
  document.getElementById('repos-section').classList.remove('hidden'); // Show the repos section
}

// Add a username to favorites (saved in localStorage)
function addToFavorites(username) {
  let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  if (!favorites.includes(username)) {
    favorites.push(username); // Add if not already in favorites
    localStorage.setItem('favorites', JSON.stringify(favorites)); // Save back to localStorage
    renderFavorites(); // Update the favorites list UI
  }
}

// Render the list of favorite usernames in the sidebar
function renderFavorites() {
  const list = document.getElementById('favorites-list');
  const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  list.innerHTML = ''; // Clear current list
  favorites.forEach(user => {
    const li = document.createElement('li');
    li.textContent = user;
    // Clicking a favorite fetches that user's data again
    li.addEventListener('click', () => fetchGitHubUser(user));
    list.appendChild(li);
  });
}

// Clear all favorites when clear button clicked
document.getElementById('clear-favorites').addEventListener('click', () => {
  localStorage.removeItem('favorites');
  renderFavorites(); // Refresh favorites UI to empty
});

// Render favorites on page load so user sees saved ones
renderFavorites();

// --- Dark Mode Toggle --- //

const toggleBtn = document.getElementById('dark-mode-toggle');

// Update toggle button icon depending on current theme
function updateToggleIcon() {
  if (document.body.classList.contains('dark')) {
    toggleBtn.textContent = '🌙'; // Moon icon means dark mode is ON
  } else {
    toggleBtn.textContent = '🌞'; // Sun icon means light mode is ON
  }
}

// When page loads, check if user had dark mode enabled before
if (localStorage.getItem('darkMode') === 'true') {
  document.body.classList.add('dark');
}
updateToggleIcon(); // Set correct icon on load

// Toggle dark mode on button click, save preference in localStorage
toggleBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  localStorage.setItem('darkMode', document.body.classList.contains('dark'));
  updateToggleIcon();
});
