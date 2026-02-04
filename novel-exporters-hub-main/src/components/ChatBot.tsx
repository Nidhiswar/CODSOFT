import { useState, useRef, useEffect } from "react";
import { Send, MessageSquare, X, MinusCircle, Loader2, Sparkles, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import novelLogo from "@/assets/novel-logo-dynamic.png";

interface Message {
    role: "user" | "model";
    parts: { text: string }[];
}

const ChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState("");
    const [history, setHistory] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showAttention, setShowAttention] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [history, isLoading]);

    // Initial greeting
    useEffect(() => {
        if (history.length === 0) {
            setHistory([{
                role: "model",
                parts: [{ text: "Hello! I'm your Novel Exporters assistant. How can I help you with our spice collection or export services today?" }]
            }]);
        }
    }, []);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            role: "user",
            parts: [{ text: input }],
        };

        const currentInput = input;
        setHistory((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);
        setShowAttention(false);

        try {
            const data = await api.chat(currentInput, history);

            if (data.message && !data.text) {
                const err: any = new Error(data.message);
                err.status = data.status;
                err.details = data.details;
                throw err;
            }

            const botMessage: Message = {
                role: "model",
                parts: [{ text: data.text || "I'm having trouble connecting. Please check if the API key is valid!" }],
            };

            setHistory((prev) => [...prev, botMessage]);
        } catch (error: any) {
            console.error("Chat Error:", error);
            let userFriendlyMessage = `Error: ${error.message}`;

            if (error.status === "error" && error.details) {
                userFriendlyMessage = `Backend Error: ${error.message} (${error.details})`;
            } else if (error.message.includes("Unexpected token") || error.message.includes("invalid response")) {
                userFriendlyMessage = "Integration Error: The backend returned an invalid response. Please stop all processes and run 'START_INTEGRATED_APP.bat'.";
            } else if (error.message === "Failed to fetch") {
                userFriendlyMessage = "Connection Error: Backend server not reachable at http://127.0.0.1:5009. Please ensure 'node server.js' is running.";
            }

            const errorMessage: Message = {
                role: "model",
                parts: [{ text: userFriendlyMessage }],
            };
            setHistory((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 md:bottom-8 md:right-8 z-[200]">
            {/* Attention CTA Bubble - Adjacent to chat button */}
            <AnimatePresence>
                {showAttention && !isOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: 20, scale: 0.8 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 20, scale: 0.8 }}
                        className="absolute bottom-0 right-16 sm:right-18 md:right-20 w-56 sm:w-64 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white dark:bg-zinc-900 shadow-2xl border border-spice-gold/20 mr-2"
                    >
                        <button
                            onClick={() => setShowAttention(false)}
                            className="absolute -top-2 -left-2 p-1 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-800 transition-colors shadow-sm"
                        >
                            <X className="w-3 h-3" />
                        </button>
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-lg bg-spice-gold/10 flex items-center justify-center shrink-0">
                                <img src={novelLogo} alt="Novel Exporters" className="w-7 h-7 object-contain" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-foreground">Aromatic Specialist</p>
                                <p className="text-[10px] text-muted-foreground leading-relaxed mt-1">
                                    Ask about spice origins, harvest seasons, or bulk export logistics.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Chat Bubble Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 ${isOpen ? "bg-zinc-900 text-white rotate-90" : "bg-spice-gold text-black shadow-spice-gold/20"
                    }`}
            >
                {isOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" /> : <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />}

                {!isOpen && (
                    <span className="absolute top-0 right-0 w-4 h-4 bg-green-500 border-2 border-white dark:border-zinc-950 rounded-full animate-pulse" />
                )}
            </motion.button>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 100, scale: 0.9, transformOrigin: "bottom right" }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 100, scale: 0.9 }}
                        className="absolute bottom-14 sm:bottom-16 md:bottom-20 right-0 w-[calc(100vw-2rem)] sm:w-[350px] md:w-[400px] h-[60vh] sm:h-[500px] md:h-[600px] max-h-[70vh] bg-white dark:bg-zinc-950 rounded-2xl sm:rounded-[2rem] md:rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.3)] border border-border overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-4 sm:p-5 md:p-6 bg-zinc-50 dark:bg-zinc-900/50 border-b border-border flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-spice-gold to-amber-600 flex items-center justify-center p-0.5">
                                    <div className="w-full h-full bg-white dark:bg-zinc-900 rounded-[0.9rem] flex items-center justify-center">
                                        <img src={novelLogo} alt="Novel Exporters" className="w-7 h-7 object-contain" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold font-serif text-foreground">Novel Exporters</h3>
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-2 h-2 rounded-full bg-green-500" />
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Available to help now</span>
                                    </div>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="rounded-full">
                                <MinusCircle className="w-5 h-5 text-muted-foreground" />
                            </Button>
                        </div>

                        {/* Messages Area */}
                        <div
                            ref={scrollRef}
                            className="flex-grow overflow-y-auto p-6 space-y-6 custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/pinstripe-dark.png')] bg-fixed"
                        >
                            {history.map((msg, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[85%] p-4 rounded-2xl shadow-sm ${msg.role === 'user'
                                        ? 'bg-spice-gold text-black rounded-tr-none font-medium'
                                        : 'bg-zinc-100 dark:bg-zinc-800 text-foreground rounded-tl-none border border-border/50'
                                        }`}>
                                        <p className="text-sm leading-relaxed">{msg.parts[0].text}</p>
                                    </div>
                                </motion.div>
                            ))}
                            {isLoading && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex justify-start"
                                >
                                    <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-2xl rounded-tl-none border border-border/50">
                                        <div className="flex gap-1">
                                            <span className="w-1.5 h-1.5 bg-spice-gold rounded-full animate-bounce [animation-delay:-0.3s]" />
                                            <span className="w-1.5 h-1.5 bg-spice-gold rounded-full animate-bounce [animation-delay:-0.15s]" />
                                            <span className="w-1.5 h-1.5 bg-spice-gold rounded-full animate-bounce" />
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        {/* Input Area */}
                        <div className="p-6 bg-zinc-50 dark:bg-zinc-900/50 border-t border-border">
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleSend();
                                }}
                                className="relative flex items-center"
                            >
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Ask about origins, shipping or spices..."
                                    className="w-full bg-white dark:bg-zinc-800 border-border rounded-2xl pl-4 pr-14 py-4 text-sm focus:ring-2 ring-spice-gold/20 outline-none transition-all"
                                />
                                <Button
                                    type="submit"
                                    disabled={!input.trim() || isLoading}
                                    className="absolute right-2 w-10 h-10 rounded-xl bg-spice-gold hover:bg-amber-600 text-black flex items-center justify-center p-0 transition-transform active:scale-90"
                                >
                                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-black" /> : <Send className="w-4 h-4 text-black" />}
                                </Button>
                            </form>
                            <p className="text-[10px] text-center text-muted-foreground mt-4 font-medium uppercase tracking-tighter">
                                Powered by Google Gemma 3 4B • Novel Exporters Intelligence
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ChatBot;
