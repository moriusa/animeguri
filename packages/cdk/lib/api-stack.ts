import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
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

interface ApiStackProps extends cdk.StackProps {
  envName: string;
  userPool: cognito.IUserPool;
  userPoolClient: cognito.IUserPoolClient;
  imagesBucket: s3.IBucket;
  cloudFrontDistribution: cloudfront.Distribution;
}

export class ApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);
    const {
      envName,
      userPool,
      userPoolClient,
      imagesBucket,
      cloudFrontDistribution,
    } = props;

    const supabaseUrl =
      envName === "dev"
        ? process.env.SUPABASE_URL_DEV!
        : process.env.SUPABASE_URL_PROD!;
    const supabaseServiceRoleKey =
      envName === "dev"
        ? process.env.SUPABASE_SERVICE_ROLE_KEY_DEV!
        : process.env.SUPABASE_SERVICE_ROLE_KEY_PROD!;

    // lambda関数
    const getPublicUserFn = new NodejsFunction(
      this,
      `GetPublicUserFn-${envName}`,
      {
        handler: "handler",
        runtime: lambda.Runtime.NODEJS_22_X,
        entry: path.join(__dirname, "../lambda/getPublicUserProfile/index.ts"),
        functionName: `animeguri-get-public-user-${envName}`,
        environment: {
          SUPABASE_URL: supabaseUrl,
          SUPABASE_SERVICE_ROLE_KEY: supabaseServiceRoleKey,
          CLOUDFRONT_DOMAIN: cloudFrontDistribution.distributionDomainName,
        },
        timeout: Duration.seconds(10),
        memorySize: 256,
      },
    );

    const getMeFn = new NodejsFunction(this, `GetMeFn-${envName}`, {
      handler: "handler",
      runtime: lambda.Runtime.NODEJS_22_X,
      entry: path.join(__dirname, "../lambda/getMyProfile/index.ts"),
      functionName: `animeguri-get-my-profile-${envName}`,
      environment: {
        SUPABASE_URL: supabaseUrl,
        SUPABASE_SERVICE_ROLE_KEY: supabaseServiceRoleKey,
        S3_BUCKET_NAME: imagesBucket.bucketName,
        CLOUDFRONT_DOMAIN: cloudFrontDistribution.distributionDomainName,
      },
      timeout: Duration.seconds(10),
      memorySize: 256,
    });

    const createUserFn = new NodejsFunction(this, `CreateUserFn-${envName}`, {
      handler: "handler",
      runtime: lambda.Runtime.NODEJS_22_X,
      entry: path.join(__dirname, "../lambda/createUserProfile/index.ts"),
      functionName: `animeguri-create-user-${envName}`,
      environment: {
        SUPABASE_URL: supabaseUrl,
        SUPABASE_SERVICE_ROLE_KEY: supabaseServiceRoleKey,
        S3_BUCKET_NAME: imagesBucket.bucketName,
        CLOUDFRONT_DOMAIN: cloudFrontDistribution.distributionDomainName,
      },
      timeout: Duration.seconds(10),
      memorySize: 256,
    });

    const patchUserProfile = new NodejsFunction(
      this,
      `PatchUserProfile-${envName}`,
      {
        handler: "handler",
        runtime: lambda.Runtime.NODEJS_22_X,
        entry: path.join(__dirname, "../lambda/patchUserProfile/index.ts"),
        functionName: `animeguri-patch-user-${envName}`,
        environment: {
          SUPABASE_URL: supabaseUrl,
          SUPABASE_SERVICE_ROLE_KEY: supabaseServiceRoleKey,
          S3_BUCKET_NAME: imagesBucket.bucketName,
          CLOUDFRONT_DOMAIN: cloudFrontDistribution.distributionDomainName,
        },
        timeout: Duration.seconds(10),
        memorySize: 256,
      },
    );

    const getMyArticle = new NodejsFunction(this, `GetMyArticle-${envName}`, {
      handler: "handler",
      runtime: lambda.Runtime.NODEJS_22_X,
      entry: path.join(__dirname, "../lambda/getMyArticle/index.ts"),
      functionName: `animeguri-get-My-article-${envName}`,
      environment: {
        SUPABASE_URL: supabaseUrl,
        SUPABASE_SERVICE_ROLE_KEY: supabaseServiceRoleKey,
        S3_BUCKET_NAME: imagesBucket.bucketName,
        CLOUDFRONT_DOMAIN: cloudFrontDistribution.distributionDomainName,
      },
      timeout: Duration.seconds(10),
      memorySize: 256,
    });

    const getListMyArticles = new NodejsFunction(
      this,
      `GetListMyArticles-${envName}`,
      {
        handler: "handler",
        runtime: lambda.Runtime.NODEJS_22_X,
        entry: path.join(__dirname, "../lambda/getListMyArticles/index.ts"),
        functionName: `animeguri-get-list-My-articles-${envName}`,
        environment: {
          SUPABASE_URL: supabaseUrl,
          SUPABASE_SERVICE_ROLE_KEY: supabaseServiceRoleKey,
          S3_BUCKET_NAME: imagesBucket.bucketName,
          CLOUDFRONT_DOMAIN: cloudFrontDistribution.distributionDomainName,
        },
        timeout: Duration.seconds(10),
        memorySize: 256,
      },
    );

    const getListArticles = new NodejsFunction(
      this,
      `GetListArticles-${envName}`,
      {
        handler: "handler",
        runtime: lambda.Runtime.NODEJS_22_X,
        entry: path.join(__dirname, "../lambda/getListArticles/index.ts"),
        functionName: `animeguri-get-list-articles-${envName}`,
        environment: {
          SUPABASE_URL: supabaseUrl,
          SUPABASE_SERVICE_ROLE_KEY: supabaseServiceRoleKey,
          S3_BUCKET_NAME: imagesBucket.bucketName,
          CLOUDFRONT_DOMAIN: cloudFrontDistribution.distributionDomainName,
        },
        timeout: Duration.seconds(10),
        memorySize: 256,
      },
    );

    const getListUserArticles = new NodejsFunction(
      this,
      `GetListUserArticles-${envName}`,
      {
        handler: "handler",
        runtime: lambda.Runtime.NODEJS_22_X,
        entry: path.join(__dirname, "../lambda/getListUserArticles/index.ts"),
        functionName: `animeguri-get-list-user-articles-${envName}`,
        environment: {
          SUPABASE_URL: supabaseUrl,
          SUPABASE_SERVICE_ROLE_KEY: supabaseServiceRoleKey,
          CLOUDFRONT_DOMAIN: cloudFrontDistribution.distributionDomainName,
        },
        timeout: Duration.seconds(10),
        memorySize: 256,
      },
    );

    const getArticle = new NodejsFunction(this, `GetArticle-${envName}`, {
      handler: "handler",
      runtime: lambda.Runtime.NODEJS_22_X,
      entry: path.join(__dirname, "../lambda/getArticle/index.ts"),
      functionName: `animeguri-get-article-${envName}`,
      environment: {
        SUPABASE_URL: supabaseUrl,
        SUPABASE_SERVICE_ROLE_KEY: supabaseServiceRoleKey,
        S3_BUCKET_NAME: imagesBucket.bucketName,
        CLOUDFRONT_DOMAIN: cloudFrontDistribution.distributionDomainName,
      },
      timeout: Duration.seconds(10),
      memorySize: 256,
    });

    const createArticle = new NodejsFunction(this, `CreateArticle-${envName}`, {
      handler: "handler",
      runtime: lambda.Runtime.NODEJS_22_X,
      entry: path.join(__dirname, "../lambda/createArticle/index.ts"),
      functionName: `animeguri-create-article-${envName}`,
      environment: {
        SUPABASE_URL: supabaseUrl,
        SUPABASE_SERVICE_ROLE_KEY: supabaseServiceRoleKey,
        S3_BUCKET_NAME: imagesBucket.bucketName,
        CLOUDFRONT_DOMAIN: cloudFrontDistribution.distributionDomainName,
      },
      timeout: Duration.seconds(10),
      memorySize: 256,
    });

    const patchArticle = new NodejsFunction(this, `PatchArticle-${envName}`, {
      handler: "handler",
      runtime: lambda.Runtime.NODEJS_22_X,
      entry: path.join(__dirname, "../lambda/patchArticle/index.ts"),
      functionName: `animeguri-patch-article-${envName}`,
      environment: {
        SUPABASE_URL: supabaseUrl,
        SUPABASE_SERVICE_ROLE_KEY: supabaseServiceRoleKey,
        S3_BUCKET_NAME: imagesBucket.bucketName,
        CLOUDFRONT_DOMAIN: cloudFrontDistribution.distributionDomainName,
      },
      timeout: Duration.seconds(10),
      memorySize: 256,
    });

    const deleteArticle = new NodejsFunction(this, `DeleteArticle-${envName}`, {
      handler: "handler",
      runtime: lambda.Runtime.NODEJS_22_X,
      entry: path.join(__dirname, "../lambda/deleteArticle/index.ts"),
      functionName: `animeguri-delete-article-${envName}`,
      environment: {
        SUPABASE_URL: supabaseUrl,
        SUPABASE_SERVICE_ROLE_KEY: supabaseServiceRoleKey,
      },
      timeout: Duration.seconds(10),
      memorySize: 256,
    });

    const getReports = new NodejsFunction(this, `GetReports-${envName}`, {
      handler: "handler",
      runtime: lambda.Runtime.NODEJS_22_X,
      entry: path.join(__dirname, "../lambda/getReports/index.ts"),
      functionName: `animeguri-get-reports-${envName}`,
      environment: {
        SUPABASE_URL: supabaseUrl,
        SUPABASE_SERVICE_ROLE_KEY: supabaseServiceRoleKey,
        S3_BUCKET_NAME: imagesBucket.bucketName,
        CLOUDFRONT_DOMAIN: cloudFrontDistribution.distributionDomainName,
      },
      timeout: Duration.seconds(10),
      memorySize: 256,
    });

    const generatePresignedUrl = new NodejsFunction(
      this,
      `GeneratePresignedUrl-${envName}`,
      {
        handler: "handler",
        runtime: lambda.Runtime.NODEJS_22_X,
        entry: path.join(__dirname, "../lambda/generatePresignedUrl/index.ts"),
        functionName: `animeguri-generate-presigned-url-${envName}`,
        environment: {
          SUPABASE_URL: supabaseUrl,
          SUPABASE_SERVICE_ROLE_KEY: supabaseServiceRoleKey,
          S3_BUCKET_NAME: imagesBucket.bucketName,
          CLOUDFRONT_DOMAIN: cloudFrontDistribution.distributionDomainName,
        },
        timeout: Duration.seconds(10),
        memorySize: 256,
      },
    );

    const createBookmark = new NodejsFunction(
      this,
      `CreateBookmark-${envName}`,
      {
        handler: "handler",
        runtime: lambda.Runtime.NODEJS_22_X,
        entry: path.join(__dirname, "../lambda/createBookmark/index.ts"),
        functionName: `animeguri-create-bookmark-${envName}`,
        environment: {
          SUPABASE_URL: supabaseUrl,
          SUPABASE_SERVICE_ROLE_KEY: supabaseServiceRoleKey,
          CLOUDFRONT_DOMAIN: cloudFrontDistribution.distributionDomainName,
        },
        timeout: Duration.seconds(10),
        memorySize: 256,
      },
    );

    const deleteBookmark = new NodejsFunction(
      this,
      `DeleteBookmark-${envName}`,
      {
        handler: "handler",
        runtime: lambda.Runtime.NODEJS_22_X,
        entry: path.join(__dirname, "../lambda/deleteBookmark/index.ts"),
        functionName: `animeguri-delete-bookmark-${envName}`,
        environment: {
          SUPABASE_URL: supabaseUrl,
          SUPABASE_SERVICE_ROLE_KEY: supabaseServiceRoleKey,
        },
        timeout: Duration.seconds(10),
        memorySize: 256,
      },
    );

    const getBookmarkArticlesList = new NodejsFunction(
      this,
      `GetBookmarkArticlesList-${envName}`,
      {
        handler: "handler",
        runtime: lambda.Runtime.NODEJS_22_X,
        entry: path.join(
          __dirname,
          "../lambda/getBookmarkArticlesList/index.ts",
        ),
        functionName: `animeguri-get-bookmark-articles-list-${envName}`,
        environment: {
          SUPABASE_URL: supabaseUrl,
          SUPABASE_SERVICE_ROLE_KEY: supabaseServiceRoleKey,
          CLOUDFRONT_DOMAIN: cloudFrontDistribution.distributionDomainName,
        },
        timeout: Duration.seconds(10),
        memorySize: 256,
      },
    );

    const getBookmarkCheckSingle = new NodejsFunction(
      this,
      `GetBookmarkCheckSingle-${envName}`,
      {
        handler: "handler",
        runtime: lambda.Runtime.NODEJS_22_X,
        entry: path.join(
          __dirname,
          "../lambda/getBookmarkCheckSingle/index.ts",
        ),
        functionName: `animeguri-get-bookmark-check-single-${envName}`,
        environment: {
          SUPABASE_URL: supabaseUrl,
          SUPABASE_SERVICE_ROLE_KEY: supabaseServiceRoleKey,
          CLOUDFRONT_DOMAIN: cloudFrontDistribution.distributionDomainName,
        },
        timeout: Duration.seconds(10),
        memorySize: 256,
      },
    );

    const createLike = new NodejsFunction(this, `CreateLike-${envName}`, {
      handler: "handler",
      runtime: lambda.Runtime.NODEJS_22_X,
      entry: path.join(__dirname, "../lambda/createLike/index.ts"),
      functionName: `animeguri-create-like-${envName}`,
      environment: {
        SUPABASE_URL: supabaseUrl,
        SUPABASE_SERVICE_ROLE_KEY: supabaseServiceRoleKey,
        CLOUDFRONT_DOMAIN: cloudFrontDistribution.distributionDomainName,
      },
      timeout: Duration.seconds(10),
      memorySize: 256,
    });

    const deleteLike = new NodejsFunction(this, `DeleteLike-${envName}`, {
      handler: "handler",
      runtime: lambda.Runtime.NODEJS_22_X,
      entry: path.join(__dirname, "../lambda/deleteLike/index.ts"),
      functionName: `animeguri-delete-like-${envName}`,
      environment: {
        SUPABASE_URL: supabaseUrl,
        SUPABASE_SERVICE_ROLE_KEY: supabaseServiceRoleKey,
      },
      timeout: Duration.seconds(10),
      memorySize: 256,
    });

    const getLikeCheckSingle = new NodejsFunction(
      this,
      `GetLikeCheckSingle-${envName}`,
      {
        handler: "handler",
        runtime: lambda.Runtime.NODEJS_22_X,
        entry: path.join(__dirname, "../lambda/getLikeCheckSingle/index.ts"),
        functionName: `animeguri-get-like-check-single-${envName}`,
        environment: {
          SUPABASE_URL: supabaseUrl,
          SUPABASE_SERVICE_ROLE_KEY: supabaseServiceRoleKey,
          CLOUDFRONT_DOMAIN: cloudFrontDistribution.distributionDomainName,
        },
        timeout: Duration.seconds(10),
        memorySize: 256,
      },
    );

    // cognito authorizer
    const authorizer = new HttpUserPoolAuthorizer(
      "UserPoolAuthorizer",
      userPool,
      {
        userPoolClients: [userPoolClient],
      },
    );

    // Lambda 統合
    const getUserIntegration = new HttpLambdaIntegration(
      "GetUserIntegration",
      getPublicUserFn,
    );

    const getMeIntegration = new HttpLambdaIntegration(
      "GetMeIntegration",
      getMeFn,
    );

    const createUserIntegration = new HttpLambdaIntegration(
      "CreateUserIntegration",
      createUserFn,
    );

    const patchUserProfileIntegration = new HttpLambdaIntegration(
      "PatchUserProfileIntegration",
      patchUserProfile,
    );

    const getListMyArticlesIntegration = new HttpLambdaIntegration(
      "GetListMyArticlesIntegration",
      getListMyArticles,
    );

    const getMyArticleIntegration = new HttpLambdaIntegration(
      "GetMyArticleIntegration",
      getMyArticle,
    );

    const getListArticlesIntegration = new HttpLambdaIntegration(
      "GetListArticlesIntegration",
      getListArticles,
    );

    const getListUserArticlesIntegration = new HttpLambdaIntegration(
      "GetListUserArticlesIntegration",
      getListUserArticles,
    );

    const getArticleIntegration = new HttpLambdaIntegration(
      "GetArticleIntegration",
      getArticle,
    );

    const createArticleIntegration = new HttpLambdaIntegration(
      "CreateArticleIntegration",
      createArticle,
    );

    const patchArticleIntegration = new HttpLambdaIntegration(
      "PatchArticleIntegration",
      patchArticle,
    );

    const deleteArticleIntegration = new HttpLambdaIntegration(
      "DeleteArticleIntegration",
      deleteArticle,
    );

    const getReportsIntegration = new HttpLambdaIntegration(
      "GetReportsIntegration",
      getReports,
    );

    const generatePresignedUrlIntegration = new HttpLambdaIntegration(
      "GeneratePresignedUrlIntegration",
      generatePresignedUrl,
    );

    const createBookmarkIntegration = new HttpLambdaIntegration(
      "CreateBookmarkIntegration",
      createBookmark,
    );

    const deleteBookmarkIntegration = new HttpLambdaIntegration(
      "DeleteBookmarkIntegration",
      deleteBookmark,
    );

    const getBookmarkArticlesListIntegration = new HttpLambdaIntegration(
      "GetBookmarkArticlesListIntegration",
      getBookmarkArticlesList,
    );

    const getBookmarkCheckSingleIntegration = new HttpLambdaIntegration(
      "GetBookmarkCheckSingleIntegration",
      getBookmarkCheckSingle,
    );

    const createLikeIntegration = new HttpLambdaIntegration(
      "CreateLikeIntegration",
      createLike,
    );

    const deleteLikeIntegration = new HttpLambdaIntegration(
      "DeleteLikeIntegration",
      deleteLike,
    );

    const getLikeCheckSingleIntegration = new HttpLambdaIntegration(
      "GetLikeCheckSingleIntegration",
      getLikeCheckSingle,
    );

    // API Gateway
    const api = new HttpApi(this, "AnimeguriApi", {
      apiName: `animeguri-api-${envName}`,
      corsPreflight: {
        allowHeaders: ["Content-Type", "Authorization"],
        allowOrigins: envName === "prod" ? ["https://www.animeguri.app"] : ["*"],
        allowMethods: [
          CorsHttpMethod.GET,
          CorsHttpMethod.POST,
          CorsHttpMethod.PATCH,
          CorsHttpMethod.DELETE,
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
      path: "/user/me/articles/{id}",
      methods: [HttpMethod.GET],
      integration: getMyArticleIntegration,
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
      path: "/articles",
      methods: [HttpMethod.PATCH],
      integration: patchArticleIntegration,
      authorizer,
    });

    api.addRoutes({
      path: "/articles/{id}",
      methods: [HttpMethod.DELETE],
      integration: deleteArticleIntegration,
      authorizer,
    });

    api.addRoutes({
      path: "/reports",
      methods: [HttpMethod.GET],
      integration: getReportsIntegration,
    });

    api.addRoutes({
      path: "/presigned-url",
      methods: [HttpMethod.POST],
      integration: generatePresignedUrlIntegration,
      authorizer,
    });

    api.addRoutes({
      path: "/bookmarks",
      methods: [HttpMethod.POST],
      integration: createBookmarkIntegration,
      authorizer,
    });

    api.addRoutes({
      path: "/bookmarks/{id}",
      methods: [HttpMethod.DELETE],
      integration: deleteBookmarkIntegration,
      authorizer,
    });

    api.addRoutes({
      path: "/users/bookmarks",
      methods: [HttpMethod.GET],
      integration: getBookmarkArticlesListIntegration,
      authorizer,
    });

    api.addRoutes({
      path: "/bookmarks/check",
      methods: [HttpMethod.GET],
      integration: getBookmarkCheckSingleIntegration,
      authorizer,
    });

    api.addRoutes({
      path: "/likes",
      methods: [HttpMethod.POST],
      integration: createLikeIntegration,
      authorizer,
    });

    api.addRoutes({
      path: "/likes/{id}",
      methods: [HttpMethod.DELETE],
      integration: deleteLikeIntegration,
      authorizer,
    });

    api.addRoutes({
      path: "/likes/check",
      methods: [HttpMethod.GET],
      integration: getLikeCheckSingleIntegration,
      authorizer,
    });

    // s3読み許可
    imagesBucket.grantReadWrite(getMeFn);
    imagesBucket.grantRead(getListArticles);
    imagesBucket.grantRead(getListMyArticles);
    imagesBucket.grantRead(getArticle);
    // S3への署名付きURL生成権限を付与
    imagesBucket.grantPut(generatePresignedUrl);
  }
}
