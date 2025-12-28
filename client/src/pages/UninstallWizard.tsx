import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, FileText, AlertCircle, Terminal as TerminalIcon } from "lucide-react";

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

const CRTOverlay = () => (
  <div className="fixed inset-0 pointer-events-none z-50 scanlines opacity-50 mix-blend-multiply" />
);

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
  const [history, setHistory] = useState<string[]>(["terminal v0.1 — type 'help' for commands"]);
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
      case "help": response = "commands: seeds, bravery, move, hope, patience, 2025, heartbreak, bloom, truth, reset"; break;
      case "seeds": response = "the day you plant the seed is not the day you eat the fruit. keep planting. keep watering. keep trusting even when you can't see anything growing. KEEP. FUCKING. PLANTING."; break;
      case "bravery": response = "you are not a coward. don't be a coward. no matter what. pursue what you really want. always tell the truth."; break;
      case "move": response = "you're not a tree. MOVE. pivot. change direction. start over. you can go literally anywhere from here. stop being scared and MOVE :-)"; break;
      case "hope": response = "God's Not Finished. there are so many tomorrows. so many versions of yourself you haven't met yet. good things you could never predict right around the corner. LFG :-)"; break;
      case "patience": response = "you're allowed to want things before they arrive. desire is life-affirming. wanting is not a sin. waiting is not punishment. you're exactly on time even when it doesn't feel like it."; break;
      case "2025": response = "you loved. you learned. you planted seeds in the dark. you're not who you were. you're exactly who you're becoming. AFFIRM!!!!!"; break;
      case "heartbreak": response = "you speedran through love and heartbreak and that's GOOD actually. tomorrow is beautiful. redirect accepted. God's Not Finished :-)"; break;
      case "bloom": response = "not everything you planted this year was meant to bloom this year. the garden remembers what you watered in the dark. trust the timing. trust the process. trust yourself."; break;
      case "truth": response = "i always speak my truth :-) i always get clarity :-) i never leave anything unsaid :-) AFFIRM!!!!!"; break;
      case "reset": 
        window.location.reload(); 
        return;
      case "cls": 
      case "clear": 
        setHistory([]); 
        setInput(""); 
        return;
      default: response = `command not found: ${cmd}`;
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
      className="text-6xl md:text-8xl italic mb-4 text-center animate-glitch px-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
    >
      UNINSTALL 2025.EXE
    </motion.h1>
    <motion.p 
      className="text-xl md:text-2xl mb-12"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
    >
      are you ready to let go?
    </motion.p>
    <motion.p 
      className="text-sm blink"
      animate={{ opacity: [0, 1, 0] }} transition={{ duration: 1.5, repeat: Infinity }}
    >
      click anywhere to begin
    </motion.p>
  </div>
);

const PreparingScreen = ({ onComplete }: { onComplete: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 3500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="flex flex-col items-center justify-center h-screen px-4 w-full">
      <p className="mb-4 text-xl">preparing to uninstall 2025.exe...</p>
      
      <div className="w-full max-w-2xl overflow-hidden whitespace-nowrap border-y border-[red] py-2 mb-8">
        <motion.div 
          className="inline-block"
          animate={{ x: ["100%", "-100%"] }}
          transition={{ duration: 20, ease: "linear", repeat: Infinity }}
        >
          heartbreak waiting growing breaking learning loving losing finding planting seeds trusting timing crying laughing wanting hoping doubting believing heartbreak waiting growing...
        </motion.div>
      </div>

      <ProgressBar progress={100} />
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

const WizardStep = ({ 
  step, 
  title, 
  content, 
  onNext, 
  buttonText = "next",
  showError = false,
  errorMessage = ""
}: { 
  step: string, 
  title: string, 
  content: React.ReactNode, 
  onNext: () => void,
  buttonText?: string,
  showError?: boolean,
  errorMessage?: string
}) => {
  const [showErr, setShowErr] = useState(showError);

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto p-8 relative">
      <div className="flex justify-between border-b border-[red] pb-2 mb-12">
        <span>UNINSTALL WIZARD</span>
        <span>{step}</span>
      </div>

      <div className="flex-1 flex flex-col justify-center gap-8">
        {showErr && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
            <ErrorDialog title="Error" message={errorMessage} onOk={() => setShowErr(false)} />
          </div>
        )}

        <div className="space-y-2">
          <h2 className="text-xl animate-pulse">{title}</h2>
          {typeof content === 'string' ? (
            <p className="text-2xl leading-relaxed">{content}</p>
          ) : (
            content
          )}
        </div>
      </div>

      <div className="flex justify-center pt-8 border-t border-[red]">
        <Button onClick={onNext}>{buttonText}</Button>
      </div>
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
    { name: "hope.exe", target: 73 },
    { name: "clarity.exe", target: 89 },
    { name: "bravery.exe", target: 100 },
    { name: "trust.exe", target: 100 },
    { name: "play.exe", target: 100 },
    { name: "levity.exe", target: 100 },
    { name: "badassery.exe", target: 100 },
    { name: "patience.exe", target: 31 },
    { name: "faith.exe", target: 100, infinite: true },
  ];
  
  const [currentItem, setCurrentItem] = useState(0);

  useEffect(() => {
    if (currentItem < items.length) {
       // Fake progress animation logic would go here, simplified for brevity
       const timer = setTimeout(() => {
         setCurrentItem(prev => prev + 1);
       }, 1500);
       return () => clearTimeout(timer);
    } else {
      setTimeout(onComplete, 2000);
    }
  }, [currentItem, onComplete]);

  return (
    <div className="flex flex-col items-center justify-center h-screen px-8 max-w-2xl mx-auto">
       <h2 className="text-2xl mb-8">installing 2026.exe...</h2>
       <div className="w-full space-y-4">
         {items.map((item, i) => (
           <div key={i} className={`transition-opacity duration-500 ${i > currentItem ? 'opacity-0' : 'opacity-100'}`}>
             <div className="flex justify-between text-sm mb-1">
               <span>installing {item.name}...</span>
               <span>{i < currentItem ? (item.infinite ? "∞" : "100%") : "..."}</span>
             </div>
             <div className="w-full border border-[red] h-4 p-0.5">
               <motion.div 
                 className="h-full bg-[red]"
                 initial={{ width: 0 }}
                 animate={{ width: i < currentItem ? "100%" : "0%" }}
               />
             </div>
           </div>
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

const FinalScreen = () => (
  <div className="flex flex-col items-center justify-center h-screen cursor-pointer animate-fade-in">
     <h1 className="text-4xl mb-4">installation complete.</h1>
     <p className="text-2xl mb-12">2026.exe is ready.</p>
     <p className="mb-4">ready to resume game?</p>
     <p className="text-sm blink">press any key to begin :-)</p>
  </div>
);

// --- Desktop Screen Logic (Complex) ---

const DesktopScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [files, setFiles] = useState<FileItem[]>([
    { id: "1", name: "cynicism.exe", type: "bad", x: 100, y: 100 },
    { id: "2", name: "bitterness.dll", type: "bad", x: 250, y: 150 },
    { id: "3", name: "self-doubt.txt", type: "bad", x: 150, y: 300 },
    { id: "4", name: "old-pain.zip", type: "bad", x: 50, y: 450 },
    { id: "5", name: "resentment.sys", type: "bad", x: 300, y: 400 },
    { id: "6", name: "fear.exe", type: "bad", x: 200, y: 550 },
    { id: "7", name: "cowardice.exe", type: "bad", x: 400, y: 200 },
    { id: "8", name: "hope.exe", type: "good", x: 600, y: 100 },
    { id: "9", name: "love.dll", type: "good", x: 700, y: 250 },
    { id: "10", name: "trust.sys", type: "good", x: 650, y: 400 },
    { id: "11", name: "faith.exe", type: "good", x: 800, y: 150 },
    { id: "12", name: "bravery.exe", type: "good", x: 750, y: 500 },
  ]);

  const [error, setError] = useState<{title: string, message: string} | null>(null);
  const trashRef = useRef<HTMLDivElement>(null);
  const [deletedBadCount, setDeletedBadCount] = useState(0);
  const [autoDeleting, setAutoDeleting] = useState(false);

  // Auto delete remaining bad files after user deletes a few
  useEffect(() => {
    if (deletedBadCount >= 2 && !autoDeleting) {
      setAutoDeleting(true);
    }
  }, [deletedBadCount]);

  useEffect(() => {
    if (autoDeleting) {
      const badFiles = files.filter(f => f.type === "bad");
      if (badFiles.length > 0) {
        const timer = setTimeout(() => {
          setFiles(prev => prev.filter(f => f.id !== badFiles[0].id));
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [autoDeleting, files]);

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
        setFiles(prev => prev.filter(f => f.id !== file.id));
        setDeletedBadCount(prev => prev + 1);
      } else {
        // Trigger error for good files
        const errors: Record<string, string> = {
          "hope.exe": "cannot delete hope.exe - file is protected by God's Not Finished.dll",
          "love.dll": "cannot delete love.dll - this file is required by your operating system",
          "trust.sys": "access denied - trust.sys is a critical system file",
          "patience.sys": "cannot delete patience.sys - still processing future operations",
          "faith.exe": "cannot remove faith.exe - needed for future operations",
          "bravery.exe": "cannot delete bravery.exe - you're going to need this"
        };
        setError({
          title: `Error deleting ${file.name}`,
          message: errors[file.name] || "cannot delete file - access denied"
        });
      }
    }
  };

  const badFilesLeft = files.filter(f => f.type === "bad").length;

  return (
    <div className="relative w-full h-full bg-white overflow-hidden p-4">
      {/* Top Bar */}
      <div className="absolute top-0 left-0 w-full border-b border-[red] px-4 py-2 flex justify-between items-center bg-white z-10">
        <span>my computer - 2025 cleanup</span>
        <span className="text-xs">drag unwanted files to trash</span>
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
            initial={{ x: file.x, y: file.y }}
            className="absolute flex flex-col items-center cursor-grab active:cursor-grabbing w-24 group z-20"
          >
            <FileText className="w-10 h-10 mb-1 group-hover:scale-110 transition-transform" strokeWidth={1} />
            <span className="text-xs text-center break-all">{file.name}</span>
          </motion.div>
        ))}
      </div>

      {/* Trash Bin */}
      <div 
        ref={trashRef}
        className="absolute bottom-8 right-8 flex flex-col items-center z-10"
      >
        <Trash2 className="w-16 h-16 mb-2" strokeWidth={1} />
        <span>trash</span>
      </div>

      {/* Continue Button */}
      {badFilesLeft === 0 && (
        <div className="absolute bottom-8 left-8 z-30">
          <Button onClick={onComplete} className="animate-pulse">
            all corrupted files removed. continue →
          </Button>
        </div>
      )}

      {/* Error Dialog */}
      {error && (
        <div className="fixed inset-0 bg-black/5 z-50 flex items-center justify-center pointer-events-auto">
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

export default function UninstallWizard() {
  const [screen, setScreen] = useState<Screen>("INTRO");
  const [userName, setUserName] = useState("");
  const [terminalOpen, setTerminalOpen] = useState(false);

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

  const renderContent = () => {
    switch(screen) {
      case "INTRO": return <IntroScreen onStart={() => setScreen("PREPARING")} />;
      case "PREPARING": return <PreparingScreen onComplete={() => setScreen("USER_ID")} />;
      case "USER_ID": return <UserIdScreen onComplete={() => setScreen("WIZARD_A")} userName={userName} setUserName={setUserName} />;
      
      case "WIZARD_A": return <WizardStep step="step 1 of 14" title="removing temporary files..." content="temporary files served their purpose in this version. sometimes you delete to make space for an upgrade. sometimes you delete to make space for something new. but holding on to them slows the system and processes down. clearing space for what's next..." onNext={() => setScreen("WIZARD_B")} />;
      
      case "WIZARD_B": return <WizardStep step="step 2 of 14" title="analyzing installed programs..." content="you learned how humans work better this year. including yourself. especially yourself. that alone is worth any heartbreak. you're not the same person who started this year. AFFIRM!!!!!" onNext={() => setScreen("WIZARD_C")} />;
      
      case "WIZARD_C": return <WizardStep step="step 3 of 14" title="scanning for corrupted narratives..." content="you know yourself best. trust your pattern recognition. you're allowed to trust yourself. you're allowed to believe what you see. TRUST YOURSELF." onNext={() => setScreen("WIZARD_D")} />;
      
      case "WIZARD_D": 
        return <WizardStep 
          step="step 4 of 14" 
          title="ERROR: cannot delete hope.exe" 
          showError={true}
          errorMessage="cannot delete hope.exe - file is protected"
          content={
            <div className="bg-red-50 p-6 border border-[red]">
               <h3 className="font-bold mb-4">God's Not Finished</h3>
               <p>some things refuse to be uninstalled. there are so many tomorrows you haven't seen yet. so many people you haven't met. so many versions of yourself you haven't become.</p>
            </div>
          }
          onNext={() => setScreen("WIZARD_E")} 
        />;

      case "WIZARD_E": return <WizardStep step="step 5 of 14" title="archiving lessons learned..." content="THE DAY YOU PLANT THE SEED IS NOT THE DAY YOU EAT THE FRUIT. don't forget everything you planted this year. you watered things in the dark. you trusted when you couldn't see. the garden remembers. the universe is keeping score. even the smallest seeds bloom one day. your seeds are still growing even if you can't see them yet KEEP PLANTING KEEP TRUSTING KEEP GOINGkjhsdfgjkhsdfg :-)" onNext={() => setScreen("WIZARD_F")} />;

      case "WIZARD_F": return <WizardStep step="step 6 of 14" title="removing broken shortcuts..." content="heartbreak redirected you. rejection protected you. stop trying to get back on the path. there is no path. you can always change direction. you're not stuck - you're just scared. you're not a tree - MOVE!!!! pivot. start over. for the love of God, don't be a coward. there are no shortcuts, darling." onNext={() => setScreen("WIZARD_G")} />;
      
      case "WIZARD_G": return <WizardStep step="step 7 of 14" title="WARNING: patience.exe is still processing..." content="not everything blooms on your timeline and that's okay. you're allowed to want things before they arrive. desire is life-affirming. wanting is not weakness. you don't have to be patient perfectly. you just have to keep going. God's Not Finished :-)" onNext={() => setScreen("WIZARD_H")} />;

      case "WIZARD_H": return <WizardStep step="step 8 of 14" title="scanning for corrupted files..." content="you speedran through love and heartbreak and growth and that's GOOD actually. you didn't run. you stayed present, open, vulnerable, and earnest even when it hurt. tomorrow is a beautiful thing. LFG :-)" onNext={() => setScreen("WIZARD_I")} />;

      case "WIZARD_I": return <WizardStep step="step 9 of 14" title="defragmenting memories..." content="you're not who you were in january. you're not who you'll be in december 2026. you're always becoming. you're always shedding skin. you're a different person every 4 weeks and that's the whole point. shedding is never comfortable. growth is supposed to feel like this." onNext={() => setScreen("WIZARD_J_DESKTOP")} />;

      case "WIZARD_J_DESKTOP": return <DesktopScreen onComplete={() => setScreen("WIZARD_K")} />;

      case "WIZARD_K": return <WizardStep step="step 11 of 14" title="compressing 2025..." content={
        <div className="flex flex-col gap-8 text-center">
           <p>save these lessons?</p>
           <div className="flex gap-4 justify-center">
             <Button onClick={() => { alert("good. you'll need them later."); setScreen("WIZARD_L"); }}>yes</Button>
             <Button onClick={() => { alert("good. you'll need them later."); setScreen("WIZARD_L"); }}>always</Button>
             <Button onClick={() => { alert("good. you'll need them later."); setScreen("WIZARD_L"); }}>already saved in my bones</Button>
           </div>
        </div>
      } onNext={() => setScreen("WIZARD_L")} />;

      case "WIZARD_L": return <WizardStep step="step 12 of 14" title="ERROR: cannot install cynicism.exe" content="you could close off. you could decide love isn't worth it. you could build walls. but you won't. because you're not a coward. LFG :-)" onNext={() => setScreen("WIZARD_M")} />;

      case "WIZARD_M": return <CascadingErrorsScreen onComplete={() => setScreen("TRANSITION")} />;

      case "TRANSITION":
        return (
          <div className="flex flex-col items-center justify-center h-screen text-center px-4">
            <h2 className="text-2xl mb-4">2025.exe successfully archived.</h2>
            <p className="mb-8">preparing to install 2026.exe...</p>
            <p className="text-xl italic">do your part. release the rest.</p>
            <div className="mt-8">
              <Button onClick={() => setScreen("INSTALLING_2026")}>proceed</Button>
            </div>
          </div>
        );

      case "INSTALLING_2026": return <Install2026Screen onComplete={() => setScreen("INTENTION")} />;

      case "INTENTION": return <IntentionScreen onComplete={() => setScreen("FINAL")} />;

      case "FINAL": return <FinalScreen />;

      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-white text-[red] font-serif overflow-hidden relative selection:bg-[red] selection:text-white">
      <CRTOverlay />
      {renderContent()}
      <Terminal isOpen={terminalOpen} onClose={() => setTerminalOpen(false)} />
    </div>
  );
}
