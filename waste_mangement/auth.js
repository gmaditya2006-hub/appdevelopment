// Auth logic for user login, signup, password validation, and session management.
const AUTH_STORAGE_KEY = 'wastewise_users';
const SESSION_STORAGE_KEY = 'wastewise_session';

const loginPanel = document.getElementById('loginPanel');
const signupPanel = document.getElementById('signupPanel');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const signupPasswordInput = document.getElementById('signupPassword');
const passwordHint = document.getElementById('passwordHint');
const tabs = document.querySelectorAll('.auth-tab');

// Restore users from localStorage or initialize the demo account.
function getStoredUsers() {
  const users = JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY) || 'null');
  if (!users) {
    const demoUser = {
      name: 'Green Champion',
      email: 'demo@wastewise.app',
      password: 'Demo@12',
      points: 0,
      wasteItems: 0,
      streak: 0,
      badges: [],
      completedChallenges: [],
      rewardsRedeemed: []
    };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify([demoUser]));
    return [demoUser];
  }
  return users;
}

function validatePassword(password) {
  if (!password) {
    return 'Password is required.';
  }

  if (password.length > 8) {
    return 'Password must be 8 characters or fewer.';
  }

  if (!/[a-z]/.test(password)) {
    return 'Password must include at least 1 lowercase letter.';
  }

  if (!/[A-Z]/.test(password)) {
    return 'Password must include at least 1 uppercase letter.';
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    return 'Password must include at least 1 special character.';
  }

  return '';
}

function updatePasswordFeedback() {
  if (!signupPasswordInput || !passwordHint) {
    return;
  }

  const password = signupPasswordInput.value;
  const message = validatePassword(password);

  if (!password) {
    passwordHint.textContent = 'Must be 8 characters max and include at least 1 lowercase, 1 uppercase, and 1 special character.';
    passwordHint.classList.remove('valid', 'error');
    signupPasswordInput.setCustomValidity('');
    return;
  }

  if (message) {
    passwordHint.textContent = message;
    passwordHint.classList.add('error');
    passwordHint.classList.remove('valid');
    signupPasswordInput.setCustomValidity(message);
    return;
  }

  passwordHint.textContent = 'Strong password accepted.';
  passwordHint.classList.add('valid');
  passwordHint.classList.remove('error');
  signupPasswordInput.setCustomValidity('');
}

function saveSession(user) {
  sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
}

function setActiveTab(mode) {
  tabs.forEach(tab => {
    const isActive = tab.dataset.mode === mode;
    tab.classList.toggle('active', isActive);
    tab.setAttribute('aria-selected', String(isActive));
  });

  loginPanel.classList.toggle('active', mode === 'login');
  signupPanel.classList.toggle('active', mode === 'signup');
}

function loginUser(email, password) {
  const users = getStoredUsers();
  const foundUser = users.find(
    user => user.email.toLowerCase() === email.toLowerCase() && user.password === password
  );

  if (!foundUser) {
    alert('Incorrect email or password.');
    return;
  }

  saveSession(foundUser);
  window.location.href = 'index.html';
}

function createUser(name, email, password) {
  const users = getStoredUsers();
  const exists = users.some(user => user.email.toLowerCase() === email.toLowerCase());

  if (exists) {
    alert('An account with that email already exists. Please log in instead.');
    setActiveTab('login');
    return;
  }

  const newUser = {
    name,
    email,
    password,
    points: 0,
    wasteItems: 0,
    streak: 1,
    badges: [],
    completedChallenges: [],
    rewardsRedeemed: []
  };

  users.push(newUser);
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(users));
  saveSession(newUser);
  window.location.href = 'index.html';
}

tabs.forEach(tab => {
  tab.addEventListener('click', () => setActiveTab(tab.dataset.mode));
});

loginForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value.trim();
  if (!email || !password) {
    alert('Please fill in both email and password.');
    return;
  }
  loginUser(email, password);
});

signupPasswordInput.addEventListener('input', updatePasswordFeedback);

signupForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const name = document.getElementById('signupName').value.trim();
  const email = document.getElementById('signupEmail').value.trim();
  const password = document.getElementById('signupPassword').value.trim();

  if (!name || !email || !password) {
    alert('Please complete all sign-up fields.');
    return;
  }

  const passwordError = validatePassword(password);
  if (passwordError) {
    updatePasswordFeedback();
    signupPasswordInput.focus();
    alert(passwordError);
    return;
  }

  createUser(name, email, password);
});

setActiveTab('login');
updatePasswordFeedback();
