import { APIGatewayProxyEventV2 } from "aws-lambda";
import { initSupabase } from "../common/supabaseClient";
import { getUserImageUrl } from "../common/imageHelper";

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

    const transData = {
      email: data.email,
      userName: data.user_name,
      profileImageUrl: getUserImageUrl(data.profile_image_s3_key),
      bio: data.bio,
      articleCount: data.article_count,
      xUrl: data.x_url,
      facebookUrl: data.facebook_url,
      youtubeUrl: data.youtube_url,
      websiteUrl: data.website_url,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };

    console.log(transData);

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
      body: JSON.stringify({ data: transData }),
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
