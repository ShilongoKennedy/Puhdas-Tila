import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Send, X, Minimize2, Sparkles, User, Bot, HelpCircle, Phone, ArrowUpRight } from 'lucide-react';
import { Language } from '../translations';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

interface LiveChatProps {
  lang: Language;
}

// Simple text parser to format bold keywords and paragraphs beautifully in clean JSX
function FormatChatMessage({ text }: { text: string }) {
  const paragraphs = text.split('\n');
  return (
    <div className="space-y-2 text-xs sm:text-sm leading-relaxed">
      {paragraphs.map((para, pIdx) => {
        // Handle empty or very short paragraphs
        if (!para.trim()) return null;

        // Check if paragraph is a list item starts with bullet or dash
        const isListItem = para.trim().startsWith('-') || para.trim().startsWith('*') || para.trim().startsWith('•');
        const cleanPara = isListItem ? para.replace(/^[-*•]\s*/, '') : para;

        // Parse bold text like **bold**
        const parts = cleanPara.split(/(\*\*.*?\*\*)/g);
        const renderedText = parts.map((part, partIdx) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return (
              <strong key={partIdx} className="font-extrabold text-[#1B4332]">
                {part.slice(2, -2)}
              </strong>
            );
          }
          return part;
        });

        if (isListItem) {
          return (
            <div key={pIdx} className="flex items-start gap-1.5 pl-3">
              <span className="text-[#95C4A1] font-bold select-none mt-1 shrink-0">•</span>
              <p className="flex-1">{renderedText}</p>
            </div>
          );
        }

        return <p key={pIdx}>{renderedText}</p>;
      })}
    </div>
  );
}

export default function LiveChat({ lang }: LiveChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showNotificationBadge, setShowNotificationBadge] = useState(true);
  const [promptCallOption, setPromptCallOption] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Suggested Quick Actions that drive high-intent conversions
  const quickQuestions = lang === 'fi' ? [
    { text: 'Mikä on uuden asiakkaan ilmainen etu? 🎁', query: 'Kertokaa lisää uuden asiakkaan ilmaisesta siivousedusta.' },
    { text: 'Paljonko säännöllinen siivous maksaa? 💶', query: 'Mikä on toimistosiivouksen tuntiperustainen hinta tai kuukausihinta?' },
    { text: 'Onko teillä pitkiä sitovia sopimuksia? 🗓️', query: 'Miten pitkiä teidän siivoussopimukset ovat? Onko sitoutumispakkoa?' },
    { text: 'Miten varaan ilmaisen katselmuksen? 🤝', query: 'Miten voin varata meille maksuttoman toimiston katselmuksen?' }
  ] : [
    { text: 'What is the new customer free gift? 🎁', query: 'Tell me about the 100% free first cleaning visit for new customers.' },
    { text: 'How much does regular cleaning cost? 💶', query: 'How much does office cleaning cost per hour or per month?' },
    { text: 'Are there long commitment contracts? 🗓️', query: 'Do you require long-term binding annual cleaning contracts?' },
    { text: 'How do I book a free site visit? 🤝', query: 'How can I schedule a free physical walkthrough of our workspace?' }
  ];

  // Set initial welcome greeting matching language preference
  useEffect(() => {
    const welcomeText = lang === 'fi' 
      ? 'Hei! Tervetuloa Puhdas Tilan asiakaspalveluun. 👋 Toimistomme siivoushinnat alkavat 25 €/h. Kaikille uusille pääkaupunkiseudun yritysasiakkaille ensimmäinen siivouskerta on täysin maksuton! Miten voin auttaa sinua tänään?'
      : 'Hello there! Welcome to Puhdas Tila customer support. 👋 Our office cleaning rates start at 25 €/h. All new corporate clients in the capital area receive their very first cleaning session 100% FREE! How can I assist you today?';
    
    setMessages([
      {
        id: 'initial',
        role: 'assistant',
        text: welcomeText,
        timestamp: new Date()
      }
    ]);
  }, [lang]);

  // Scroll to bottom whenever messages list is populated
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  // Focus input when chat box launches
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const handleMessageSend = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    // Create User Message Object
    const userMessage: Message = {
      id: Math.random().toString(36).substring(7),
      role: 'user',
      text: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setShowNotificationBadge(false);

    // After message sent, check if it contains call back keywords
    const lowerText = textToSend.toLowerCase();
    const isCallBackQuery = lowerText.includes('soit') || lowerText.includes('puhelin') || lowerText.includes('call') || lowerText.includes('phone') || lowerText.includes('yhteyst') || lowerText.includes('kontakt');
    
    try {
      // Build history for backend
      // Limit to last 6 messages to protect token limits and keep it rapid
      const recentHistory = messages.slice(-6).map(m => ({
        role: m.role,
        text: m.text
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: textToSend,
          history: recentHistory
        })
      });

      if (!res.ok) {
        throw new Error('Chat API returned an error status');
      }

      const data = await res.json();
      
      const assistantMessage: Message = {
        id: Math.random().toString(36).substring(7),
        role: 'assistant',
        text: data.text || (lang === 'fi' ? 'Pahoittelut, en pystynyt vastaamaan tähän pyyntöön.' : 'Sorry, I am unable to answer this request at this time.'),
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      if (isCallBackQuery) {
        setPromptCallOption(true);
      }
    } catch (err) {
      console.error('Chat interface sync error:', err);
      
      // Fallback offline responsive messages if API key is not yet configured or server crashed
      setTimeout(() => {
        let fallbackReply = '';
        if (lang === 'fi') {
          fallbackReply = 'Hei! Toimistosiivouksemme alkaa laadukkaasti säännöllisessä siivouksessa **100 € / kk** ja kertatöissä **25 € / tunti**. Ensimmäinen kokeilukerta on täysin MAKSUTON (1. päivä ilmainen) ilman sitoutumispakkoa! \n\nVoit käyttää sivumme **Hinnasto**-laskuriä heti alapuolella suuntaa-antavan arvion saamiseksi. Koska jokainen tila eroaa pintamateriaaleiltaan ja toiveiltaan, saat **100 % tarkan ja sitovan tarjouksen** parhaiten ottamalla meihin yhteyttä tai varaamalla ilmaisen pikakatselmuksen (walkthrough) sivun tarjouslomakkeella! Ota yhteyttä, niin teemme teille räätälöidyn loistavan tarjouksen. ✨';
        } else {
          fallbackReply = 'Hello! Our commercial office cleaning program starts at **100 € / month** for regular subscriptions and **25 € / hour** for one-off sessions. Plus, your very first clean is 100% FREE with zero commitment! \n\nYou can compute an instant ballpark estimate using our dynamic **Pricing** estimator tool further down the page. Since every workspace is unique (surfaces, frequency, specific needs), the most **accurate and final quote** requires a quick walkthrough or short touch-base. Simply fill out the quick request form on the page to secure your guaranteed final proposal! ✨';
        }

        setMessages(prev => [...prev, {
          id: Math.random().toString(36).substring(7),
          role: 'assistant',
          text: fallbackReply,
          timestamp: new Date()
        }]);
      }, 1000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickQuestionClick = (queryText: string) => {
    handleMessageSend(queryText);
  };

  const handleFormScrollOption = (sectionId: string) => {
    setIsOpen(false);
    const element = document.getElementById(sectionId);
    if (element) {
      const offsetTop = element.getBoundingClientRect().top + window.pageYOffset - 80;
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
    }
  };

  return (
    <>
      {/* Floating Action Button with breathing ring notification wrapper */}
      <div className="fixed bottom-6 right-6 z-[9990] flex flex-col items-end">
        
        {/* Entrance Prompt tooltip above the button */}
        {showNotificationBadge && !isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 2, duration: 0.4 }}
            className="mb-3 bg-white border border-[#E0E4DC] text-[#1B4332] text-xs font-bold py-2.5 px-4 rounded-xl shadow-[0_10px_25px_-5px_rgba(27,67,50,0.12)] flex items-center gap-2 max-w-xs text-right cursor-pointer"
            onClick={() => { setIsOpen(true); setShowNotificationBadge(false); }}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#95C4A1] fill-[#95C4A1]/20 animate-pulse" />
            <span>
              {lang === 'fi' ? 'Kysy 1. ilmaispäivästä tästä! 🎁' : 'Claim your 1st Free Clean! 🎁'}
            </span>
            <button 
              onClick={(e) => { e.stopPropagation(); setShowNotificationBadge(false); }}
              className="text-gray-400 hover:text-gray-600 focus:outline-none ml-1 cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          </motion.div>
        )}

        <motion.button
          onClick={() => {
            setIsOpen(!isOpen);
            if (showNotificationBadge) setShowNotificationBadge(false);
          }}
          className={`w-14 h-14 rounded-full flex items-center justify-center text-white transition-all duration-300 shadow-lg cursor-pointer hover:scale-105 active:scale-95 focus:outline-none relative group ${
            isOpen ? 'bg-[#95C4A1] border border-[#1B4332]/10' : 'bg-[#1B4332]'
          }`}
          whileHover={{ y: -3 }}
          aria-expanded={isOpen}
          aria-label={lang === 'fi' ? 'Avaa asiakaspalvelu-chat' : 'Open customer service chat'}
        >
          {/* Subtle breathing animation ring around the button */}
          {!isOpen && (
            <span className="absolute inset-0 rounded-full border-2 border-[#1B4332]/40 animate-ping opacity-60 scale-105 pointer-events-none" />
          )}

          {/* Quick counter badge */}
          {showNotificationBadge && !isOpen && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#F4E185] border border-[#1B4332] text-[#1B4332] text-[9px] font-black rounded-full flex items-center justify-center animate-bounce">
              1
            </span>
          )}

          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X className="w-6 h-6 stroke-[2]" />
              </motion.div>
            ) : (
              <motion.div
                key="chat"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="flex items-center justify-center"
              >
                <MessageSquare className="w-6 h-6 stroke-[2]" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Main Chat Overlay Dialog Container */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Puhdas Tila Live Chat Assistant"
            initial={{ opacity: 0, y: 50, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.92 }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed bottom-24 right-4 sm:right-6 w-[340px] sm:w-[380px] h-[520px] bg-white border border-[#E0E4DC] rounded-2xl shadow-2xl z-[9995] overflow-hidden flex flex-col font-sans mb-1"
          >
            {/* Header section with brand colors and representative bot info */}
            <div className="bg-gradient-to-r from-[#1B4332] to-[#255D45] text-white p-4 flex items-center justify-between select-none border-b border-[#1B4332]/35">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 relative">
                  <Sparkles className="w-4.5 h-4.5 text-[#F4E185]" />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border border-[#1B4332] rounded-full" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold tracking-wide">
                    {lang === 'fi' ? 'Puhdas Tila Avustaja' : 'Puhdas Tila AI Agent'}
                  </h3>
                  <p className="text-[10px] text-white/80 flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse inline-block" />
                    {lang === 'fi' ? 'Hei! Vastaan heti' : 'Online • Ready to assist'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-white/10 rounded-sm transition-colors text-white/80 hover:text-white cursor-pointer focus:outline-none"
                  aria-label="Close Chat"
                >
                  <Minimize2 className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>

            {/* Campaign Alert Banner inside chat */}
            <div className="bg-[#95C4A1]/15 px-3 py-2 border-b border-[#E0E4DC] flex items-center justify-between text-[11px] text-[#1B4332] font-semibold">
              <span className="flex items-center gap-1.5 leading-none">
                <span className="text-[12px]">🎁</span>
                <span>{lang === 'fi' ? 'Uutuus: Ensimmäinen siivous täysin ILMAINEN!' : 'First cleaning is 100% FREE!'}</span>
              </span>
              <button 
                onClick={() => handleFormScrollOption('hinnat')}
                className="font-black underline scale-95 focus:outline-none hover:text-[#255D45]"
              >
                {lang === 'fi' ? 'Laske ' : 'Calculate'}
              </button>
            </div>

            {/* Conversational messages area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#FAFAF9]">
              {messages.map((msg) => {
                const isAssistant = msg.role === 'assistant';
                return (
                  <div 
                    key={msg.id} 
                    className={`flex gap-2.5 ${isAssistant ? 'justify-start' : 'justify-end'}`}
                  >
                    {isAssistant && (
                      <div className="w-7 h-7 rounded-full bg-[#1B4332] text-white flex items-center justify-center shrink-0 border border-white/20 select-none text-[11px]">
                        PT
                      </div>
                    )}
                    
                    <div className="max-w-[80%] flex flex-col gap-1">
                      <div className={`p-3 rounded-2xl shadow-xs ${
                        isAssistant 
                          ? 'bg-white border border-[#EBEBE8] text-[#1A1A1A] rounded-tl-xs' 
                          : 'bg-[#1B4332] text-white rounded-tr-xs'
                      }`}>
                        <FormatChatMessage text={msg.text} />
                      </div>
                      <span className={`text-[9px] text-gray-400 select-none px-1 ${!isAssistant ? 'text-right' : ''}`}>
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {!isAssistant && (
                      <div className="w-7 h-7 rounded-full bg-[#95C4A1] text-[#1B4332] flex items-center justify-center shrink-0 border border-white select-none text-[10px] font-bold">
                        <User className="w-4.5 h-4.5" />
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Bot thinking typing bubble indicator */}
              {isLoading && (
                <div className="flex gap-2.5 justify-start">
                  <div className="w-7 h-7 rounded-full bg-[#1B4332] text-white flex items-center justify-center shrink-0 select-none text-[11px]">
                    PT
                  </div>
                  <div className="p-3 bg-white border border-[#EBEBE8] rounded-2xl rounded-tl-xs flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-[#1B4332]/40 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 bg-[#1B4332]/60 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 bg-[#1B4332] rounded-full animate-bounce" />
                  </div>
                </div>
              )}

              {/* Action buttons prompts for callback and pricing form */}
              {promptCallOption && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs space-y-2 mt-2"
                >
                  <p className="font-bold text-[#1B4332]">
                    {lang === 'fi' ? '📞 Haluatko, että soitamme sinulle?' : '📞 Would you like a call back?'}
                  </p>
                  <p className="text-[10px] text-gray-600 leading-tight">
                    {lang === 'fi' 
                      ? 'Täytä puhelinnumerosi sivun helppoon tarjouspyyntölomakkeeseen, niin asiantuntijamme soittaa tunnin sisällä.' 
                      : 'Provide your phone number in our quick contact estimator below and our specialist will dial you within the hour.'}
                  </p>
                  <button 
                    onClick={() => handleFormScrollOption('yhteys')}
                    className="w-full py-1.5 bg-[#1B4332] hover:bg-[#255D45] text-white text-[10px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer focus:outline-none"
                  >
                    <span>{lang === 'fi' ? 'Täytä yhteystiedot' : 'Open Pricing Form'}</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick response buttons trigger segment */}
            {messages.length < 5 && !isLoading && (
              <div className="p-3 border-t border-[#F2F4F0] bg-white space-y-1.5 select-none">
                <span className="text-[10px] font-bold text-gray-400 block px-1">
                  {lang === 'fi' ? 'SUOSITUT KYSYMYKSET' : 'SUGGESTED TOPICS'}
                </span>
                <div className="flex flex-col gap-1 max-h-[140px] overflow-y-auto pr-1">
                  {quickQuestions.map((qq, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickQuestionClick(qq.query)}
                      className="text-left bg-[#FAFAF9] hover:bg-[#95C4A1]/10 border border-[#EBEBE8] text-[11px] text-[#1B4332] font-semibold py-1.5 px-3 rounded-lg transition-colors truncate focus:outline-none cursor-pointer"
                    >
                      {qq.text}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Message input segment */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleMessageSend(inputValue);
              }}
              className="p-3 border-t border-[#E0E4DC] bg-white flex items-center gap-2"
            >
              <input 
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={lang === 'fi' ? 'Kirjoita viestisi tähän...' : 'Type your inquiry...'}
                disabled={isLoading}
                className="flex-1 bg-[#FAFAF9] border border-[#E0E4DC] focus:border-[#95C4A1] focus:ring-1 focus:ring-[#95C4A1]/45 text-xs sm:text-sm rounded-xl py-2 px-3 text-gray-800 placeholder-gray-400 focus:outline-none transition-all disabled:opacity-50"
              />
              <button 
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all focus:outline-none text-white cursor-pointer shrink-0 ${
                  inputValue.trim() ? 'bg-[#1B4332] hover:bg-[#255D45] hover:scale-105 active:scale-95 shadow-sm' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
                aria-label="Send Message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
