document.getElementById('signupForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();

  try {
    const res = await fetch('/api/v1/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, email, password })
    });

    const data = await res.json();
    document.getElementById('responseMsg').innerText = data.message || 'Signup successful!';
  } catch (err) {
    document.getElementById('responseMsg').innerText = 'Something went wrong.';
    console.error(err);
  }
});
