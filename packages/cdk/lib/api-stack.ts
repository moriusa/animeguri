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
import { CloudFrontWebDistributionAttributes } from "aws-cdk-lib/aws-cloudfront";

interface ApiStackProps extends cdk.StackProps {
  userPool: cognito.IUserPool;
  userPoolClient: cognito.IUserPoolClient;
  supabaseUrlParam: ssm.IStringParameter;
  supabaseAnonKeyParam: ssm.IStringParameter;
  imagesBucket: s3.IBucket;
  cloudFrontDistribution: CloudFrontWebDistributionAttributes;
}

export class ApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    const {
      userPool,
      userPoolClient,
      supabaseUrlParam,
      supabaseAnonKeyParam,
      imagesBucket,
      cloudFrontDistribution,
    } = props;

    // lambda関数
    const getPublicUserFn = new NodejsFunction(this, "GetPublicUserFn", {
      handler: "handler",
      runtime: lambda.Runtime.NODEJS_22_X,
      entry: path.join(__dirname, "../lambda/getPublicUserProfile/index.ts"),
      functionName: "animeguri-get-public-user",
      environment: {
        SUPABASE_URL: supabaseUrlParam.parameterName,
        SUPABASE_ANON_KEY: supabaseAnonKeyParam.parameterName,
        S3_BUCKET_NAME: imagesBucket.bucketName,
      },
      timeout: Duration.seconds(10),
      memorySize: 256,
    });

    const getMeFn = new NodejsFunction(this, "GetMeFn", {
      handler: "handler",
      runtime: lambda.Runtime.NODEJS_22_X,
      entry: path.join(__dirname, "../lambda/getMyProfile/index.ts"),
      functionName: "animeguri-get-my-profile",
      environment: {
        SUPABASE_URL: supabaseUrlParam.parameterName,
        SUPABASE_ANON_KEY: supabaseAnonKeyParam.parameterName,
        S3_BUCKET_NAME: imagesBucket.bucketName,
        CLOUDFRONT_DOMAIN: cloudFrontDistribution.domainName,
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
        S3_BUCKET_NAME: imagesBucket.bucketName,
      },
      timeout: Duration.seconds(10),
      memorySize: 256,
    });

    const patchUserProfile = new NodejsFunction(this, "PatchUserProfile", {
      handler: "handler",
      runtime: lambda.Runtime.NODEJS_22_X,
      entry: path.join(__dirname, "../lambda/patchUserProfile/index.ts"),
      functionName: "animeguri-patch-user",
      environment: {
        SUPABASE_URL: supabaseUrlParam.parameterName,
        SUPABASE_ANON_KEY: supabaseAnonKeyParam.parameterName,
        S3_BUCKET_NAME: imagesBucket.bucketName,
      },
      timeout: Duration.seconds(10),
      memorySize: 256,
    });

    const getListMyArticles = new NodejsFunction(this, "GetListMyArticles", {
      handler: "handler",
      runtime: lambda.Runtime.NODEJS_22_X,
      entry: path.join(__dirname, "../lambda/getListMyArticles/index.ts"),
      functionName: "animeguri-get-list-My-articles",
      environment: {
        SUPABASE_URL: supabaseUrlParam.parameterName,
        SUPABASE_ANON_KEY: supabaseAnonKeyParam.parameterName,
        S3_BUCKET_NAME: imagesBucket.bucketName,
        CLOUDFRONT_DOMAIN: cloudFrontDistribution.domainName,
      },
      timeout: Duration.seconds(10),
      memorySize: 256,
    });

    const getListArticles = new NodejsFunction(this, "GetListArticles", {
      handler: "handler",
      runtime: lambda.Runtime.NODEJS_22_X,
      entry: path.join(__dirname, "../lambda/getListArticles/index.ts"),
      functionName: "animeguri-get-list-articles",
      environment: {
        SUPABASE_URL: supabaseUrlParam.parameterName,
        SUPABASE_ANON_KEY: supabaseAnonKeyParam.parameterName,
        S3_BUCKET_NAME: imagesBucket.bucketName,
        CLOUDFRONT_DOMAIN: cloudFrontDistribution.domainName,
      },
      timeout: Duration.seconds(10),
      memorySize: 256,
    });

    const getListUserArticles = new NodejsFunction(this, "GetListUserArticles", {
      handler: "handler",
      runtime: lambda.Runtime.NODEJS_22_X,
      entry: path.join(__dirname, "../lambda/getListUserArticles/index.ts"),
      functionName: "animeguri-get-list-user-articles",
      environment: {
        SUPABASE_URL: supabaseUrlParam.parameterName,
        SUPABASE_ANON_KEY: supabaseAnonKeyParam.parameterName,
        S3_BUCKET_NAME: imagesBucket.bucketName,
      },
      timeout: Duration.seconds(10),
      memorySize: 256,
    });

    const getArticle = new NodejsFunction(this, "GetArticle", {
      handler: "handler",
      runtime: lambda.Runtime.NODEJS_22_X,
      entry: path.join(__dirname, "../lambda/getArticle/index.ts"),
      functionName: "animeguri-get-article",
      environment: {
        SUPABASE_URL: supabaseUrlParam.parameterName,
        SUPABASE_ANON_KEY: supabaseAnonKeyParam.parameterName,
        S3_BUCKET_NAME: imagesBucket.bucketName,
      },
      timeout: Duration.seconds(10),
      memorySize: 256,
    });

    const createArticle = new NodejsFunction(this, "CreateArticle", {
      handler: "handler",
      runtime: lambda.Runtime.NODEJS_22_X,
      entry: path.join(__dirname, "../lambda/createArticle/index.ts"),
      functionName: "animeguri-create-article",
      environment: {
        SUPABASE_URL: supabaseUrlParam.parameterName,
        SUPABASE_ANON_KEY: supabaseAnonKeyParam.parameterName,
        S3_BUCKET_NAME: imagesBucket.bucketName,
      },
      timeout: Duration.seconds(10),
      memorySize: 256,
    });

    const generatePresignedUrl = new NodejsFunction(
      this,
      "GeneratePresignedUrl",
      {
        handler: "handler",
        runtime: lambda.Runtime.NODEJS_22_X,
        entry: path.join(__dirname, "../lambda/generatePresignedUrl/index.ts"),
        functionName: "animeguri-generate-presigned-url",
        environment: {
          SUPABASE_URL: supabaseUrlParam.parameterName,
          SUPABASE_ANON_KEY: supabaseAnonKeyParam.parameterName,
          S3_BUCKET_NAME: imagesBucket.bucketName,
        },
        timeout: Duration.seconds(10),
        memorySize: 256,
      }
    );

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
      getPublicUserFn
    );

    const getMeIntegration = new HttpLambdaIntegration(
      "GetMeIntegration",
      getMeFn
    );

    const createUserIntegration = new HttpLambdaIntegration(
      "CreateUserIntegration",
      createUserFn
    );

    const patchUserProfileIntegration = new HttpLambdaIntegration(
      "PatchUserProfileIntegration",
      patchUserProfile
    );

    const getListMyArticlesIntegration = new HttpLambdaIntegration(
      "GetListMyArticlesIntegration",
      getListMyArticles
    );

    const getListArticlesIntegration = new HttpLambdaIntegration(
      "GetListArticlesIntegration",
      getListArticles
    );

    const getListUserArticlesIntegration = new HttpLambdaIntegration(
      "GetListUserArticlesIntegration",
      getListUserArticles
    );

    const getArticleIntegration = new HttpLambdaIntegration(
      "GetArticleIntegration",
      getArticle
    );

    const createArticleIntegration = new HttpLambdaIntegration(
      "CreateArticleIntegration",
      createArticle
    );

    const generatePresignedUrlIntegration = new HttpLambdaIntegration(
      "GeneratePresignedUrl",
      generatePresignedUrl
    );

    // API Gateway
    const api = new HttpApi(this, "AnimeguriApi", {
      apiName: "animeguri-api",
      corsPreflight: {
        allowHeaders: ["Content-Type", "Authorization"],
        allowOrigins: ["*"], // 本番はドメインを絞る
        allowMethods: [
          CorsHttpMethod.GET,
          CorsHttpMethod.POST,
          CorsHttpMethod.PATCH,
          CorsHttpMethod.OPTIONS,
        ],
      },
    });

    // ルート定義
    api.addRoutes({
      path: "/user/{userId}",
      methods: [HttpMethod.GET],
      integration: getUserIntegration,
    });

    api.addRoutes({
      path: "/user/me",
      methods: [HttpMethod.GET],
      integration: getMeIntegration,
      authorizer, // Cognito UserPool Authorizer
    });

    api.addRoutes({
      path: "/user/me",
      methods: [HttpMethod.POST],
      integration: createUserIntegration,
      authorizer,
    });

    api.addRoutes({
      path: "/user/me",
      methods: [HttpMethod.PATCH],
      integration: patchUserProfileIntegration,
      authorizer,
    });

    api.addRoutes({
      path: "/user/me/articles",
      methods: [HttpMethod.GET],
      integration: getListMyArticlesIntegration,
      authorizer,
    });

    api.addRoutes({
      path: "/articles",
      methods: [HttpMethod.GET],
      integration: getListArticlesIntegration,
    });

    api.addRoutes({
      path: "/user/{id}/articles",
      methods: [HttpMethod.GET],
      integration: getListUserArticlesIntegration,
    });

    api.addRoutes({
      path: "/articles/{id}",
      methods: [HttpMethod.GET],
      integration: getArticleIntegration,
    });

    api.addRoutes({
      path: "/articles",
      methods: [HttpMethod.POST],
      integration: createArticleIntegration,
      authorizer,
    });

    api.addRoutes({
      path: "/presigned-url",
      methods: [HttpMethod.POST],
      integration: generatePresignedUrlIntegration,
      authorizer,
    });

    // ParamStore読み取り許可
    supabaseUrlParam.grantRead(getPublicUserFn);
    supabaseAnonKeyParam.grantRead(getPublicUserFn);
    supabaseUrlParam.grantRead(getMeFn);
    supabaseAnonKeyParam.grantRead(getMeFn);
    supabaseUrlParam.grantRead(createUserFn);
    supabaseAnonKeyParam.grantRead(createUserFn);
    supabaseUrlParam.grantRead(patchUserProfile);
    supabaseAnonKeyParam.grantRead(patchUserProfile);
    supabaseUrlParam.grantRead(getListMyArticles);
    supabaseAnonKeyParam.grantRead(getListMyArticles);
    supabaseUrlParam.grantRead(getListArticles);
    supabaseAnonKeyParam.grantRead(getListArticles);
    supabaseUrlParam.grantRead(getListUserArticles);
    supabaseAnonKeyParam.grantRead(getListUserArticles);
    supabaseUrlParam.grantRead(getArticle);
    supabaseAnonKeyParam.grantRead(getArticle);
    supabaseUrlParam.grantRead(createArticle);
    supabaseAnonKeyParam.grantRead(createArticle);
    // s3読み許可
    imagesBucket.grantReadWrite(getMeFn);
    imagesBucket.grantRead(getListArticles);
    imagesBucket.grantRead(getListMyArticles);
    imagesBucket.grantRead(getArticle);
    // S3への署名付きURL生成権限を付与
    imagesBucket.grantPut(generatePresignedUrl);
  }
}
