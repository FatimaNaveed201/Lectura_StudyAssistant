const canvas = document.getElementById("sparkleCanvas");
const ctx = canvas.getContext("2d");
const heroSection = document.querySelector(".hero-section");
let particles = [];

function resizeCanvas() {
  canvas.width = heroSection.offsetWidth;
  canvas.height = heroSection.offsetHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

document.addEventListener("mousemove", (e) => {
  const rect = heroSection.getBoundingClientRect();
  if (
    e.clientX >= rect.left &&
    e.clientX <= rect.right &&
    e.clientY >= rect.top &&
    e.clientY <= rect.bottom
  ) {
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    for (let i = 0; i < 5; i++) {
      particles.push({
        x: offsetX,
        y: offsetY,
        radius: Math.random() * 3 + 1,
        alpha: 1,
        dx: (Math.random() - 0.5) * 2,
        dy: (Math.random() - 0.5) * 2,
        color: ["#ff99ff", "#99ccff", "#cc99ff"][Math.floor(Math.random() * 3)],
      });
    }
  }
});

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach((p, index) => {
    p.x += p.dx;
    p.y += p.dy;
    p.alpha -= 0.01;
    if (p.alpha <= 0) particles.splice(index, 1);
    else {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  });
  requestAnimationFrame(animate);
}
animate();
