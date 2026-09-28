export function SequenceProgress({ status }) {
  if (!status) return null;

  const { phrase, sequence = [], currentIndex = 0, completed, completedPhrases = [] } = status;

  return (
    <div>
      <div className={`current-verse${completed && !phrase ? " success" : ""}`}>
        <p>{phrase || "تم تسميع السورة بنجاح!"}</p>
        {sequence.length > 0 && (
          <div className="character-sequence">
            {sequence.map((label, index) => (
              <div
                key={`${label}-${index}`}
                className={[
                  "character",
                  index < currentIndex ? "correct" : "",
                  index === currentIndex ? "current" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {label}
              </div>
            ))}
          </div>
        )}
      </div>

      {completedPhrases.length > 0 && (
        <div className="result-list">
          {completedPhrases.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      )}
    </div>
  );
}
