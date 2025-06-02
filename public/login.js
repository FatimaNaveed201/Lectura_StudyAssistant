function showAlert(message) {
  const alertBox = document.getElementById('alertBox');
  alertBox.textContent = message;
  alertBox.classList.add('show');

  setTimeout(() => {
    alertBox.classList.remove('show');
  }, 3000); // Hides after 3 seconds
}


document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();

  try {
    const res = await fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (res.ok) {
      localStorage.setItem('userName', data.user.name);
      localStorage.setItem('authToken', data.token);  // <-- Save the token here
      window.location.href = 'home.html';
    } else {
      showAlert(data.message || 'Login failed');
    }
      } catch (err) {
      showAlert('Something went wrong.');
    }
    });
