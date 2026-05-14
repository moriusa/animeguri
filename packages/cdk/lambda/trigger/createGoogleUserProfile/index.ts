import { PostAuthenticationTriggerEvent } from "aws-lambda";
import { supabase } from "../../common/supabaseClient";

export const handler = async (event: PostAuthenticationTriggerEvent) => {
  // Googleログインのみ対象
  if (event.request.userAttributes.identities === undefined) {
    return event; // メール認証ユーザーはスキップ
  }

  const sub = event.request.userAttributes.sub;
  const email = event.request.userAttributes.email;

  try {
    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .eq("auth_provider", "google")
      .maybeSingle();

    if (!existing) {
      const { data, error } = await supabase.from("users").insert({
        id: sub,
        email,
        auth_provider: "google",
        user_name: `user_${sub.slice(0, 8)}`,
      });
      if (error) {
        console.error("Supabase insert error:", error);
        return {
          statusCode: 500,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: "Internal server error" }),
        };
      }
      console.log("Google user created:", data);
    }
  } catch (e) {
    console.error("postAuthentication error:", e);
  }

  return event;
};
