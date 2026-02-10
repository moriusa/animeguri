import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { supabase } from "../common/supabaseClient";
import { getArticleImageUrl, getUserImageUrl } from "../common/imageHelper";

export const handler = async (
  event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyResultV2> => {
  try {
    const { data, error } = await supabase
      .from("reports")
      .select(`
        *,
        report_images (*)
        `)
      // .eq("article_status", "published")
      // report_images の並び順
      .order("created_at", { ascending: false })
      .order("display_order", {
        foreignTable: "report_images",
        ascending: true,
      });

    if (error) {
      console.log(error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Internal Server Error" }),
      };
    }

    console.log(JSON.stringify(data));

    const transReportsData = data.map((report: any) => {
      return {
        id: report.id,
        title: report.title,
        location: report.location,
        articleId: report.article_id,
        createdAt: report.created_at,
        updatedAt: report.updated_at,
        description: report.description,
        displayOrder: report.display_order,
        latitude: report.latitude,
        longitude: report.longitude,
        reportImages: report.report_images.map((image: any) => ({
          id: image.id,
          imageUrl: getArticleImageUrl(image.s3_key),
          caption: image.caption,
          reportId: image.report_id,
          createdAt: image.created_at,
          updatedAt: image.updated_at,
          displayOrder: image.display_order,
        })),
      };
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ data: transReportsData }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
};
