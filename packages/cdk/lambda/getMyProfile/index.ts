import type { APIGatewayProxyEventV2WithJWTAuthorizer } from "aws-lambda";
import { initSupabase } from "../common/supabaseClient";

export const handler = async (
  event: APIGatewayProxyEventV2WithJWTAuthorizer
) => {
  const sub = event.requestContext.authorizer.jwt.claims.sub as string;
  const email = event.requestContext.authorizer.jwt.claims.email as string | undefined;

  const supabase = await initSupabase();
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", sub)
    .single();

  // なければ自動作成する、などの策略もここで可能

  return {
    statusCode: 200,
    body: JSON.stringify({
      ...data,
      email: email ?? data?.email, // token優先 or DB優先はお好みで
    }),
  };
};