import { APIGatewayProxyEventV2 } from "aws-lambda";
import { initSupabase } from "../common/supabaseClient";

export const handler = async (event: APIGatewayProxyEventV2) => {
  console.log("Event:", JSON.stringify(event, null, 2));
  try {
    const supabase = await initSupabase();
    const userId = event.pathParameters?.userId;
    if (!userId) {
      console.log("User ID not found");
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: "User ID not found" }),
      };
    }
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("supabase error:", error);
      return {
        statusCode: 500,
        body: JSON.stringify({ message: "Failed to fetch user profile" }),
      };
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
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
