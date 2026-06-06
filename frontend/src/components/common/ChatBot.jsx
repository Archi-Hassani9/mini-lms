import React, { useState, useRef, useEffect } from 'react';
import { FaCommentDots, FaTimes, FaPaperPlane } from 'react-icons/fa';

const responses = {
  enroll: "To enroll in a course, navigate to the course page and click the 'Enroll' button. You must be registered and logged in.",
  assignment: "You can find your assignments in the course details under the 'Assignments' section. Make sure to submit before the deadline!",
  certificate: "Certificates are automatically generated when you reach 100% completion in a course. You can download them from your dashboard.",
  password: "If you forgot your password, please contact the administrator, as this is a Mini LMS demo system.",
  contact: "You can reach out to us using the Contact form on the Contact page, or email us at support@minilms.com.",
  courses: "We offer courses in Web Development, Data Science, UI/UX, and Digital Marketing. Click 'Courses' in the navigation bar to browse.",
  default: "I'm sorry, I don't quite understand. You can ask me about enrollment, assignments, certificates, courses, or how to contact us."
};

const findResponse = (input) => {
  const text = input.toLowerCase();
  if (text.includes('enroll')) return responses.enroll;
  if (text.includes('assignment') || text.includes('deadline')) return responses.assignment;
  if (text.includes('cert') || text.includes('graduate')) return responses.certificate;
  if (text.includes('password') || text.includes('login')) return responses.password;
  if (text.includes('contact') || text.includes('help')) return responses.contact;
  if (text.includes('course') || text.includes('learn')) return responses.courses;
  return responses.default;
};

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hi! I'm the Mini LMS Assistant. How can I help you today?", isBot: true }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { text: userMsg, isBot: false }]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const reply = findResponse(userMsg);
      setMessages(prev => [...prev, { text: reply, isBot: true }]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <>
      <button className="chatbot-toggle" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <FaTimes /> : <FaCommentDots />}
      </button>

      {isOpen && (
        <div className="chatbot-window fade-in">
          <div className="p-3 text-white fw-bold d-flex align-items-center" style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}>
            <FaCommentDots className="me-2" /> Mini LMS Assistant
          </div>
          
          <div className="flex-grow-1 p-3 overflow-auto" style={{ background: 'var(--bg-dark)' }}>
            {messages.map((msg, idx) => (
              <div key={idx} className={`d-flex mb-3 ${msg.isBot ? 'justify-content-start' : 'justify-content-end'}`}>
                <div 
                  className={`p-2 px-3 rounded-3 ${msg.isBot ? 'text-white bg-secondary bg-opacity-25' : 'text-white'}`}
                  style={!msg.isBot ? { background: 'var(--primary)' } : { maxWidth: '85%' }}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="d-flex justify-content-start mb-3">
                <div className="p-2 px-3 rounded-3 text-white bg-secondary bg-opacity-25">
                  <small>typing...</small>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          <form onSubmit={handleSend} className="p-2 border-top d-flex gap-2" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color) !important' }}>
            <input 
              type="text" 
              className="form-control form-control-custom" 
              placeholder="Ask me something..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button type="submit" className="btn btn-primary" disabled={!input.trim()}>
              <FaPaperPlane />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default ChatBot;
