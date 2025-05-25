// Handle form submit
document.getElementById('search-form').addEventListener('submit', function (e) {
  e.preventDefault();
  const username = document.getElementById('username').value.trim();
  if (username) {
    fetchGitHubUser(username);
  }
});

// Loader
function showLoader() {
  document.getElementById('loader').classList.remove('hidden');
}
function hideLoader() {
  document.getElementById('loader').classList.add('hidden');
}

// Fetch user & repos
async function fetchGitHubUser(username) {
  showLoader();
  try {
    const userRes = await fetch(`https://api.github.com/users/${username}`);
    if (!userRes.ok) throw new Error('User not found');
    const userData = await userRes.json();
    renderUserProfile(userData);

    const reposRes = await fetch(`${userData.repos_url}?per_page=5&sort=updated`);
    if (!reposRes.ok) throw new Error('Error fetching repos');
    const repos = await reposRes.json();
    renderRepos(repos);
  } catch (err) {
    alert(err.message);
  } finally {
    hideLoader();
  }
}

// Render profile
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
  section.classList.remove('hidden');
}

// Render repos
function renderRepos(repos) {
  const list = document.getElementById('repos-list');
  list.innerHTML = '';
  repos.forEach(repo => {
    const li = document.createElement('li');
    li.innerHTML = `<a href="${repo.html_url}" target="_blank">${repo.name}</a> ⭐ ${repo.stargazers_count}`;
    list.appendChild(li);
  });
  document.getElementById('repos-section').classList.remove('hidden');
}

// Favorites
function addToFavorites(username) {
  let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  if (!favorites.includes(username)) {
    favorites.push(username);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    renderFavorites();
  }
}
function renderFavorites() {
  const list = document.getElementById('favorites-list');
  const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  list.innerHTML = '';
  favorites.forEach(user => {
    const li = document.createElement('li');
    li.textContent = user;
    li.addEventListener('click', () => fetchGitHubUser(user));
    list.appendChild(li);
  });
}
document.getElementById('clear-favorites').addEventListener('click', () => {
  localStorage.removeItem('favorites');
  renderFavorites();
});
renderFavorites();

// Dark mode toggle button
const toggleBtn = document.getElementById('dark-mode-toggle');

function updateToggleIcon() {
  if (document.body.classList.contains('dark')) {
    toggleBtn.textContent = '🌙'; // moon icon for dark mode
  } else {
    toggleBtn.textContent = '🌞'; // sun icon for light mode
  }
}

// Load theme from localStorage
if (localStorage.getItem('darkMode') === 'true') {
  document.body.classList.add('dark');
}
updateToggleIcon();

toggleBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  localStorage.setItem('darkMode', document.body.classList.contains('dark'));
  updateToggleIcon();
});
