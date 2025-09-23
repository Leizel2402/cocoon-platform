import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ProgressBar } from "./ProgressBar";

export interface AddySearchBoxProps {
  onStartConversation?: (query: string) => void;
}

export function AddySearchBox({ onStartConversation }: AddySearchBoxProps) {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const stepInputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<"search" | "prequal">("search");
  const [query, setQuery] = useState("");
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
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

  const handleStepComplete = (stepData?: any) => {
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
    <div style={{ 
      background: "#fff", 
      border: "1px solid #e2e8f0", 
      borderRadius: 16, 
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)", 
      padding: 16,
      maxWidth: "800px",
      margin: "0 auto"
    }}>
      {/* Addy Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 13px 16px 0" }}>
        <span aria-hidden style={{ width: 13, height: 13, borderRadius: 999, background: "#2C5AA0", display: "inline-block" }} />
        <span style={{ fontSize: 19, color: "#64748b" }}>
          Hi, I'm <strong style={{ color: "#0f172a" }}>Addy</strong> — ready to help you find your next home.
          {mode === "search" ? " What can I help you find today?" : " Let me ask you a few questions to find the perfect match."}
        </span>
      </div>

      {/* Search Mode - Input Box + Chips */}
      {mode === "search" && (
        <>
          <form onSubmit={onSubmit}>
            <input 
              ref={inputRef}
              style={{ 
                width: "100%",
                padding: "16px 21px",
                border: "1px solid #e2e8f0",
                borderRadius: 11,
                fontSize: 19,
                outline: "none",
                transition: "border-color 0.2s"
              }}
              value={query} 
              onChange={(e) => setQuery(e.target.value)} 
              placeholder="Try: 2-bed near Riverside around $1,900, move-in in October"
              onFocus={(e) => e.target.style.borderColor = "#2C5AA0"}
              onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
            />
          </form>
          <div style={{ display: "flex", gap: 11, flexWrap: "wrap", marginTop: 13 }}>
            {suggestions.map((s) => (
              <button 
                key={s} 
                type="button" 
                style={{
                  padding: "8px 16px",
                  border: "1px solid #e2e8f0",
                  borderRadius: 8,
                  background: "#fff",
                  fontSize: 16,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  color: "#374151"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#2C5AA0";
                  e.currentTarget.style.background = "#f8fafc";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#e2e8f0";
                  e.currentTarget.style.background = "#fff";
                }}
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
        <div style={{ padding: "8px 0" }}>
          {/* Dynamic questions based on step */}
          {step === 0 && (
            <>
              <p style={{ margin: "0 0 16px", fontSize: 19 }}>Who do I have the pleasure of speaking with today?</p>
              <input 
                style={{ 
                  width: "100%",
                  padding: "16px 21px",
                  border: "1px solid #e2e8f0",
                  borderRadius: 11,
                  fontSize: 19,
                  outline: "none"
                }} 
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
              <p style={{ margin: "0 0 16px", fontSize: 19 }}>Perfect! Now, are you planning to bring any furry friends along?</p>
              <div style={{ display: "flex", gap: 11, flexWrap: "wrap" }}>
                {["Dog","Cat","Other","None"].map(p => (
                  <button 
                    key={p} 
                    style={{
                      padding: "11px 21px",
                      border: "1px solid #e2e8f0",
                      borderRadius: 8,
                      background: "#fff",
                      fontSize: 19,
                      cursor: "pointer",
                      transition: "all 0.2s"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "#2C5AA0";
                      e.currentTarget.style.background = "#f8fafc";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "#e2e8f0";
                      e.currentTarget.style.background = "#fff";
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