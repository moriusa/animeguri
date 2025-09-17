"use client";

import { useLogin } from "@/features";
import { useLogout } from "@/features/auth/useLogout";

const Page = () => {
  const { handleSubmit, email, pass, setEmail, setPass, isLoading } =
    useLogin();
  const { handleLogout } = useLogout();

  if (isLoading) {
    return <p>Loading...</p>;
  }

  return (
    <>
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
      <button onClick={handleLogout}>ログアウト</button>
    </>
  );
};

export default Page;
