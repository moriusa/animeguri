import { APIGatewayProxyEventV2 } from "aws-lambda";
import { initSupabase } from "../common/supabaseClient";

export const handler = async (event: APIGatewayProxyEventV2) => {
  console.log("Event:", JSON.stringify(event, null, 2));
  try {
    const supabase = await initSupabase();
    const userId = event.pathParameters?.userId;

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("supabase error:", error);
      return {
        statusCode: 500,
        body: JSON.stringify({ message: "Internal server error" }),
      };
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: { data: data },
    };
  } catch (error: any) {
    console.error("Error fetching user profile:", error);
    return {
      statusCode: 404,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "User not found" }),
    };
  }
};
