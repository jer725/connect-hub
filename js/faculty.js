// Faculty search functionality
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('facultySearch');
    const facultyCards = document.querySelectorAll('.faculty-card');

    searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase();

        facultyCards.forEach(card => {
            const name = card.querySelector('h3').textContent.toLowerCase();
            const dept = card.querySelector('.faculty-dept').textContent.toLowerCase();

            if (name.includes(query) || dept.includes(query)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    });
});