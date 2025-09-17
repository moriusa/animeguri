"use client";

import React, { useState } from "react";
import { Button, Input, GoogleButton } from "@/app/components";
import Link from "next/link";
import { signIn } from "@/app/lib/auth";

export const AuthForm = () => {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");

  const handleSubmit = async(e) => {
    e.preventDefault();
    try{
      await signIn(email, pass)
      console.log('login success')
    } catch (err) {
      console.log(err)
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <p>email</p>
      <input
        type="text"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <p>pass</p>
      <input
        type="password"
        value={pass}
        onChange={(e) => setPass(e.target.value)}
      />
      <button type="submit">送信</button>
    </form>
  );
};
