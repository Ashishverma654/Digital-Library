import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Bot, User as UserIcon, Paperclip, FileSpreadsheet } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const Chatbot = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Hi! I'm your AI Library Assistant. How can I help you today?", isBot: true }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipMessage, setTooltipMessage] = useState("Need help? I'm here!");
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen, isLoading]);

  // Inactivity popup logic
  useEffect(() => {
    if (isOpen) {
      setShowTooltip(false);
      return;
    }
    const interval = setInterval(() => {
      const msgs = ["Need a book recommendation?", "Ask me about fines!", "How can I help you today?", "Looking for something specific?"];
      setTooltipMessage(msgs[Math.floor(Math.random() * msgs.length)]);
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 5000); // Hide after 5 seconds
    }, 15000); // Every 15 seconds

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!user) return null;

  const isStaff = user.role === 'ADMIN' || user.role === 'LIBRARIAN';

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls|csv)$/i)) {
      alert('Please upload an Excel (.xlsx, .xls) or CSV file.');
      return;
    }
    setSelectedFile(file);
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if ((!input.trim() && !selectedFile) || isLoading) return;

    const displayText = selectedFile
      ? `${input.trim() ? input + '\n' : ''}📎 ${selectedFile.name}`
      : input;

    const userMessage = { id: Date.now(), text: displayText, isBot: false };
    setMessages(prev => [...prev, userMessage]);

    const messageText = input;
    const fileToSend = selectedFile;

    setInput('');
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setIsLoading(true);

    try {
      const payload = { message: messageText };

      if (fileToSend) {
        payload.fileData = await fileToBase64(fileToSend);
        payload.fileName = fileToSend.name;
      }

      const response = await api.post('/chat', payload);
      const botMessage = { id: Date.now() + 1, text: response.data.data.reply, isBot: true };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorText = error.response?.data?.message || "Sorry, I'm having trouble connecting to the server.";
      const errorMessage = { id: Date.now() + 1, text: errorText, isBot: true };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Tooltip */}
      {!isOpen && showTooltip && (
        <div className="fixed bottom-28 right-8 z-40 animate-in slide-in-from-bottom-2 fade-in duration-300">
          <div className="bg-surface text-on-surface px-4 py-2 rounded-2xl rounded-br-none shadow-lg border border-outline/30 font-body-md text-sm whitespace-nowrap">
            {tooltipMessage}
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 w-16 h-16 rounded-full shadow-lg hover:shadow-xl flex items-center justify-center z-50 transform transition-all duration-500 hover:scale-110 hover:rotate-12 ${isOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'}`}
        aria-label="Open Chatbot"
      >
        <div className="absolute inset-0 rounded-full bg-primary animate-ping opacity-20" style={{ animationDuration: '3s' }}></div>
        <img src="/chatbot-icon.png" alt="Chatbot" className="w-full h-full object-cover rounded-full relative z-10 shadow-lg border-2 border-surface" />
      </button>

      <div className={`fixed bottom-6 right-6 w-[calc(100vw-3rem)] sm:w-[400px] h-[550px] max-h-[85vh] bg-white rounded-3xl shadow-2xl flex flex-col z-50 overflow-hidden transition-all transform origin-bottom-right duration-500 ${isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 pointer-events-none translate-y-4'}`}>
        
        {/* Professional Header */}
        <div className="bg-primary p-5 flex justify-between items-center relative overflow-hidden">
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-surface shadow-sm bg-surface">
              <img src="/chatbot-icon.png" alt="Bot" className="w-full h-full object-cover" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-on-primary font-headline-md tracking-wide">Library AI</h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
                <span className="text-xs text-on-primary/90 font-medium">Online</span>
              </div>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-2 rounded-full transition-colors relative z-10 text-on-primary">
            <X size={20} />
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 p-5 overflow-y-auto space-y-5 bg-background">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
              <div className={`flex gap-3 max-w-[85%] ${msg.isBot ? 'flex-row' : 'flex-row-reverse'}`}>
                {msg.isBot && (
                  <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border border-outline/30 bg-surface">
                    <img src="/chatbot-icon.png" alt="Bot" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className={`p-3.5 rounded-2xl text-sm font-body-md shadow-sm whitespace-pre-wrap leading-relaxed ${msg.isBot ? 'bg-surface text-on-background rounded-tl-sm border border-outline/30' : 'bg-secondary text-on-secondary rounded-tr-sm'}`}>
                  {msg.text}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex gap-3 max-w-[80%] flex-row">
                <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border border-outline/30 bg-surface">
                  <img src="/chatbot-icon.png" alt="Bot" className="w-full h-full object-cover" />
                </div>
                <div className="p-4 rounded-2xl rounded-tl-sm bg-surface shadow-sm border border-outline/30 flex gap-1.5 items-center">
                  <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                  <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* File preview chip */}
        {selectedFile && (
          <div className="px-4 pt-2 bg-white">
            <div className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-lg text-xs">
              <FileSpreadsheet size={14} />
              <span className="truncate flex-1">{selectedFile.name}</span>
              <button onClick={() => { setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }} className="hover:text-red-500 transition-colors">
                <X size={14} />
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSend} className="p-4 bg-surface border-t border-outline/30 flex gap-3 items-center relative">
          {isStaff && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileSelect}
                className="hidden"
                id="chatbot-file-input"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-on-surface-variant hover:text-primary hover:bg-primary/10 transition-colors"
                title="Attach Excel file"
              >
                <Paperclip size={20} />
              </button>
            </>
          )}
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isStaff ? "Message or attach Excel..." : "Write a message..."}
            className="flex-1 px-5 py-3 bg-background border border-outline/30 rounded-full focus:outline-none focus:border-primary text-on-background text-sm font-body-md transition-all placeholder-on-surface-variant/50"
          />
          <button 
            type="submit" 
            disabled={(!input.trim() && !selectedFile) || isLoading}
            className="w-11 h-11 rounded-full bg-primary text-on-primary flex items-center justify-center shrink-0 disabled:opacity-50 hover:shadow-lg hover:shadow-primary/30 transition-all transform hover:-translate-y-0.5"
          >
            <Send size={18} className="ml-1" />
          </button>
        </form>
      </div>
    </>
  );
};

export default Chatbot;
