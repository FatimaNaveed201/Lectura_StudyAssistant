document.addEventListener("DOMContentLoaded", () => {
  function showAlert(message) {
    const alertBox = document.getElementById('alertBox');
    if (!alertBox) return;
    alertBox.textContent = message;
    alertBox.classList.add('show');

    setTimeout(() => {
      alertBox.classList.remove('show');
    }, 3000);
  }

  const form = document.getElementById('registerForm');
  if (!form) {
    console.error('registerForm not found!');
    return;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    try {
      const res = await fetch('/api/v1/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });

      const data = await res.json();

      if (res.ok) {
        // Store name and token
        localStorage.setItem('userName', data.user.name);
        localStorage.setItem('authToken', data.token);

        // Redirect to home
        window.location.href = 'home.html';
      } else {
        showAlert(data.message || 'Signup failed');
      }

    } catch (err) {
      console.error(err);
      showAlert('Something went wrong.');
    }
  });
});
