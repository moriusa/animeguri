import { signIn } from "@/lib";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { login } from "./AuthSlice";

export const useLogin = () => {
  const dispatch = useDispatch()

  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signIn(email, pass);
      dispatch(login())
      console.log("login success");
    } catch (err) {
      console.log(err);
    }
  };

  return { handleSubmit, email, pass, setEmail, setPass };
};
