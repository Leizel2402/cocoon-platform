interface ProgressBarProps {
    current: number;
    total: number;
  }
  
  export function ProgressBar({ current, total }: ProgressBarProps) {
    const progress = (current / total) * 100;
    
    return (
      <div style={{ marginTop: 16 }}>
        <div style={{ 
          width: "100%", 
          height: 4, 
          background: "#e2e8f0", 
          borderRadius: 2,
          overflow: "hidden"
        }}>
          <div 
            style={{ 
              height: "100%", 
              background: "#2C5AA0", 
              borderRadius: 2,
              width: `${progress}%`,
              transition: "width 0.3s ease"
            }} 
          />
        </div>
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          fontSize: 12, 
          color: "#64748b", 
          marginTop: 6 
        }}>
          <span>Step {current} of {total}</span>
          <span>{Math.round(progress)}% complete</span>
        </div>
      </div>
    );
  }