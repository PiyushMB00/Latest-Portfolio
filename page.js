// Reveal on scroll
const onShow = new IntersectionObserver((entries)=>{
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('show'); });
}, { rootMargin: "0px 0px -10% 0px" });

document.querySelectorAll('.reveal').forEach(el => onShow.observe(el));

// Contact form (no backend): mailto fallback
const form = document.querySelector('#contact-form');
if (form) {
  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    const data = new FormData(form);
    const name = data.get('name'); const email = data.get('email'); const msg = data.get('message');
    window.location.href = `mailto:piyush@example.com?subject=Portfolio%20Message%20from%20${encodeURIComponent(name)}&body=${encodeURIComponent(msg + "\n\nFrom: " + email)}`;
  });
}
