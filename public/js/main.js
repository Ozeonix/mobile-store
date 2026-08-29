// Client-side interactions for Tech Talk Mobile - Zero Emojis

document.addEventListener('DOMContentLoaded', () => {
  // 1. Auto-dismiss alert notifications after 5 seconds
  const alerts = document.querySelectorAll('.alert');
  alerts.forEach(alert => {
    setTimeout(() => {
      alert.style.transition = 'opacity 0.5s ease';
      alert.style.opacity = '0';
      setTimeout(() => alert.remove(), 500);
    }, 5000);
  });

  // 2. Interactive SVG Star Rating Selector on Review Submission Form
  const starBtns = document.querySelectorAll('.rating-star-btn');
  const ratingHiddenInput = document.getElementById('rating_input');

  if (starBtns.length && ratingHiddenInput) {
    starBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const selectedVal = parseInt(btn.getAttribute('data-value'), 10);
        ratingHiddenInput.value = selectedVal;
        
        starBtns.forEach(s => {
          const sVal = parseInt(s.getAttribute('data-value'), 10);
          const svg = s.querySelector('svg');
          if (sVal <= selectedVal) {
            s.style.color = '#ffb703';
            if (svg) {
              svg.setAttribute('fill', '#ffb703');
              svg.setAttribute('stroke', '#ffb703');
            }
          } else {
            s.style.color = '#ced4da';
            if (svg) {
              svg.setAttribute('fill', 'none');
              svg.setAttribute('stroke', '#ced4da');
            }
          }
        });
      });
    });
  }

  // 3. Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
});
