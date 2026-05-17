import { useState, useEffect } from "react";
import managementTopicData from "./Management.json";
import managementChapterData from "./extracted_100_per_chp_custom_management.json";

// Shuffle function
function shuffleArray(arr) {
  let newArr = [...arr];

  for (let i = newArr.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }

  return newArr;
}

const subjectSources = {
  Management: {
    topic: managementTopicData,
    chapter: managementChapterData,
  },
};

function App() {
  const [mode, setMode] = useState("topic");

  const subjectData = subjectSources.Management;
  const data = mode === "topic" ? subjectData.topic : subjectData.chapter;
  const chapters = Object.keys(data || {});

  const [selectedChapter, setSelectedChapter] = useState(
    () => chapters[0] || ""
  );

  const [selectedTopic, setSelectedTopic] = useState(null);

  const [shuffledQuestions, setShuffledQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [hoveredOption, setHoveredOption] = useState(null);

  useEffect(() => {
    const currentData =
      mode === "topic" ? subjectData.topic : subjectData.chapter;

    const firstChapter = Object.keys(currentData || {})[0] || "";

    setSelectedChapter(firstChapter);

    if (mode === "topic" && currentData && firstChapter) {
      setSelectedTopic(
        Object.keys(currentData[firstChapter] || {})[0] || null
      );
    } else {
      setSelectedTopic(null);
    }
  }, [mode, subjectData.chapter, subjectData.topic]);

  // Reset Quiz
  const resetQuiz = () => {
    setCurrentQ(0);
    setSelected(null);
    setShowAnswer(false);
    setCorrectCount(0);
    setWrongCount(0);
  };

  useEffect(() => {
    const currentData =
      mode === "topic" ? subjectData.topic : subjectData.chapter;

    if (!currentData || !selectedChapter) return;

    let qs =
      mode === "topic"
        ? currentData[selectedChapter]?.[selectedTopic] || []
        : currentData[selectedChapter] || [];

    if (qs.length > 0) {
      let newQs = qs.map((q) => ({
        ...q,
        options: shuffleArray(q.options),
      }));

      setShuffledQuestions(shuffleArray(newQs));
    } else {
      setShuffledQuestions([]);
    }

    resetQuiz();
  }, [mode, selectedChapter, selectedTopic, subjectData.chapter, subjectData.topic]);

  // Option Click
  const handleOptionClick = (opt) => {
    setSelected(opt);
    setShowAnswer(true);

    if (opt === shuffledQuestions[currentQ].answer) {
      setCorrectCount((prev) => prev + 1);
    } else {
      setWrongCount((prev) => prev + 1);
    }
  };

  // Next Question
  const handleNext = () => {
    setCurrentQ((prev) => prev + 1);
    setSelected(null);
    setShowAnswer(false);
  };

  // Chapter Change
  const handleChapterChange = (chp) => {
    setSelectedChapter(chp);

    if (mode === "topic") {
      const topics = Object.keys(subjectData.topic[chp] || {});
      setSelectedTopic(topics[0] || null);
    }
  };

  const totalQuestions = shuffledQuestions.length;

  const isFinished =
    totalQuestions > 0 && currentQ >= totalQuestions;

  const percentage =
    totalQuestions > 0
      ? ((correctCount / totalQuestions) * 100).toFixed(1)
      : 0;

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Management Quiz</h1>

        {/* Subject + Mode */}
        <div style={styles.modeContainer}>


          <div style={styles.btnGroup}>
            <button
              onClick={() => setMode("topic")}
              style={{
                ...styles.modeBtn,
                ...(mode === "topic" ? styles.activeBtn : {}),
              }}
            >
              Topic
            </button>

            <button
              onClick={() => setMode("chapter")}
              style={{
                ...styles.modeBtn,
                ...(mode === "chapter" ? styles.activeBtn : {}),
              }}
            >
              Chapter
            </button>
          </div>
        </div>

        {/* Chapter */}
        <label style={styles.label}>Select Chapter</label>

        <select
          value={selectedChapter}
          onChange={(e) => handleChapterChange(e.target.value)}
          style={styles.select}
        >
          {chapters.map((chp) => (
            <option key={chp} value={chp}>
              {chp}
            </option>
          ))}
        </select>

        {/* Topic */}
        {mode === "topic" && selectedChapter && (
          <>
            <label style={styles.label}>Select Topic</label>

            <select
              value={selectedTopic || ""}
              onChange={(e) => setSelectedTopic(e.target.value)}
              style={styles.select}
            >
              {Object.keys(
                subjectData.topic[selectedChapter] || {}
              ).map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </>
        )}

        <hr style={styles.divider} />

        {/* No Questions */}
        {totalQuestions === 0 ? (
          <p style={{ textAlign: "center", color: "#cbd5e1" }}>
            No questions found for this selection.
          </p>
        ) : isFinished ? (
          // Result Screen
          <div style={{ textAlign: "center" }}>
            <h2 style={{ color: "#22c55e", fontSize: "30px" }}>
              Quiz Finished 🎉
            </h2>

            <div style={styles.scoreBoard}>
              <p style={styles.bigScore}>{percentage}%</p>

              <p style={styles.resultText}>
                You answered {correctCount} out of{" "}
                {totalQuestions} correctly
              </p>

              <div style={styles.resultStats}>
                <span style={{ color: "#22c55e" }}>
                  ✅ {correctCount}
                </span>

                <span style={{ color: "#ef4444" }}>
                  ❌ {wrongCount}
                </span>
              </div>
            </div>

            <button onClick={resetQuiz} style={styles.nextBtn}>
              Restart Quiz
            </button>
          </div>
        ) : (
          <>
            {/* Progress */}
            <div style={styles.progressBarContainer}>
              <div
                style={{
                  ...styles.progressBar,
                  width: `${
                    ((currentQ + 1) / totalQuestions) * 100
                  }%`,
                }}
              />
            </div>

            {/* Stats */}
            <div style={styles.statsRow}>
              <span>
                Question {currentQ + 1} / {totalQuestions}
              </span>

              <span>
                Score: {correctCount}
              </span>
            </div>

            {/* Question */}
            <p style={styles.question}>
              {shuffledQuestions[currentQ]?.question}
            </p>

            {/* Options */}
            {shuffledQuestions[currentQ]?.options.map(
              (opt, i) => {
                let optionStyle = { ...styles.option };

                if (showAnswer) {
                  if (
                    opt ===
                    shuffledQuestions[currentQ].answer
                  ) {
                    optionStyle = {
                      ...optionStyle,
                      ...styles.correctOption,
                    };
                  } else if (opt === selected) {
                    optionStyle = {
                      ...optionStyle,
                      ...styles.wrongOption,
                    };
                  }
                }

                return (
                  <button
                    key={i}
                    onClick={() => handleOptionClick(opt)}
                    onMouseEnter={() => setHoveredOption(i)}
                    onMouseLeave={() => setHoveredOption(null)}
                    disabled={showAnswer}
                    style={{
                      ...optionStyle,
                      ...(hoveredOption === i && !showAnswer
                        ? styles.optionHover
                        : {}),
                    }}
                  >
                    <span style={styles.optionLetter}>
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span>{opt}</span>
                  </button>
                );
              }
            )}

            {/* Explanation */}
            {showAnswer && (
              <div style={styles.explanation}>
                <p style={styles.explanationTitle}>
                  Explanation
                </p>

                <p style={styles.expText}>
                  {
                    shuffledQuestions[currentQ]
                      .explanation
                  }
                </p>

                <button
                  onClick={handleNext}
                  style={styles.nextBtn}
                >
                  {currentQ + 1 === totalQuestions
                    ? "View Results"
                    : "Next Question"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "#020617",
    backgroundImage:
      "radial-gradient(circle at top left, rgba(59,130,246,0.15), transparent 30%), radial-gradient(circle at bottom right, rgba(168,85,247,0.12), transparent 30%)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "25px",
    fontFamily: "'Inter', sans-serif",
    color: "#f8fafc",
  },

  card: {
    width: "100%",
    maxWidth: "520px",
    background: "#0f172a",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "24px",
    padding: "24px",
    boxShadow: "0 20px 45px rgba(0,0,0,0.5)",
  },

  title: {
    textAlign: "center",
    fontSize: "34px",
    fontWeight: "900",
    marginBottom: "28px",
    color: "#f8fafc",
    letterSpacing: "1px",
  },

  modeContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    marginBottom: "25px",
  },

  selectSubject: {
    width: "100%",
    padding: "14px 18px",
    borderRadius: "14px",
    border: "1px solid #334155",
    background: "#1e293b",
    color: "#f8fafc",
    fontWeight: "700",
    fontSize: "16px",
    outline: "none",
    cursor: "pointer",
    appearance: "none",
    WebkitAppearance: "none",
    MozAppearance: "none",
    backgroundImage:
      "linear-gradient(45deg, transparent 50%, #cbd5e1 50%), linear-gradient(135deg, #cbd5e1 50%, transparent 50%)",
    backgroundPosition: "calc(100% - 18px) calc(50% - 3px), calc(100% - 14px) calc(50% - 3px)",
    backgroundRepeat: "no-repeat",
    backgroundSize: "8px 8px, 8px 8px",
  },

  btnGroup: {
    display: "flex",
    gap: "12px",
  },

  modeBtn: {
    flex: 1,
    padding: "13px",
    border: "1px solid #334155",
    borderRadius: "14px",
    background: "#1e293b",
    color: "#e2e8f0",
    fontWeight: "700",
    fontSize: "15px",
    cursor: "pointer",
    transition: "0.2s ease",
  },

  activeBtn: {
    background: "linear-gradient(135deg, #2563eb, #7c3aed)",
    border: "none",
    color: "#fff",
    boxShadow: "0 8px 20px rgba(59,130,246,0.35)",
  },

  label: {
    display: "block",
    fontSize: "14px",
    fontWeight: "600",
    color: "#cbd5e1",
    marginBottom: "8px",
    marginLeft: "4px",
  },

  select: {
    width: "100%",
    padding: "14px 18px",
    marginBottom: "18px",
    borderRadius: "14px",
    border: "1px solid #334155",
    background: "#1e293b",
    color: "#f8fafc",
    fontSize: "15px",
    outline: "none",
    cursor: "pointer",
    appearance: "none",
    WebkitAppearance: "none",
    MozAppearance: "none",
    backgroundImage:
      "linear-gradient(45deg, transparent 50%, #cbd5e1 50%), linear-gradient(135deg, #cbd5e1 50%, transparent 50%)",
    backgroundPosition: "calc(100% - 18px) calc(50% - 3px), calc(100% - 14px) calc(50% - 3px)",
    backgroundRepeat: "no-repeat",
    backgroundSize: "8px 8px, 8px 8px",
  },

  divider: {
    border: "none",
    height: "1px",
    background: "#334155",
    margin: "24px 0",
  },

  progressBarContainer: {
    width: "100%",
    height: "10px",
    background: "#1e293b",
    borderRadius: "999px",
    overflow: "hidden",
    marginBottom: "22px",
  },

  progressBar: {
    height: "100%",
    background: "linear-gradient(90deg, #3b82f6, #8b5cf6)",
    borderRadius: "999px",
    transition: "width 0.3s ease",
  },

  statsRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#111827",
    padding: "14px 18px",
    borderRadius: "16px",
    marginBottom: "24px",
    border: "1px solid rgba(255,255,255,0.06)",
    fontSize: "14px",
    fontWeight: "700",
    color: "#e2e8f0",
  },

  question: {
    fontSize: "21px",
    fontWeight: "700",
    lineHeight: "1.7",
    marginBottom: "24px",
    color: "#f8fafc",
  },

  option: {
    width: "100%",
    padding: "16px 18px",
    marginBottom: "14px",
    borderRadius: "18px",
    border: "1px solid #334155",
    background: "#111827",
    color: "#f8fafc",
    textAlign: "left",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "0.2s ease, transform 0.2s ease",
    display: "flex",
    alignItems: "center",
    gap: "14px",
    boxShadow: "0 15px 35px rgba(15,23,42,0.15)",
  },

  correctOption: {
    background: "#14532d",
    border: "1px solid #22c55e",
    color: "#dcfce7",
  },
  optionHover: {
    transform: "translateY(-1px)",
    boxShadow: "0 22px 40px rgba(15,23,42,0.22)",
    background: "#1f2937",
  },
  optionLetter: {
    minWidth: "30px",
    minHeight: "30px",
    borderRadius: "50%",
    background: "rgba(59,130,246,0.15)",
    color: "#bfdbfe",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    fontSize: "14px",
  },

  wrongOption: {
    background: "#7f1d1d",
    border: "1px solid #ef4444",
    color: "#fee2e2",
  },

  explanation: {
    marginTop: "22px",
    padding: "18px",
    borderRadius: "18px",
    background: "#111827",
    border: "1px solid rgba(59,130,246,0.25)",
  },

  explanationTitle: {
    fontSize: "15px",
    fontWeight: "700",
    color: "#60a5fa",
    marginBottom: "10px",
  },

  expText: {
    fontSize: "14px",
    lineHeight: "1.8",
    color: "#cbd5e1",
  },

  nextBtn: {
    width: "100%",
    padding: "15px",
    marginTop: "22px",
    border: "none",
    borderRadius: "16px",
    background: "linear-gradient(135deg, #2563eb, #7c3aed)",
    color: "#fff",
    fontSize: "16px",
    fontWeight: "800",
    cursor: "pointer",
    boxShadow: "0 10px 25px rgba(37,99,235,0.35)",
  },

  scoreBoard: {
    marginTop: "20px",
    padding: "28px",
    borderRadius: "22px",
    background: "#111827",
    border: "1px solid rgba(255,255,255,0.08)",
  },

  bigScore: {
    fontSize: "72px",
    fontWeight: "900",
    color: "#60a5fa",
    margin: "14px 0",
  },

  resultText: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#e2e8f0",
  },

  resultStats: {
    display: "flex",
    justifyContent: "center",
    gap: "20px",
    marginTop: "18px",
    fontSize: "16px",
    fontWeight: "700",
  },
};

export default App;
