// Fetches fresh data from Supabase and asks Groq (Llama 3.3) to answer using it
async function getChatbotResponse(userMessage) {
  try {
    const [eventsRes, clubsRes, facultyRes] = await Promise.all([
      supabaseClient.from('events').select('*'),
      supabaseClient.from('clubs').select('*'),
      supabaseClient.from('faculty').select('*')
    ]);

    const events = eventsRes.data || [];
    const clubs = clubsRes.data || [];
    const faculty = facultyRes.data || [];

    const contextData = {
      events: events.map(e => ({
        name: e.name, date: e.date, time: e.time, venue: e.venue,
        description: e.description, seats: e.seats,
        deadline: e.deadline, eligibility: e.eligibility
      })),
      clubs: clubs.map(c => ({
        name: c.name, category: c.category, about: c.about,
        skills: c.skills, how_to_join: c.how_to_join,
        meeting_time: c.meeting_time
      })),
      faculty: faculty.map(f => ({
        name: f.name, department: f.department, subject: f.subject,
        designation: f.designation, email: f.email, office: f.office
      }))
    };

    const systemPrompt = `You are a helpful assistant for our college's Freshers Portal website.
Answer the student's question using ONLY the data below. Be friendly, concise, and clear.
If the answer isn't in the data, say you don't have that information yet.

IMPORTANT: If the student asks about the LOCATION of a place on campus (e.g. "where is KS Block", "where is the canteen", "how do I get to the ground"), do NOT try to answer from the data. Instead, tell them to check the Campus Map button (📍) in the navbar to see exactly where it is.

COLLEGE DATA:
${JSON.stringify(contextData, null, 2)}

STUDENT QUESTION:
${userMessage}`;

    const reply = await getAIResponse(systemPrompt);
    return reply;

  } catch (err) {
    console.error("getChatbotResponse error:", err);
    return "Sorry, something went wrong while getting an answer.";
  }
}

// Sends the combined prompt to Groq's API and returns the AI's reply text
async function getAIResponse(prompt) {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "user", content: prompt }
      ]
    })
  });

  const data = await response.json();

  if (data.error) {
    console.error("Groq API error:", data.error);
    return "Sorry, I'm having trouble responding right now.";
  }

  return data.choices[0].message.content;
}

// ===== CHATBOT UI WIRING =====
document.addEventListener('DOMContentLoaded', () => {
  const chatbotBtn = document.querySelector('.chatbot-btn');
  const chatbotBox = document.getElementById('chatbotBox');
  const closeChatBtn = document.getElementById('closeChatBtn');
  const chatbotMessages = document.getElementById('chatbotMessages');
  const chatbotInput = document.getElementById('chatbotInput');
  const sendChatBtn = document.getElementById('sendChatBtn');

  function addMessage(text, sender) {
    const msg = document.createElement('div');
    msg.className = 'chat-message ' + sender;
    msg.textContent = text;
    chatbotMessages.appendChild(msg);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
  }

  chatbotBtn.addEventListener('click', () => {
    chatbotBox.style.display = 'flex';
  });

  closeChatBtn.addEventListener('click', () => {
    chatbotBox.style.display = 'none';
  });

  async function handleSend() {
    const question = chatbotInput.value.trim();
    if (!question) return;

    addMessage(question, 'user');
    chatbotInput.value = '';
    addMessage('Thinking...', 'bot-typing');

    const reply = await getChatbotResponse(question);

    const typingMsg = document.querySelector('.bot-typing');
    if (typingMsg) typingMsg.remove();

    addMessage(reply, 'bot');
  }

  sendChatBtn.addEventListener('click', handleSend);
  chatbotInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSend();
  });
});