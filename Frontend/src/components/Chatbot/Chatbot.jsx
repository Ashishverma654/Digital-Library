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
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen, isLoading]);

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
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 p-4 bg-primary text-on-primary rounded-full shadow-xl hover:shadow-2xl transition-all z-50 transform hover:scale-110 ${isOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'}`}
        aria-label="Open Chatbot"
      >
        <MessageSquare size={28} />
      </button>

      <div className={`fixed bottom-6 right-6 w-[350px] sm:w-[400px] h-[500px] max-h-[80vh] bg-white dark:bg-surface-container rounded-2xl shadow-2xl flex flex-col z-50 transition-all transform origin-bottom-right ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`}>
        
        <div className="bg-primary text-on-primary p-4 rounded-t-2xl flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Bot size={24} />
            <h3 className="font-bold text-lg">Library Assistant</h3>
          </div>
          <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-black/5 dark:bg-white/5">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
              <div className={`flex gap-2 max-w-[85%] ${msg.isBot ? 'flex-row' : 'flex-row-reverse'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.isBot ? 'bg-primary/20 text-primary' : 'bg-secondary/20 text-secondary'}`}>
                  {msg.isBot ? <Bot size={16} /> : <UserIcon size={16} />}
                </div>
                <div className={`p-3 rounded-2xl text-sm whitespace-pre-wrap ${msg.isBot ? 'bg-white dark:bg-surface-variant text-gray-900 dark:text-white rounded-tl-none' : 'bg-primary text-on-primary rounded-tr-none'}`}>
                  {msg.text}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex gap-2 max-w-[80%] flex-row">
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-primary/20 text-primary">
                  <Bot size={16} />
                </div>
                <div className="p-3 rounded-2xl text-sm bg-white dark:bg-surface-variant text-gray-900 dark:text-white rounded-tl-none flex gap-1 items-center">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* File preview chip */}
        {selectedFile && (
          <div className="px-4 pt-2 bg-white dark:bg-surface-container">
            <div className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-lg text-xs">
              <FileSpreadsheet size={14} />
              <span className="truncate flex-1">{selectedFile.name}</span>
              <button onClick={() => { setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }} className="hover:text-red-500 transition-colors">
                <X size={14} />
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSend} className="p-4 bg-white dark:bg-surface-container border-t border-black/10 dark:border-white/10 rounded-b-2xl flex gap-2 items-center">
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
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-gray-500 hover:text-primary hover:bg-primary/10 transition-colors"
                title="Attach Excel file"
              >
                <Paperclip size={18} />
              </button>
            </>
          )}
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isStaff ? "Message or attach Excel..." : "Ask about books, fines, etc..."}
            className="flex-1 px-4 py-2 bg-black/5 dark:bg-white/10 rounded-full focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 dark:text-white text-sm"
          />
          <button 
            type="submit" 
            disabled={(!input.trim() && !selectedFile) || isLoading}
            className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center shrink-0 disabled:opacity-50 hover:bg-primary/90 transition-colors"
          >
            <Send size={18} className="ml-1" />
          </button>
        </form>
      </div>
    </>
  );
};

export default Chatbot;
