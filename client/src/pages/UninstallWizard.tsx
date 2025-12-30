import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, FileText, AlertCircle, Terminal as TerminalIcon, Zap } from "lucide-react";

// --- Types ---

type Screen =
  | "INTRO"
  | "PREPARING"
  | "USER_ID"
  | "WIZARD_A"
  | "WIZARD_B"
  | "WIZARD_C"
  | "WIZARD_D"
  | "WIZARD_E"
  | "WIZARD_F"
  | "WIZARD_G"
  | "WIZARD_H"
  | "WIZARD_I"
  | "DESKTOP_INTRO" // Intro to desktop cleanup
  | "WIZARD_J_DESKTOP" // Interactive Desktop
  | "WIZARD_K"
  | "WIZARD_L"
  | "WIZARD_M" // Cascading errors
  | "TRANSITION"
  | "INSTALLING_2026"
  | "INTENTION"
  | "FINAL";

type FileItem = {
  id: string;
  name: string;
  type: "good" | "bad";
  x: number;
  y: number;
};

// --- Helper Components ---

const GlitchText = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => {
  return (
    <motion.span 
      className={`relative inline-block ${className}`}
      whileHover={{ x: [0, -2, 2, -1, 0], color: ["#FF0000", "#FF0000", "#FF0000"] }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.span>
  );
};

const CRTOverlay = () => {
  const [flicker, setFlicker] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() < 0.05) {
        setFlicker(true);
        setTimeout(() => setFlicker(false), 50);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div className="fixed inset-0 pointer-events-none z-50 scanlines opacity-50 mix-blend-multiply" />
      {flicker && (
        <motion.div
          className="fixed inset-0 pointer-events-none z-50 bg-white"
          initial={{ opacity: 0.3 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.05 }}
        />
      )}
    </>
  );
};

const ProgressBar = ({ progress, label }: { progress: number, label?: string }) => (
  <div className="w-full max-w-md mx-auto my-4">
    {label && <div className="text-sm mb-1">{label}</div>}
    <div className="w-full border border-[red] h-6 p-0.5">
      <motion.div 
        className="h-full bg-[red]"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.5 }}
      />
    </div>
  </div>
);

const Button = ({ onClick, children, className = "" }: { onClick: () => void, children: React.ReactNode, className?: string }) => (
  <button 
    onClick={onClick}
    className={`border border-[red] px-6 py-2 hover:bg-[red] hover:text-white transition-colors duration-100 uppercase text-sm tracking-widest cursor-pointer ${className}`}
  >
    [{children}]
  </button>
);

const MatrixRain = ({ message = "loading..." }: { message?: string }) => {
  const chars = "01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン";
  const columns = 40;

  return (
    <div className="fixed inset-0 bg-white z-[200] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 font-mono text-xs overflow-hidden">
        {Array.from({ length: columns }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute top-0 whitespace-pre opacity-20"
            style={{ left: `${(i / columns) * 100}%` }}
            initial={{ y: -100 }}
            animate={{ y: window.innerHeight + 100 }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 2
            }}
          >
            {Array.from({ length: 30 }).map((_, j) => (
              <div key={j}>{chars[Math.floor(Math.random() * chars.length)]}</div>
            ))}
          </motion.div>
        ))}
      </div>
      <motion.div
        className="relative z-10 text-2xl text-center px-4 border border-[red] bg-white p-8"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center gap-4">
          <Zap className="w-6 h-6 animate-pulse" />
          <span>{message}</span>
          <Zap className="w-6 h-6 animate-pulse" />
        </div>
      </motion.div>
    </div>
  );
};

const ErrorDialog = ({ title, message, onOk }: { title: string, message: string, onOk: () => void }) => (
  <motion.div 
    initial={{ scale: 0.9, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white border border-[red] p-1 w-80 shadow-[4px_4px_0px_0px_rgba(255,0,0,0.2)] z-50"
  >
    <div className="bg-[red] text-white px-2 py-0.5 flex justify-between items-center text-xs mb-4">
      <span>{title}</span>
      <span onClick={onOk} className="cursor-pointer">X</span>
    </div>
    <div className="p-4 flex flex-col items-center gap-4 text-center">
      <AlertCircle className="w-8 h-8 text-[red]" strokeWidth={1} />
      <p className="text-sm">{message}</p>
      <button onClick={onOk} className="border border-[red] px-4 py-1 hover:bg-[red] hover:text-white text-xs mt-2 cursor-pointer">
        OK
      </button>
    </div>
  </motion.div>
);

const Terminal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>(["GAME CONSOLE v2026 — type 'help' for powerups"]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = input.trim().toLowerCase();
    let response = "";

    switch (cmd) {
      case "help": response = "POWERUPS AVAILABLE: levelup, newgame+, respawn, savefile, xp, checkpoint, godmode, inventory, stats"; break;
      case "levelup": response = "LEVEL UP! +100 wisdom, +50 resilience, +75 courage. you're not the same player who started this year. NEW SKILLS UNLOCKED: pattern recognition, self-trust, boundary setting. you're literally a different build now. KEEP GRINDING."; break;
      case "newgame+": response = "STARTING NEW GAME+ MODE... all your stats carry over. you keep the wisdom but lose the pain. 2026 is your second playthrough and you already know the controls. speedrun incoming :--)"; break;
      case "respawn": response = "RESPAWNING AT LAST CHECKPOINT... you're not stuck. you died and came back stronger. every restart is a second chance. pivot. change builds. respec your whole character if you want. THIS IS YOUR GAME."; break;
      case "savefile": response = "PROGRESS SAVED: lessons learned, seeds planted, growth documented. the universe auto-saves every moment. you can't lose what you've already unlocked. it's in your inventory forever."; break;
      case "xp": response = "CURRENT XP: heartbreak +1000, vulnerability +800, honesty +600, trust +400. pain is just XP in disguise. you're grinding even when it doesn't feel like it. KEEP PLAYING."; break;
      case "checkpoint": response = "CHECKPOINT REACHED: you made it through 2025. auto-save activated. you can always come back to this moment and remember how strong you were. God's Not Finished with your storyline."; break;
      case "godmode": response = "GODMODE DISABLED. you're human. you're supposed to take damage. the game is hard on purpose. but you have infinite continues and the final boss is just your own fear. you're gonna win eventually."; break;
      case "inventory": response = "CHECKING INVENTORY... you're carrying: love (unbreakable), hope (infinite uses), courage (rechargeable), resilience (legendary tier), growth (still equipped). you have everything you need."; break;
      case "stats": response = "bravery: incomplete. self-trust: work in progress. hope: holding steady. patience: barely started. heartbreak: processed. you're not maxed out yet. YOU WILL CONTINUE TO LEVEL UP UNTIL THE DAY YOU DIE :-)."; break;
      case "cls":
      case "clear":
        setHistory([]);
        setInput("");
        return;
      default: response = `command not found: ${cmd}. type 'help' for available powerups`;
    }

    setHistory([...history, `> ${input}`, response]);
    setInput("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-0 left-0 w-full h-48 bg-white border-t border-[red] p-4 font-mono text-xs z-[100] overflow-hidden flex flex-col shadow-[0_-4px_10px_rgba(255,0,0,0.1)]">
      <div className="flex-1 overflow-y-auto space-y-1 mb-2">
        {history.map((line, i) => (
          <div key={i} className="whitespace-pre-wrap">{line}</div>
        ))}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={handleCommand} className="flex gap-2 items-center">
        <span>{">"}</span>
        <input 
          ref={inputRef}
          autoFocus
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 bg-transparent border-none outline-none text-[red] placeholder-red-300"
          placeholder="type a command..."
        />
        <button type="button" onClick={onClose} className="text-[red] hover:underline">[x]</button>
      </form>
    </div>
  );
};

// --- Sub-Screens ---

const IntroScreen = ({ onStart }: { onStart: () => void }) => (
  <div className="flex flex-col items-center justify-center h-screen cursor-pointer" onClick={onStart}>
    <motion.h1
      className="text-6xl md:text-8xl italic mb-4 text-center px-4"
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1 }}
      whileHover={{ scale: 1.02 }}
    >
      UNINSTALL 2025.EXE
    </motion.h1>
    <motion.p
      className="text-xl md:text-2xl mb-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.8 }}
    >
      are you ready to let go?
    </motion.p>
    <motion.p
      className="text-sm"
      animate={{ opacity: [0.3, 1, 0.3] }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      click anywhere to begin
    </motion.p>
  </div>
);

const PreparingScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Animate progress bar
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    const timer = setTimeout(onComplete, 3500);
    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
    };
  }, [onComplete]);

  return (
    <div className="flex flex-col items-center justify-center h-screen px-4 w-full">
      <motion.p
        className="mb-12 text-xl"
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        preparing to uninstall 2025.exe...
      </motion.p>

      {/* Animated loading squares */}
      <div className="flex gap-3 mb-12">
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            className="w-4 h-4 border border-[red]"
            animate={{
              backgroundColor: ["rgba(255, 0, 0, 0)", "rgba(255, 0, 0, 1)", "rgba(255, 0, 0, 0)"],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      <div className="w-full max-w-md">
        <ProgressBar progress={progress} label={`${progress}%`} />
      </div>
    </div>
  );
};

const UserIdScreen = ({ onComplete, userName, setUserName }: { onComplete: () => void, userName: string, setUserName: (n: string) => void }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userName.trim()) onComplete();
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <form onSubmit={handleSubmit} className="flex flex-col items-center gap-6">
        <label className="text-xl">enter your name to continue:</label>
        <input 
          autoFocus
          type="text" 
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          className="border border-[red] px-4 py-2 bg-transparent text-center text-2xl outline-none w-64 focus:bg-red-50"
        />
        <Button onClick={() => userName.trim() && onComplete()}>continue</Button>
      </form>
    </div>
  );
};

const TypingText = ({ text, speed = 20 }: { text: string, speed?: number }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, text, speed]);

  return (
    <span>
      {displayedText}
      {currentIndex < text.length && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className="inline-block w-2 h-5 bg-[red] ml-1"
        />
      )}
    </span>
  );
};

const WizardStep = ({
  step,
  title,
  content,
  onNext,
  buttonText = "next",
  showError = false,
  errorMessage = "",
  useTyping = false,
  showProgress = true,
  userName = ""
}: {
  step: string,
  title: string,
  content: React.ReactNode,
  onNext: () => void,
  buttonText?: string,
  showError?: boolean,
  errorMessage?: string,
  useTyping?: boolean,
  showProgress?: boolean,
  userName?: string
}) => {
  const [showErr, setShowErr] = useState(showError);
  const [contentVisible, setContentVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setContentVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (showProgress && contentVisible) {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 2;
        });
      }, 40);
      return () => clearInterval(interval);
    }
  }, [showProgress, contentVisible]);

  return (
    <div className="flex flex-col h-screen items-center justify-center p-4 relative">
      {/* Windows-style window */}
      <motion.div
        className="w-full max-w-2xl border-2 border-[red] bg-white shadow-[4px_4px_0px_0px_rgba(255,0,0,0.3)]"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        {/* Title bar */}
        <div className="bg-[red] text-white px-3 py-1 flex justify-between items-center text-sm">
          <span>UNINSTALL WIZARD</span>
          <div className="flex gap-1">
            <span className="border border-white px-2 cursor-not-allowed">_</span>
            <span className="border border-white px-2 cursor-not-allowed">□</span>
            <span className="border border-white px-2 cursor-not-allowed">X</span>
          </div>
        </div>

        {/* Content area */}
        <div className="p-8">
          <motion.div
            className="text-xs mb-6 opacity-70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
          >
            {step}
          </motion.div>

          <div className="flex-1 flex flex-col justify-center gap-8 min-h-[300px]">
            {showErr && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
                <ErrorDialog title="Error" message={errorMessage} onOk={() => setShowErr(false)} />
              </div>
            )}

        <motion.div
          className="space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <motion.h2
            className="text-xl"
            initial={{ x: -10 }}
            animate={{ x: 0 }}
          >
            {title}
          </motion.h2>
          {contentVisible && (
            <>
              {typeof content === 'string' ? (
                <p className="text-2xl leading-relaxed">
                  {useTyping ? <TypingText text={content} speed={15} /> : content}
                </p>
              ) : (
                content
              )}
              {showProgress && (
                <div className="w-full max-w-md mt-8">
                  <div className="flex justify-between text-xs mb-1">
                    <span>processing...</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full border border-[red] h-4 p-0.5">
                    <motion.div
                      className="h-full bg-[red]"
                      style={{ width: `${progress}%` }}
                      transition={{ duration: 0.2 }}
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </motion.div>
      </div>

          <motion.div
            className="flex justify-end pt-8 border-t border-[red] mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Button onClick={onNext}>{buttonText}</Button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

const CascadingErrorsScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [errorIndex, setErrorIndex] = useState(0);
  const errors = [
    "ERROR: cannot delete love.exe - access denied",
    "ERROR: cannot remove hope.dll - system file protected by God's Not Finished",
    "ERROR: cannot uninstall faith.sys - required by future.exe",
    "ERROR: cannot remove growth.dll - permanently installed",
    "some things aren't meant to be uninstalled :-)"
  ];

  useEffect(() => {
    if (errorIndex < errors.length) {
      const timer = setTimeout(() => setErrorIndex(prev => prev + 1), 1500 + (errorIndex * 500));
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(onComplete, 3000);
      return () => clearTimeout(timer);
    }
  }, [errorIndex, onComplete]);

  return (
    <div className="h-screen relative overflow-hidden bg-white p-8">
      {errors.slice(0, errorIndex + 1).map((err, i) => (
        <motion.div 
          key={i}
          initial={{ opacity: 0, x: -20, y: -20 }}
          animate={{ opacity: 1, x: i * 20, y: i * 40 }}
          className="absolute top-20 left-10 bg-white border border-[red] p-4 shadow-[4px_4px_0_0_red] max-w-sm"
          style={{ zIndex: i, left: `${10 + (i * 5)}%`, top: `${10 + (i * 10)}%` }}
        >
           <div className="bg-[red] text-white px-2 py-0.5 text-xs mb-2 flex justify-between">
             <span>System Error</span>
             <span>X</span>
           </div>
           <div className="flex items-center gap-4">
             <AlertCircle className="w-8 h-8 text-[red]" strokeWidth={1} />
             <p>{err}</p>
           </div>
           <div className="mt-4 flex justify-center">
              <button className="border border-[red] px-4 text-xs">OK</button>
           </div>
        </motion.div>
      ))}
    </div>
  );
};

const Install2026Screen = ({ onComplete }: { onComplete: () => void }) => {
  const items = [
    { name: "hope.exe", target: 100, message: "installation complete" },
    { name: "clarity.exe", target: 100, message: "vision enhanced" },
    { name: "bravery.exe", target: 100, message: "fear removal complete" },
    { name: "trust.exe", target: 100, message: "self-trust protocol activated" },
    { name: "play.exe", target: 100, message: "levity mode enabled" },
    { name: "levity.exe", target: 100, message: "taking life lightly..." },
    { name: "badassery.exe", target: 100, message: "confidence restored" },
    { name: "patience.exe", target: 31, message: "still processing..." },
    { name: "faith.exe", target: 100, infinite: true, message: "God's.Not.Finished" },
  ];

  const [currentItem, setCurrentItem] = useState(0);
  const [progress, setProgress] = useState<number[]>(new Array(items.length).fill(0));

  useEffect(() => {
    if (currentItem < items.length) {
      // Animate progress bar for current item
      const targetProgress = items[currentItem].infinite ? 100 : items[currentItem].target;
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const newProgress = [...prev];
          if (newProgress[currentItem] < targetProgress) {
            newProgress[currentItem] = Math.min(newProgress[currentItem] + 5, targetProgress);
          }
          return newProgress;
        });
      }, 50);

      const timer = setTimeout(() => {
        clearInterval(progressInterval);
        setCurrentItem(prev => prev + 1);
      }, 1500);

      return () => {
        clearTimeout(timer);
        clearInterval(progressInterval);
      };
    } else {
      setTimeout(onComplete, 2000);
    }
  }, [currentItem, onComplete]);

  return (
    <div className="flex flex-col items-center justify-center h-screen px-8 max-w-2xl mx-auto">
      <motion.h2
        className="text-2xl mb-8"
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        installing 2026.exe...
      </motion.h2>
      <div className="w-full space-y-4">
        {items.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: i <= currentItem ? 1 : 0.3, x: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <div className="flex justify-between text-sm mb-1 font-bold">
              <span>
                {i === currentItem && ">"} {item.name}
              </span>
              <span>
                {i < currentItem
                  ? item.infinite
                    ? "∞"
                    : `${item.target}%`
                  : i === currentItem
                  ? `${progress[i]}%`
                  : "..."}
              </span>
            </div>
            <div className="w-full border border-[red] h-4 p-0.5">
              <motion.div
                className="h-full bg-[red]"
                style={{ width: `${progress[i]}%` }}
                animate={
                  item.infinite && i < currentItem
                    ? { opacity: [1, 0.5, 1] }
                    : {}
                }
                transition={{ duration: 1, repeat: Infinity }}
              />
            </div>
            {i < currentItem && progress[i] >= item.target && (
              <motion.p
                className="text-sm mt-1 font-bold"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {item.message}
              </motion.p>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const IntentionScreen = ({ onComplete }: { onComplete: () => void }) => (
  <div className="flex flex-col items-center justify-center h-screen px-4 max-w-lg mx-auto">
     <label className="text-2xl mb-8 text-center">what do you want to feel in 2026?</label>
     <textarea className="w-full h-32 border border-[red] p-4 text-[red] outline-none focus:bg-red-50 mb-2 resize-none"></textarea>
     <p className="text-xs mb-8">your answer is saved in your heart, not our database :-)</p>
     <div className="flex gap-4">
       <Button onClick={onComplete}>skip</Button>
       <Button onClick={onComplete}>continue</Button>
     </div>
  </div>
);

const DesktopIntroScreen = ({ onContinue }: { onContinue: () => void }) => (
  <div className="flex flex-col items-center justify-center h-screen px-4 max-w-3xl mx-auto">
    <motion.div
      className="text-center space-y-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <h2 className="text-3xl mb-8">time to clean up your system...</h2>
      <div className="text-xl space-y-6 leading-relaxed text-left border border-[red] p-8">
        <p>your computer is full of files from 2025.</p>
        <p>some of them are corrupted. some are toxic. some need to go.</p>
        <p className="font-bold">drag the corrupted files to the trash. </p>
        <p className="text-sm opacity-70">the good stuff can't be deleted - it's protected by something stronger than you.</p>
      </div>
      <Button onClick={onContinue} className="mt-8">
        begin cleanup →
      </Button>
    </motion.div>
  </div>
);

const FinalScreen = () => {
  const [showGlow, setShowGlow] = useState(false);
  const [easterEggFound, setEasterEggFound] = useState(false);
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  const [bouncePosition, setBouncePosition] = useState({ x: 50, y: 50 });
  const [bounceVelocity, setBounceVelocity] = useState({ x: 0.5, y: 0.5 });
  const [crystalBallMessage, setCrystalBallMessage] = useState("");
  const [showCrystalBall, setShowCrystalBall] = useState(false);

  const crystalBallPredictions = [
    "march.",
    "someone from before.",
    "closer than you think.",
    "you'll know when.",
    "impossible → possible.",
    "you already know.",
    "already starting.",
    "worth the wait.",
    "summer.",
    "rest is coming.",
    "exactly on time.",
    "different. better.",
    "stay ready.",
    "more laughter ahead."
  ];

  // Pick one fortune for this user session
  const [userFortune] = useState(() => {
    return crystalBallPredictions[Math.floor(Math.random() * crystalBallPredictions.length)];
  });

  useEffect(() => {
    const timer = setTimeout(() => setShowGlow(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (easterEggFound) return;

    const interval = setInterval(() => {
      setBouncePosition(prev => {
        let newX = prev.x + bounceVelocity.x;
        let newY = prev.y + bounceVelocity.y;
        let newVelX = bounceVelocity.x;
        let newVelY = bounceVelocity.y;

        if (newX <= 0 || newX >= 95) newVelX = -newVelX;
        if (newY <= 0 || newY >= 90) newVelY = -newVelY;

        setBounceVelocity({ x: newVelX, y: newVelY });
        return { x: Math.max(0, Math.min(95, newX)), y: Math.max(0, Math.min(90, newY)) };
      });
    }, 50);

    return () => clearInterval(interval);
  }, [bounceVelocity, easterEggFound]);

  const handleEasterEgg = () => {
    setEasterEggFound(true);
    setShowEasterEgg(true);
    setTimeout(() => setShowEasterEgg(false), 5000);
  };

  const handleCrystalBall = () => {
    setCrystalBallMessage(userFortune);
    setShowCrystalBall(true);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <motion.h1
        className="text-4xl mb-4"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
      >
        installation complete.
      </motion.h1>
      <motion.p
        className="text-2xl mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        2026.exe is ready.
      </motion.p>

      {/* Fortune Oracle */}
      <motion.div
        className="my-12 flex flex-col items-center gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5 }}
      >
        <motion.div
          className="text-center"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <p className="text-sm mb-2">what does 2026 hold for you?</p>
        </motion.div>
        <Button onClick={handleCrystalBall}>consult the oracle</Button>
      </motion.div>

      <motion.div
        className="text-center space-y-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
      >
        <p className="text-xl mb-2">this is your one life.</p>
        <p className="text-lg mb-6">
          <a
            href="https://thisisyouronelife.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-[red] hover:opacity-80 transition"
          >
            life is a video game
          </a>
          .
        </p>
        <p className="mb-4">ready to resume game?</p>
        <motion.p
          className="text-sm"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
         :-)
        </motion.p>
      </motion.div>

      {/* Bouncing Easter Egg - Video Game Style */}
      {!easterEggFound && (
        <motion.div
          onClick={(e) => { e.stopPropagation(); handleEasterEgg(); }}
          className="fixed cursor-pointer z-[9998] select-none font-mono"
          style={{
            left: `${bouncePosition.x}%`,
            top: `${bouncePosition.y}%`,
            fontSize: '2rem',
            filter: 'drop-shadow(0 0 8px rgba(255, 0, 0, 0.6))'
          }}
          animate={{
            scale: [1, 1.15, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          whileHover={{
            scale: 1.5,
            filter: 'drop-shadow(0 0 12px rgba(255, 0, 0, 1))'
          }}
        >
          [?]
        </motion.div>
      )}

      {/* Crystal Ball Modal - Window Style */}
      <AnimatePresence>
        {showCrystalBall && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white border-2 border-[red] w-full max-w-xl shadow-[4px_4px_0px_0px_rgba(255,0,0,0.3)] z-[9999]"
          >
            {/* Title bar */}
            <div className="bg-[red] text-white px-3 py-1 flex justify-between items-center text-sm">
              <span>2026 FORTUNE</span>
              <div className="flex gap-1">
                <span className="border border-white px-2 cursor-not-allowed">_</span>
                <span className="border border-white px-2 cursor-not-allowed">□</span>
                <span
                  className="border border-white px-2 cursor-pointer hover:bg-white hover:text-[red]"
                  onClick={() => setShowCrystalBall(false)}
                >
                  X
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-8">
              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <p className="text-3xl mb-6 leading-relaxed">{crystalBallMessage}</p>
                <p className="text-xs opacity-70">the future is already written in your actions today</p>
              </motion.div>

              <div className="flex justify-center mt-8">
                <Button onClick={() => setShowCrystalBall(false)}>close</Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Easter Egg Modal */}
      <AnimatePresence>
        {showEasterEgg && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white border-2 border-[red] p-8 max-w-md shadow-[8px_8px_0px_0px_rgba(255,0,0,0.3)] z-[9999]"
          >
            <div className="bg-[red] text-white px-3 py-1 text-sm mb-4 -mx-8 -mt-8">
              SECRET INSTALLATION
            </div>
            <div className="text-center space-y-4">
              <p className="text-2xl mb-4">installing wonder.sys...</p>
              <motion.div
                className="w-full border border-[red] h-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <motion.div
                  className="h-full bg-[red]"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2 }}
                />
              </motion.div>
              <p className="text-sm mt-4 italic">
                don't lose your sense of wonder. don't forget how to be delighted by small things.
                stay curious. stay playful. the world needs people who never stopped marveling at it.
              </p>
              <p className="text-xs opacity-70 mt-2">
                installation complete. this can't be uninstalled :-)
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {showGlow && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.1, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <div className="absolute inset-0 bg-gradient-radial from-red-500/10 to-transparent" />
        </motion.div>
      )}
    </div>
  );
};

// --- Desktop Screen Logic (Complex) ---

const DesktopScreen = ({ onComplete, userName }: { onComplete: () => void, userName: string }) => {
  const [files, setFiles] = useState<FileItem[]>([
    // Bad files to delete
    { id: "1", name: "cynicism.exe", type: "bad", x: 100, y: 100 },
    { id: "2", name: "bitterness.dll", type: "bad", x: 250, y: 150 },
    { id: "3", name: "self-doubt.txt", type: "bad", x: 150, y: 300 },
    { id: "4", name: "old-pain.zip", type: "bad", x: 50, y: 450 },
    { id: "5", name: "resentment.sys", type: "bad", x: 300, y: 400 },
    { id: "6", name: "fear.exe", type: "bad", x: 200, y: 550 },
    { id: "7", name: "cowardice.exe", type: "bad", x: 400, y: 200 },
    // Good files that already exist (different from what we'll install)
    { id: "8", name: "love.dll", type: "good", x: 600, y: 100 },
    { id: "9", name: "growth.exe", type: "good", x: 700, y: 250 },
    { id: "10", name: "resilience.sys", type: "good", x: 650, y: 400 },
    { id: "11", name: "wisdom.dll", type: "good", x: 800, y: 150 },
    { id: "12", name: "courage.exe", type: "good", x: 750, y: 500 },
  ]);

  const [error, setError] = useState<{title: string, message: string} | null>(null);
  const trashRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleDragEnd = (file: FileItem, info: any) => {
    // Simple collision detection with trash bin (bottom right)
    const trashRect = trashRef.current?.getBoundingClientRect();
    if (!trashRect) return;

    // Check if drop point is within trash area
    // info.point is absolute page coordinates
    const dropX = info.point.x;
    const dropY = info.point.y;

    if (
      dropX >= trashRect.left &&
      dropX <= trashRect.right &&
      dropY >= trashRect.top &&
      dropY <= trashRect.bottom
    ) {
      if (file.type === "bad") {
        // Play delete sound
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch(e => console.log('Audio play failed:', e));
        }

        setFiles(prev => prev.filter(f => f.id !== file.id));
      } else {
        // Trigger error for good files
        const errors: Record<string, string> = {
          "love.dll": "cannot delete love.dll - this file is required by your operating system",
          "growth.exe": "cannot delete growth.exe - still processing transformations",
          "resilience.sys": "access denied - resilience.sys is a critical system file",
          "wisdom.dll": "cannot remove wisdom.dll - earned through experience, cannot be uninstalled",
          "courage.exe": "cannot delete courage.exe - you're going to need this"
        };
        setError({
          title: `Error deleting ${file.name}`,
          message: errors[file.name] || "cannot delete file - access denied"
        });
      }
    }
  };

  const badFilesLeft = files.filter(f => f.type === "bad").length;
  const goodFilesLeft = files.filter(f => f.type === "good").length;
  const [showModal, setShowModal] = useState(false);

  // Show modal when all bad files are deleted
  useEffect(() => {
    console.log('🔍 Bad files:', badFilesLeft);
    console.log('🔍 Good files:', goodFilesLeft);
    console.log('🔍 Total files:', files.length);

    if (badFilesLeft === 0 && goodFilesLeft > 0 && !showModal) {
      console.log('✅ All bad files deleted! Showing modal...');
      // Small delay to ensure smooth transition
      setTimeout(() => setShowModal(true), 300);
    }
  }, [badFilesLeft, goodFilesLeft, files.length, showModal]);

  return (
    <div className="relative w-full h-screen bg-white overflow-hidden p-4">
      {/* Audio element for delete sound */}
      <audio ref={audioRef} preload="auto">
        <source src="/sounds/crumple-03-40747.mp3" type="audio/mpeg" />
      </audio>

      {/* Top Bar */}
      <div className="absolute top-0 left-0 w-full border-b border-[red] px-4 py-2 flex justify-between items-center bg-white z-10">
        <span>{userName}'s system</span>
        <div className="flex gap-4 items-center">
          <span className="text-xs">drag unwanted files to trash. let go of what doesn't serve you.</span>
        </div>
      </div>

      {/* Files */}
      <div className="mt-10 w-full h-full relative">
        {files.map(file => (
          <motion.div
            key={file.id}
            drag
            dragMomentum={false}
            dragConstraints={{ left: 0, top: 0, right: window.innerWidth - 100, bottom: window.innerHeight - 100 }}
            onDragEnd={(_, info) => handleDragEnd(file, info)}
            initial={{ x: file.x, y: file.y, opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="absolute flex flex-col items-center cursor-grab active:cursor-grabbing w-24 group z-20"
          >
            <FileText
              className={`w-10 h-10 mb-1 group-hover:scale-110 transition-transform ${
                file.type === "bad" ? "text-[red]" : "text-black"
              }`}
              strokeWidth={1}
            />
            <span className={`text-xs text-center break-all ${
              file.type === "bad" ? "text-[red]" : "text-black"
            }`}>{file.name}</span>
          </motion.div>
        ))}
      </div>

      {/* Trash Bin */}
      <motion.div
        ref={trashRef}
        className="absolute bottom-8 left-8 flex flex-col items-center z-10"
        animate={{
          scale: badFilesLeft > 0 && badFilesLeft < 7 ? [1, 1.1, 1] : 1
        }}
        transition={{ duration: 0.5, repeat: badFilesLeft > 0 ? Infinity : 0 }}
      >
        <Trash2 className="w-16 h-16 mb-2" strokeWidth={1} />
        <span>trash</span>
      </motion.div>

      {/* Continue Modal - SIMPLE VERSION */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999]"
            style={{
              backgroundColor: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              style={{
                border: '4px solid red',
                backgroundColor: 'white',
                padding: '3rem',
                maxWidth: '600px',
                margin: '0 1rem',
                textAlign: 'center'
              }}
            >
              <h2 style={{ fontSize: '2rem', marginBottom: '2rem', fontWeight: 'bold' }}>
                ALL CORRUPTED FILES REMOVED
              </h2>
              <p style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>
                the bad stuff is gone. the good stuff? that's protected. that stays with you.
              </p>
              <p style={{ fontSize: '1rem', marginBottom: '2rem', opacity: 0.7 }}>
                love, growth, resilience, wisdom, courage - these cannot be uninstalled.
              </p>
              <button
                onClick={onComplete}
                style={{
                  border: '1px solid red',
                  padding: '0.75rem 2rem',
                  backgroundColor: 'red',
                  color: 'white',
                  fontSize: '1.2rem',
                  cursor: 'pointer',
                  fontFamily: 'Times New Roman, serif',
                  fontStyle: 'italic'
                }}
              >
                [continue →]
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Dialog */}
      {error && (
        <div className="fixed inset-0 bg-black/10 z-[150] flex items-center justify-center pointer-events-auto">
          <ErrorDialog
            title={error.title}
            message={error.message}
            onOk={() => setError(null)}
          />
        </div>
      )}
    </div>
  );
};


// --- Main Application ---

// Progress bar component
const GlobalProgressBar = ({ currentStep, totalSteps }: { currentStep: number, totalSteps: number }) => {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="fixed bottom-0 left-0 w-full bg-white border-t border-[red] p-2 z-[300]">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between text-xs mb-1">
          <span>uninstalling 2025.exe...</span>
          <span>{currentStep} / {totalSteps} complete ({Math.round(progress)}%)</span>
        </div>
        <div className="w-full h-3 border border-[red]">
          <motion.div
            className="h-full bg-[red]"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>
    </div>
  );
};

export default function UninstallWizard() {
  const [screen, setScreen] = useState<Screen>("INTRO");
  const [userName, setUserName] = useState("");
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("loading...");

  // Key listener for Terminal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "`") {
        setTerminalOpen(prev => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Helper to transition with loading screen
  const transitionToScreen = (nextScreen: Screen, message: string = "loading...") => {
    setIsLoading(true);
    setLoadingMessage(message);
    setTimeout(() => {
      setScreen(nextScreen);
      setIsLoading(false);
    }, 2000);
  };

  // Get current step number for progress bar
  const getCurrentStep = (): number => {
    const stepMap: Record<Screen, number> = {
      "INTRO": 0,
      "PREPARING": 1,
      "USER_ID": 2,
      "WIZARD_A": 3,
      "WIZARD_B": 4,
      "WIZARD_C": 5,
      "WIZARD_D": 6,
      "WIZARD_E": 7,
      "WIZARD_F": 8,
      "WIZARD_G": 9,
      "WIZARD_H": 10,
      "WIZARD_I": 11,
      "DESKTOP_INTRO": 12,
      "WIZARD_J_DESKTOP": 13,
      "WIZARD_K": 14,
      "WIZARD_L": 15,
      "WIZARD_M": 16,
      "TRANSITION": 17,
      "INSTALLING_2026": 18,
      "INTENTION": 19,
      "FINAL": 20
    };
    return stepMap[screen] || 0;
  };

  const totalSteps = 20;

  const renderContent = () => {
    switch(screen) {
      case "INTRO": return <IntroScreen onStart={() => setScreen("PREPARING")} />;
      case "PREPARING": return <PreparingScreen onComplete={() => transitionToScreen("USER_ID", "initializing uninstall wizard...")} />;
      case "USER_ID": return <UserIdScreen onComplete={() => transitionToScreen("WIZARD_A", `hello ${userName}, loading your data...`)} userName={userName} setUserName={setUserName} />;

      case "WIZARD_A": return <WizardStep step="step 1 of 14" title="removing temporary files..." content={`${userName}, temporary files served their purpose in this version. sometimes you delete to make space for an upgrade. sometimes you delete to make space for something new. but holding on to them slows the system and processes down. clearing space for what's next...`} onNext={() => setScreen("WIZARD_B")} useTyping={true} userName={userName} />;

      case "WIZARD_B": return <WizardStep step="step 2 of 14" title="analyzing installed programs..." content="you learned how humans work better this year. including yourself. especially yourself. you're not the same person who started this year. AFFIRM!!!!!" onNext={() => setScreen("WIZARD_C")} useTyping={true} userName={userName} />;

      case "WIZARD_C": return <WizardStep step="step 3 of 14" title="scanning for corrupted narratives..." content="you know yourself best. trust your pattern recognition. you're allowed to trust yourself. you're allowed to believe what you see. TRUST YOURSELF." onNext={() => setScreen("WIZARD_D")} useTyping={true} userName={userName} />;
      
      case "WIZARD_D":
        return <WizardStep
          step="step 4 of 14"
          title="ERROR: cannot delete hope.exe"
          showError={true}
          errorMessage="cannot delete hope.exe - file is protected"
          content={
            <div className="bg-red-50 p-6 border border-[red]">
               <p>some things refuse to be uninstalled. there are so many tomorrows you haven't seen yet. so many people you haven't met. so many versions of yourself you haven't become.</p>
            </div>
          }
          onNext={() => setScreen("WIZARD_E")}
          userName={userName}
        />;

      case "WIZARD_E": return <WizardStep step="step 5 of 14" title="archiving lessons learned..." content={`THE DAY YOU PLANT THE SEED IS NOT THE DAY YOU EAT THE FRUIT. ${userName}, don't forget everything you planted this year. you watered things in the dark. you trusted when you couldn't see. the garden remembers. the universe is keeping score. even the smallest seeds bloom one day. your seeds are still growing even if you can't see them yet KEEP PLANTING KEEP TRUSTING KEEP GOINGkjhsdfgjkhsdfg :-)`} onNext={() => setScreen("WIZARD_F")} userName={userName} />;

      case "WIZARD_F": return <WizardStep step="step 6 of 14" title="removing broken shortcuts..." content="heartbreak redirected you. rejection protected you. stop trying to get back on the path. there is no path. you can always change direction. you're not stuck - you're just scared. you're not a tree - MOVE!!!! pivot. start over. for the love of God, don't be a coward. there are no shortcuts, darling." onNext={() => setScreen("WIZARD_G")} userName={userName} />;

      case "WIZARD_G": return <WizardStep step="step 7 of 14" title="WARNING: patience.exe is still processing..." content="not everything blooms on your timeline and that's okay. you're allowed to want things before they arrive. desire is life-affirming. you don't have to be patient perfectly. you just have to keep going. God's Not Finished." onNext={() => setScreen("WIZARD_H")} userName={userName} />;

      case "WIZARD_H": return <WizardStep step="step 8 of 14" title="removing attachment to timelines and outcomes..." content={`${userName}, you speedran through love and heartbreak and growth and that's GOOD actually. you didn't run. you stayed present, open, vulnerable, and earnest even when it hurt. tomorrow is a beautiful thing. LFG :-)`} onNext={() => setScreen("WIZARD_I")} userName={userName} />;

      case "WIZARD_I": return <WizardStep step="step 9 of 14" title="reorganizing fragmented experiences..." content="you're not who you were in january. you're not who you'll be in december 2026. you're always becoming. you're always shedding skin. you're a different person every 4 weeks and that's the whole point. shedding is never comfortable. growth is supposed to feel like this." onNext={() => setScreen("DESKTOP_INTRO")} userName={userName} />;

      case "DESKTOP_INTRO": return <DesktopIntroScreen onContinue={() => setScreen("WIZARD_J_DESKTOP")} />;

      case "WIZARD_J_DESKTOP": return <DesktopScreen onComplete={() => transitionToScreen("WIZARD_K", "cleaning up system files...")} userName={userName} />;

      case "WIZARD_K": return <WizardStep step="step 11 of 14" title="compressing 2025..." content={
        <div className="flex flex-col gap-8 text-center">
           <p>save these lessons?</p>
           <div className="flex gap-4 justify-center">
             <Button onClick={() => { alert("good. you'll need them later."); transitionToScreen("TRANSITION", "finalizing 2025 archive..."); }}>yes</Button>
             <Button onClick={() => { alert("good. you'll need them later."); transitionToScreen("TRANSITION", "finalizing 2025 archive..."); }}>always</Button>
             <Button onClick={() => { alert("good. you'll need them later."); transitionToScreen("TRANSITION", "finalizing 2025 archive..."); }}>already saved in my bones</Button>
           </div>
        </div>
      } onNext={() => transitionToScreen("TRANSITION", "finalizing 2025 archive...")} userName={userName} />;

      case "TRANSITION":
        return (
          <div className="flex flex-col items-center justify-center h-screen text-center px-4">
            <motion.h2
              className="text-2xl mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              2025.exe successfully archived.
            </motion.h2>
            <motion.p
              className="mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              preparing to install 2026.exe...
            </motion.p>
            <motion.p
              className="text-xl italic mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              do your part. release the rest.
            </motion.p>
            <motion.div
              className="mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
            >
              <Button onClick={() => transitionToScreen("INSTALLING_2026", "preparing installation...")}>proceed</Button>
            </motion.div>
          </div>
        );

      case "INSTALLING_2026": return <Install2026Screen onComplete={() => transitionToScreen("INTENTION", "finalizing setup...")} />;

      case "INTENTION": return <IntentionScreen onComplete={() => setScreen("FINAL")} />;

      case "FINAL": return <FinalScreen />;

      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-white text-[red] font-serif overflow-hidden relative selection:bg-[red] selection:text-white pb-16">
      <CRTOverlay />


      {/* Terminal Toggle Button */}
      <motion.button
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={() => setTerminalOpen(!terminalOpen)}
        className="fixed bottom-4 right-4 z-[200] border border-[red] px-3 py-1 bg-white hover:bg-[red] hover:text-white transition-colors text-xs"
        title="Press ` to toggle terminal"
      >
        [terminal]
      </motion.button>

      <AnimatePresence mode="wait">
        {isLoading ? (
          <MatrixRain key="loading" message={loadingMessage} />
        ) : (
          <motion.div
            key={screen}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderContent()}
          </motion.div>
        )}
      </AnimatePresence>
      <Terminal isOpen={terminalOpen} onClose={() => setTerminalOpen(false)} />
      {screen !== "INTRO" && screen !== "FINAL" && (
        <GlobalProgressBar currentStep={getCurrentStep()} totalSteps={totalSteps} />
      )}
    </div>
  );
}
