import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ProgressBar } from "./ProgressBar";

export interface AddySearchBoxProps {
  onStartConversation?: (query: string) => void;
}

export function AddySearchBox({ onStartConversation }: AddySearchBoxProps) {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [mode] = useState<"search" | "prequal">("search");
  const [query, setQuery] = useState("");
  const [step, setStep] = useState(0);
  const [f, setF] = useState({
    first_name: "",
    description: "",
    pet_type: "" as "" | "Dog" | "Cat" | "Other" | "None",
    pet_name: "",
    adults: "",
    children: "",
    income_band: "",
    credit_band: "" as "" | "Excellent" | "Good" | "Fair" | "Rebuilding" | "Unsure",
    contact: "",
    consent: false,
  });

  const suggestions = [
    "2-bed in Southside under $1,800",
    "Move-in next month", 
    "Pet-friendly",
  ];

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      localStorage.setItem('searchQuery', query);
      if (onStartConversation) {
        onStartConversation(query);
      } else {
        navigate('/property-search');
      }
    }
  };
  const handlePrequalComplete = () => {
    // Store prequal data and navigate to property search
    localStorage.setItem('prequalData', JSON.stringify(f));
    navigate('/property-search');
  };

  const handleStepComplete = (stepData?: Partial<typeof f>) => {
    if (step < 6) {
      setStep(step + 1);
      if (stepData) {
        setF(prev => ({ ...prev, ...stepData }));
      }
    } else {
      // Last step completed, navigate to dashboard
      handlePrequalComplete();
    }
  };

  return (
    <div className="bg-gradient-to-br from-white to-slate-50 rounded-3xl shadow-2xl p-6 max-w-4xl mx-auto relative overflow-hidden border-2 border-transparent bg-clip-padding" style={{
      backgroundImage: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%), linear-gradient(135deg, #10b981, #3b82f6)",
      backgroundOrigin: "border-box",
      backgroundClip: "padding-box, border-box"
    }}>
      {/* Decorative background elements */}
      <div className="absolute -top-12 -right-12 w-24 h-24 bg-gradient-to-br from-green-500 to-blue-500 rounded-full opacity-10 z-0" />
      <div className="absolute -bottom-8 -left-8 w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-full opacity-10 z-0" />
      
      {/* Addy Header */}
      <div className="flex items-center gap-3 pb-5 relative z-10">
        <div className="w-4 h-4 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full shadow-lg shadow-green-500/30" />
        <span className="text-xl text-gray-700 leading-relaxed">
          Hi, I'm <strong className="text-gray-900 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">Addy</strong> — ready to help you find your next home.
          {mode === "search" ? " What can I help you find today?" : " Let me ask you a few questions to find the perfect match."}
        </span>
      </div>

      {/* Search Mode - Input Box + Chips */}
      {mode === "search" && (
        <>
          <form onSubmit={onSubmit} className="relative z-10">
            <div className="relative">
              <input 
                ref={inputRef}
                className="w-full py-3 px-6 border border-gray-200 rounded-xl text-lg outline-none transition-all duration-300
                 bg-white/90 backdrop-blur-sm shadow-md"
                value={query} 
                onChange={(e) => setQuery(e.target.value)} 
                placeholder="Try: 2-bed near Riverside around $1,900, move-in in October"
              />
              <div className={`absolute right-4 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full transition-opacity duration-300 ${query ? 'opacity-100' : 'opacity-30'}`} />
            </div>
          </form>
          <div className="flex gap-3 flex-wrap mt-5 relative z-10">
            {suggestions.map((s) => (
              <button 
                key={s} 
                type="button" 
                className="px-4 py-2 border border-gray-200 rounded-lg bg-white text-base cursor-pointer transition-all duration-300 text-gray-700 font-medium shadow-sm relative overflow-hidden hover:-translate-y-0.5 hover:shadow-lg hover:shadow-green-500/15 hover:bg-gradient-to-r hover:from-green-600 hover:to-emerald-600 hover:text-white"
                onClick={() => setQuery(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Prequal Mode - Questions */}
      {mode === "prequal" && (
        <div className="py-2 relative z-10">
          {/* Dynamic questions based on step */}
          {step === 0 && (
            <>
              <p className="mb-5 text-xl text-gray-700 font-medium leading-relaxed">Who do I have the pleasure of speaking with today?</p>
              <input 
                className="w-full py-5 px-6 border-2 border-gray-200 rounded-2xl text-lg outline-none transition-all duration-300 bg-white/90 backdrop-blur-sm shadow-md "
                placeholder="You can call me..." 
                onChange={(e) => setF(prev => ({ ...prev, first_name: e.target.value }))}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && f.first_name.trim()) {
                    handleStepComplete({ first_name: f.first_name });
                  }
                }}
              />
            </>
          )}
          
          {step === 1 && (
            <>
              <p className="mb-5 text-xl text-gray-700 font-medium leading-relaxed">Perfect! Now, are you planning to bring any furry friends along?</p>
              <div className="flex gap-3 flex-wrap">
                {["Dog","Cat","Other","None"].map(p => (
                  <button 
                    key={p} 
                    className="px-6 py-3.5 border-2 border-transparent rounded-xl bg-gradient-to-br from-white to-slate-50 text-lg cursor-pointer transition-all duration-300 text-gray-700 font-medium
                     shadow-sm relative overflow-hidden hover:-translate-y-0.5 hover:shadow-lg hover:shadow-green-500/15 hover:bg-gradient-to-r
                      hover:from-green-600 hover:to-emerald-600 hover:text-white"
                    style={{
                      backgroundImage: "linear-gradient(135deg, #ffffff, #f8fafc), linear-gradient(135deg, #10b981, #3b82f6)",
                      backgroundOrigin: "border-box",
                      backgroundClip: "padding-box, border-box"
                    }}
                    onClick={() => handleStepComplete({ pet_type: p as typeof f.pet_type })}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </>
          )}
          
          <ProgressBar current={1} total={7} />
        </div>
      )}
    </div>
  );
}