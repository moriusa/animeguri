"use client";

import { useLogin } from "@/features";

const Page = () => {
  const { handleSubmit, email, pass, setEmail, setPass } = useLogin();

  // if (loading) {
  //   return <p>Loading...</p>;
  // }

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

export default Page;
