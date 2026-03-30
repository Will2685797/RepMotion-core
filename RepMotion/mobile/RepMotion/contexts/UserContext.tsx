import React, { createContext, useContext, useMemo, useState } from "react";

export type ConnectedUser = {
    email: string;
    username?: string;
    language: "fr" | "en";
};

type UserContextValue = {
    user: ConnectedUser | null;
    setUser: (u: ConnectedUser | null) => void;
    logout: () => void;
    setLanguage: (lang: "fr" | "en") => void;
};
const UserContext = createContext<UserContextValue | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
    // const [user, setUser] = useState<ConnectedUser | null>(null);
    // TO TEST TO TEST TO TEST TO TEST TO TEST
    const DEV_AUTO_LOGIN = true;
    const [user, setUser] = useState<ConnectedUser | null>(
        DEV_AUTO_LOGIN
            ? {
                email: "mac@alphasignals.goat",
                username: "mac",
                language: "fr",
            }
            : null
    );


    const value = useMemo(
        () => ({
            user,
            setUser,
            logout: () => setUser(null),
            setLanguage: (lang: "fr" | "en") => {
                if (!user) return;
                setUser({ ...user, language: lang });
            },
        }),
        [user]
    );

    return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
    const ctx = useContext(UserContext);
    if (!ctx) throw new Error("useUser must be used within UserProvider");
    return ctx;
};
