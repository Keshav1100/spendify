import { auth } from "@/config/firebase";
import { AuthContextType, UserDataType, UserType } from "@/types";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { createContext, useContext, useEffect, useState } from "react";
// import {firestore} from "@/config/firebase";
import { firestore } from "@/config/firebase";
import { router, useRouter } from "expo-router";
const AuthContext = createContext<AuthContextType | null>(null);
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const router = useRouter();
  const [user, setUser] = useState<UserType>(null);
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      console.log("firebaseUser: ", firebaseUser);
      if (firebaseUser) {
        setUser({
          uid: firebaseUser?.uid,
          email: firebaseUser?.email,
          name: firebaseUser?.displayName,
        });
        updateUserData(firebaseUser?.uid);
        router.replace("/(tabs)/");
      } else {
        setUser(null);
        router.replace("/(auth)/welcome");
      }
      return () => unsub();
    });
  }, []);
  const login = async (email: string, password: string) => {
    // login logic
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (error: any) {
      console.log("error: ", error);
      let msg = error.message;
      if (msg.includes("auth/invalid-email")) msg = "Invalid email";
      if (msg.includes("auth/invalid-credential")) msg = "Inavlid Credentials";

      return { success: false, msg };
    }
  };
  const register = async (email: string, password: string, name: string) => {
    // login logic
    try {
      let response = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      await setDoc(doc(firestore, "users", response?.user?.uid), {
        name,
        email,
        uid: response?.user?.uid,
      });
      return { success: true };
    } catch (error: any) {
      let msg = error.message;
      console.log("error: ", msg);
      if (msg.includes("auth/invalid-email")) msg = "Invalid email";
      if (msg.includes("email-already-in-use")) msg = "User already exists";
      if (msg.includes("auth/weak-password"))
        msg = "Password should be atelast 6 characters long";

      return { success: false, msg };
    }
  };

  const updateUserData = async (uid: string) => {
    // login logic
    try {
      const docRef = doc(firestore, "users", uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        const userData: UserType = {
          uid: data?.uid,
          name: data.name || null,
          email: data.email || null,
          image: data.image || null,
        };
        setUser({ ...userData });
      }
    } catch (error: any) {
      let msg = error.message;
      console.log("error: ", msg);
      // return { error: msg };
    }
  };
  const contextValue: AuthContextType = {
    user,
    setUser,
    login,
    register,
    updateUserData,
  };
  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be wrapped inside AuthProvider");
  }
  return context;
};
