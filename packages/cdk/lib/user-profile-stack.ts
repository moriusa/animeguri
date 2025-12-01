import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as ssm from "aws-cdk-lib/aws-ssm";
import { Construct } from "constructs";
import * as path from "path";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Duration } from "aws-cdk-lib";
import { HttpUserPoolAuthorizer } from "@aws-cdk/aws-apigatewayv2-authorizers-alpha";
import * as cognito from "aws-cdk-lib/aws-cognito";
import {
  HttpApi,
  HttpMethod,
  CorsHttpMethod,
} from "@aws-cdk/aws-apigatewayv2-alpha";
import { HttpLambdaIntegration } from "@aws-cdk/aws-apigatewayv2-integrations-alpha";

export class UserProfileStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // cognito UserPool
    const userPool = new cognito.UserPool(this, "UserPool", {
      userPoolName: "animeguri-user-pool",
      selfSignUpEnabled: true,
      signInAliases: { email: true },
    });

    const userPoolClient = new cognito.UserPoolClient(this, "UserPoolClient", {
      userPool,
    });

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
      entry: path.join(__dirname, "../lambda/createUserProfile/index.ts"),
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
    const api = new HttpApi(this, "UserProfileHttpApi", {
      apiName: "animeguri-api",
      description: "This service serves user profiles.",
      corsPreflight: {
        allowOrigins: ["*"], // 本番はドメインを絞る
        allowMethods: [
          CorsHttpMethod.GET,
          CorsHttpMethod.POST,
          CorsHttpMethod.OPTIONS,
        ],
      },
    });

    // cognito authorizer
    const authorizer = new HttpUserPoolAuthorizer(
      "UserPoolAuthorizer",
      userPool,
      {
        userPoolClients: [userPoolClient],
      }
    );

    // Lambda 統合
    const getUserIntegration = new HttpLambdaIntegration(
      "GetUserIntegration",
      getUserFn
    );

    const createUserIntegration = new HttpLambdaIntegration(
      "CreateUserIntegration",
      createUserFn
    );

    // ルート定義
    api.addRoutes({
      path: "/user/{userId}",
      methods: [HttpMethod.GET],
      integration: getUserIntegration,
    });

    api.addRoutes({
      path: "/user/me",
      methods: [HttpMethod.POST],
      integration: createUserIntegration,
      authorizer,
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
