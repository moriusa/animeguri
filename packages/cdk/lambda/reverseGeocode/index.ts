import {
  LocationClient,
  SearchPlaceIndexForPositionCommand,
} from "@aws-sdk/client-location";
import { APIGatewayProxyEventV2WithJWTAuthorizer } from "aws-lambda";

const client = new LocationClient({
  region: process.env.AWS_REGION || "ap-northeast-1",
});

export interface ProfileFormValues {
  userName: string;
  bio: string;
  profileImageS3Key?: string;
  xUrl?: string;
  facebookUrl?: string;
  youtubeUrl?: string;
  websiteUrl?: string;
}

export const handler = async (
  event: APIGatewayProxyEventV2WithJWTAuthorizer,
) => {
  // クエリパラメータから緯度経度を取得
  const latStr = event.queryStringParameters?.lat;
  const lngStr = event.queryStringParameters?.lng;
  if (!latStr || !lngStr) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "lat と lng が必要です" }),
    };
  }

  try {
    const lat = parseFloat(latStr);
    const lng = parseFloat(lngStr);

    const command = new SearchPlaceIndexForPositionCommand({
      IndexName: process.env.PLACE_INDEX_NAME,
      Position: [lng, lat], // AWSは [経度, 緯度] の順
      MaxResults: 1,
      Language: "ja",
    });

    const response = await client.send(command);
    const result = response.Results?.[0]?.Place;

    console.log(result);

    if (!result) {
      return {
        statusCode: 200,
        body: JSON.stringify({ place: null }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        place: {
          prefecture: result.Region,
          subRegion: result.SubRegion,
          municipality: result.Municipality,
          street: result.Street,
          addressNumber: result.AddressNumber,
          label: result.Label,
        },
      }),
    };
  } catch (error) {
    console.error("AWS Location Service Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "住所の取得に失敗しました" }),
    };
  }
};
