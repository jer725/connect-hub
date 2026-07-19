// Toggle club/faculty details on click (works even for cards added later)
document.addEventListener('click', function (e) {
  if (e.target.classList.contains('details-toggle-btn')) {
    const meta = e.target.nextElementSibling;
    meta.classList.toggle('show');
    e.target.textContent = meta.classList.contains('show') ? 'Hide Details ▴' : 'View Details ▾';
  }
});
// Filter faculty cards by search input
function filterFaculty() {
  const input = document.getElementById('facultySearch');
  if (!input) return;
  const query = input.value.toLowerCase();
  const cards = document.querySelectorAll('.faculty-card');

  cards.forEach(card => {
    const text = card.textContent.toLowerCase();
    if (text.includes(query)) {
      card.classList.remove('hidden');
    } else {
      card.classList.add('hidden');
    }
  });
}

  const mapBtn = document.querySelector('.map-btn');
  const mapModal = document.getElementById('campusMapModal');
  const closeMapBtn = document.getElementById('closeMapBtn');

  if (mapBtn && mapModal) {
    mapBtn.addEventListener('click', function () {
      mapModal.style.display = 'flex';
    });
  }

  if (closeMapBtn && mapModal) {
    closeMapBtn.addEventListener('click', function () {
      mapModal.style.display = 'none';
    });
  }
