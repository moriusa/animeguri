import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as apigwv2 from "aws-cdk-lib/aws-apigatewayv2";
import * as integrations from "aws-cdk-lib/aws-apigatewayv2-integrations";
import * as ssm from "aws-cdk-lib/aws-ssm";
import { Construct } from "constructs";
import * as path from "path";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Duration } from "aws-cdk-lib";

export class UserProfileStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // S3(ユーザープロフィール画像) https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_s3.Bucket.html
    const userImagesBucket = new s3.Bucket(this, "UserImagesBucket", {
      bucketName: `animeguri-user-images`,
      versioned: false,
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      cors: [
        {
          allowedMethods: [
            s3.HttpMethods.GET,
            s3.HttpMethods.POST,
            s3.HttpMethods.PUT,
          ],
          allowedOrigins: ["*"], // 本番では特定のドメインに限定
          allowedHeaders: ["*"], // 本番では特定のヘッダーに限定した方がよさそ
        },
      ],
    });

    // ParameterStoreにSupabaseの認証情報作成
    const supabaseUrlParam = new ssm.StringParameter(this, "supabaseUrl", {
      parameterName: "/animeguri/supabase/url",
      stringValue: "CHANGE_AFTER_DEPLOY", // デプロイ後に手動で変更する
    });
    const supabaseAnonKeyParam = new ssm.StringParameter(
      this,
      "supabaseAnonKey",
      {
        parameterName: "/animeguri/supabase/anon-key",
        stringValue: "CHANGE_AFTER_DEPLOY", // デプロイ後に手動で変更する
      }
    );

    // lambda関数
    const getUserFn = new NodejsFunction(this, "GetUserFn", {
      handler: "handler",
      runtime: lambda.Runtime.NODEJS_22_X,
      entry: path.join(__dirname, "../lambda/getUserProfile/index.ts"),
      functionName: "animeguri-get-user",
      environment: {
        SUPABASE_URL: supabaseUrlParam.parameterName,
        SUPABASE_ANON_KEY: supabaseAnonKeyParam.parameterName,
        S3_BUCKET_NAME: userImagesBucket.bucketName,
      },
      timeout: Duration.seconds(10),
      memorySize: 256,
    });

    const createUserFn = new NodejsFunction(this, "CreateUserFn", {
      handler: "handler",
      runtime: lambda.Runtime.NODEJS_22_X,
      entry: path.join(__dirname, "../lambda/createUser/index.ts"),
      functionName: "animeguri-create-user",
      environment: {
        SUPABASE_URL: supabaseUrlParam.parameterName,
        SUPABASE_ANON_KEY: supabaseAnonKeyParam.parameterName,
        S3_BUCKET_NAME: userImagesBucket.bucketName,
      },
      timeout: Duration.seconds(10),
      memorySize: 256,
    });

    // API Gateway
    const api = new apigwv2.HttpApi(this, "UserProfileHttpApi", {
      apiName: "animeguri-api",
      description: "This service serves user profiles.",
      corsPreflight: {
        allowOrigins: ["*"], // 本番はドメインを絞る
        allowMethods: [
          apigwv2.CorsHttpMethod.GET,
          apigwv2.CorsHttpMethod.OPTIONS,
        ],
      },
    });

    // Lambda 統合
    const getUserIntegration = new integrations.HttpLambdaIntegration(
      "GetUserIntegration",
      getUserFn
    );

    const createUserIntegration = new integrations.HttpLambdaIntegration(
      "CreateUserIntegration",
      createUserFn
    );

    // ルート定義
    api.addRoutes({
      path: "/user/{userId}",
      methods: [apigwv2.HttpMethod.GET],
      integration: getUserIntegration,
    });

    api.addRoutes({
      path: "/user",
      methods: [apigwv2.HttpMethod.POST],
      integration: createUserIntegration,
    });

    // ParamStore読み取り許可
    supabaseUrlParam.grantRead(getUserFn);
    supabaseAnonKeyParam.grantRead(getUserFn);
    supabaseUrlParam.grantRead(createUserFn);
    supabaseAnonKeyParam.grantRead(createUserFn);
    // s3読み書き許可
    userImagesBucket.grantReadWrite(getUserFn);
  }
}
