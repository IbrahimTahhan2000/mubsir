import { createContext, useContext, useMemo } from "react";

const SESSION_STORAGE_KEY = "mubsir.sessionId";

function getOrCreateSessionId() {
  let id = sessionStorage.getItem(SESSION_STORAGE_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(SESSION_STORAGE_KEY, id);
  }
  return id;
}

const SessionContext = createContext(null);

export function SessionProvider({ children }) {
  const sessionId = useMemo(() => getOrCreateSessionId(), []);
  return (
    <SessionContext.Provider value={{ sessionId }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSessionId() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSessionId must be used within a SessionProvider");
  return ctx.sessionId;
}
