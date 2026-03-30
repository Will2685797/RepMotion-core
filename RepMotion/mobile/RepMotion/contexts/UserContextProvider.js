import { View, Text } from "react-native";
import { useState } from "react";
// import UserContext from "./UserContext";

const UserContextProvider = ({ children }) => {
    const [user, setUser] = useState();

    const connexion = (nom) => {
        setUser({
            nom: nom,
            connecte: true,
        });
    };
    const deconnexion = (nom) => {
        setUser(null);
    };

    return (
        <UserContext.Provider value={{ user, connexion, deconnexion }}>
            {children}
        </UserContext.Provider>
    );
};

export default UserContextProvider;
