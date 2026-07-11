import React, { createContext, useState } from "react";

export const quoteContext = createContext();

// Last-resort fallback so the app never crashes if the quote API is unreachable.
const FALLBACK_QUOTES = [
  { content: "The only way to do great work is to love what you do.", author: "Steve Jobs", tags: ["Motivational"] },
  { content: "In the middle of difficulty lies opportunity.", author: "Albert Einstein", tags: ["Wisdom"] },
  { content: "What we think, we become.", author: "Buddha", tags: ["Wisdom"] },
  { content: "Do not mind anything that anyone tells you about anyone else.", author: "Henry James", tags: ["Famous Quotes"] },
  { content: "To enjoy life, we must touch much of it lightly.", author: "Voltaire", tags: ["Famous Quotes"] },
];

const QuoteContextProvider = (props) => {
  const [quotes, setQuotes] = useState({
    quote: "hi",
    sayer: "",
    tag: ["nature"],
  });

  const fetchQuote = async (setIsLoading) => {
    setIsLoading(true);
    try {
      // api.quotable.io was discontinued (TLS cert expired); use the maintained
      // CORS-open mirror instead.
      const response = await fetch(
        "https://api.quotable.kurokeita.dev/api/quotes/random"
      );
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      const q = data.quote;
      setQuotes({
        quote: q.content,
        sayer: q.author?.name ?? "",
        tag: (q.tags ?? []).map((t) => t.name),
      });
    } catch (error) {
      console.error("Quote fetch failed, using fallback:", error);
      const q =
        FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)];
      setQuotes({ quote: q.content, sayer: q.author, tag: q.tags });
    }
    // setIsLoading(false) is handled by fetchImages once the background loads.
  };

  return (
    <div>
      <quoteContext.Provider value={{ quotes, fetchQuote }}>
        {props.children}
      </quoteContext.Provider>
    </div>
  );
};

export default QuoteContextProvider;
