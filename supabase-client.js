const SUPABASE_URL = "https://tiiilsnqpgivzivzbrty.supabase.co";
const SUPABASE_KEY = "sb_publishable_-v0DzuxoJw86ooG5j1xh-g_gU-D5rxZ";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
async function fetchEvents() {
  const { data, error } = await supabaseClient
    .from('events')
    .select('*');

  if (error) {
    console.error('Error fetching events:', error);
    return;
  }

  const container = document.getElementById('events-container');
  if (!container) return;
  container.innerHTML = '';

  data.forEach(event => {
    const card = document.createElement('div');
    card.className = 'event-full-card';
    card.dataset.eventId = event.id;
    card.innerHTML = `
      <h3>${event.name}</h3>
      <p>📅 ${event.date} &nbsp; | &nbsp; ⏰ ${event.time}</p>
      <p>📍 ${event.venue}</p>
      <p class="event-desc">${event.description}</p>
      <div class="event-meta">
        <span>🎟️ Seats: ${event.seats}</span>
        <span>⏳ Deadline: ${event.deadline}</span>
        <span>👥 Open to: ${event.eligibility}</span>
      </div>
      <button class="register-btn">Register</button>
    `;
    container.appendChild(card);
  });
}

fetchEvents();
async function fetchClubs() {
  const { data, error } = await supabaseClient
    .from('clubs')
    .select('*');

  if (error) {
    console.error('Error fetching clubs:', error);
    return;
  }

  const container = document.getElementById('clubs-container');
  if (!container) return;

  container.innerHTML = '';

  data.forEach(club => {
    const card = document.createElement('div');
    card.className = 'club-card';
    card.innerHTML = `
      <span class="club-category">${club.category}</span>
      <h3>${club.name}</h3>
      <p>${club.about}</p>
      <button class="details-toggle-btn">View Details</button>
      <div class="club-meta">
        <p><strong>Skills you'll learn:</strong> ${club.skills}</p>
        <p><strong>How to join:</strong> ${club.how_to_join}</p>
        <p><strong>Founder:</strong> ${club.founder}</p>
        <p><strong>Current Lead:</strong> ${club.student_lead}</p>
        <p><strong>Meets:</strong> ${club.meeting_time}</p>
      </div>
      <button class="join-btn">Join Club</button>
    `;
    container.appendChild(card);
  });
}

fetchClubs();
async function fetchFaculty() {
  const { data, error } = await supabaseClient
    .from('faculty')
    .select('*');

  if (error) {
    console.error('Error fetching faculty:', error);
    return;
  }

  const container = document.getElementById('faculty-container');
  if (!container) return;

  container.innerHTML = '';

  data.forEach(f => {
    const card = document.createElement('div');
    card.className = 'faculty-card';
    card.innerHTML = `
      <h3>${f.name}</h3>
      <p><strong>Department:</strong> ${f.department}</p>
      <p><strong>Subject:</strong> ${f.subject}</p>
      <button class="details-toggle-btn">View Details ▾</button>
      <div class="club-meta">
        <p><strong>Designation:</strong> ${f.designation}</p>
        <p><strong>Qualification:</strong> ${f.qualification}</p>
        <p><strong>Email:</strong> ${f.email}</p>
        <p><strong>Office:</strong> ${f.office}</p>
      </div>
    `;
    container.appendChild(card);
  });
}

fetchFaculty();
let currentRegType = '';
let currentRegItemName = '';
let currentEventId = null;

function openRegistrationModal(type, itemName) {
  currentRegType = type;
  currentRegItemName = itemName;
  document.getElementById('modalTitle').textContent =
    type === 'event' ? `Register for ${itemName}` : `Join ${itemName}`;
  document.getElementById('registrationModal').style.display = 'flex';
}

function closeRegistrationModal() {
  document.getElementById('registrationModal').style.display = 'none';
  document.getElementById('registrationForm').reset();
}

document.addEventListener('click', function (e) {
  if (e.target.classList.contains('register-btn')) {
    const card = e.target.closest('.event-full-card');
    const name = card.querySelector('h3').textContent;
    currentEventId = card.dataset.eventId;
    openRegistrationModal('event', name);
  }
  if (e.target.classList.contains('join-btn')) {
    const card = e.target.closest('.club-card');
    const name = card.querySelector('h3').textContent;
    openRegistrationModal('club', name);
  }
  if (e.target.id === 'closeModalBtn') {
    closeRegistrationModal();
  }
});

document.addEventListener('submit', async function (e) {
  if (e.target.id === 'registrationForm') {
    e.preventDefault();

    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const roll = document.getElementById('regRoll').value;

    const { error } = await supabaseClient
      .from('registrations')
      .insert([{
        type: currentRegType,
        item_name: currentRegItemName,
        student_name: name,
        student_email: email,
        roll_number: roll
      }]);

    if (error) {
      alert('Something went wrong. Please try again.');
      console.error(error);
    } else {
      if (currentRegType === 'event' && currentEventId) {
        const { data: eventData } = await supabaseClient
          .from('events')
          .select('seats')
          .eq('id', currentEventId)
          .single();

        if (eventData && eventData.seats > 0) {
          await supabaseClient
            .from('events')
            .update({ seats: eventData.seats - 1 })
            .eq('id', currentEventId);
        }
        fetchEvents();
      }
      alert('Success! You are registered.');
      closeRegistrationModal();
    }
  }
});