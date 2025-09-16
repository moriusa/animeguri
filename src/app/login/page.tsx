'use client'
import { AuthForm } from "@/app/components/feature/AuthForm";
// import useAuth from "../hooks/useAuth";

const page = () => {
  // const { user, loading, signUp, signIn, signOut } = useAuth();

  
  // if (loading) {
  //   return <p>Loading...</p>;
  // }

  return <AuthForm />;
};

export default page;
