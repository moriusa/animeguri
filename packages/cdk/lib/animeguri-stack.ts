import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import { Construct } from "constructs";
import * as path from "path";
import {
  NodejsFunction,
  NodejsFunctionProps,
} from "aws-cdk-lib/aws-lambda-nodejs";
import { Duration } from "aws-cdk-lib";
import { HttpUserPoolAuthorizer } from "@aws-cdk/aws-apigatewayv2-authorizers-alpha";
import * as cognito from "aws-cdk-lib/aws-cognito";
import {
  HttpApi,
  HttpMethod,
  CorsHttpMethod,
} from "@aws-cdk/aws-apigatewayv2-alpha";
import { HttpLambdaIntegration } from "@aws-cdk/aws-apigatewayv2-integrations-alpha";
import * as location from "aws-cdk-lib/aws-location";
import * as iam from "aws-cdk-lib/aws-iam";
import * as s3n from "aws-cdk-lib/aws-s3-notifications";
import * as cloudfront_origins from "aws-cdk-lib/aws-cloudfront-origins";
import { Architecture } from "aws-cdk-lib/aws-lambda";

interface AnimeguriStackProps extends cdk.StackProps {
  envName: string;
}

export class AnimeguriStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: AnimeguriStackProps) {
    super(scope, id, props);
    const { envName } = props;

    const SUPABASE_URL =
      envName === "dev"
        ? process.env.SUPABASE_URL_DEV!
        : process.env.SUPABASE_URL_PROD!;
    const SUPABASE_SERVICE_ROLE_KEY =
      envName === "dev"
        ? process.env.SUPABASE_SERVICE_ROLE_KEY_DEV!
        : process.env.SUPABASE_SERVICE_ROLE_KEY_PROD!;

    // S3Bucket
    const imagesBucket = new s3.Bucket(this, `ImagesBucket-${envName}`, {
      bucketName: `animeguri-images-${envName}`,
      versioned: false,
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      // 本番（prod）は削除してもデータ保持、それ以外は削除時にバケットも消す設定
      removalPolicy:
        envName === "prod"
          ? cdk.RemovalPolicy.RETAIN
          : cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: envName !== "prod", // prod以外はバケット削除時に中身も空にする
      cors: [
        {
          allowedMethods: [
            s3.HttpMethods.GET,
            s3.HttpMethods.POST,
            s3.HttpMethods.PUT,
          ],
          allowedOrigins:
            envName === "prod" ? ["https://www.animeguri.app"] : ["*"],
          allowedHeaders: ["*"],
        },
      ],
    });

    // cloudFront
    const imagesDistribution = new cloudfront.Distribution(
      this,
      `animeguri-ImagesDistribution-${envName}`,
      {
        defaultRootObject: "", // 静的サイトじゃないので基本不要
        defaultBehavior: {
          // ← ここが「最新の OAC を使う S3 オリジン」の書き方
          origin:
            cloudfront_origins.S3BucketOrigin.withOriginAccessControl(
              imagesBucket,
            ),
          viewerProtocolPolicy:
            cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        },
      },
    );

    // locationService
    const placeIndex = new location.CfnPlaceIndex(
      this,
      `HolyPlaceIndex-${props.envName}`,
      {
        indexName: `HolyPlaceIndex-${props.envName}`,
        dataSource: "Here", // 日本の住所精度に強い HERE（または Esri）を選択
        pricingPlan: "RequestBasedUsage", // リクエストベースの料金プラン
      },
    );

    // UserPool
    const userPool = new cognito.UserPool(this, `UserPool-${envName}`, {
      userPoolName: `animeguri-user-pool-${envName}`,
      selfSignUpEnabled: true,
      signInAliases: { email: true },
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: false,
      },
    });

    //TODO Cognitoドメイン(必要ないかも？)
    userPool.addDomain(`UserPoolDomain-${envName}`, {
      cognitoDomain: {
        domainPrefix: `animeguri-auth-${envName}`,
      },
    });

    // Googleプロバイダー
    const googleProvider = new cognito.UserPoolIdentityProviderGoogle(
      this,
      `GoogleProvider-${envName}`,
      {
        userPool: userPool,
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecretValue: cdk.SecretValue.unsafePlainText(
          process.env.GOOGLE_CLIENT_SECRET!,
        ),
        scopes: ["email", "openid", "profile"],
        attributeMapping: {
          email: cognito.ProviderAttribute.GOOGLE_EMAIL,
          custom: {
            username: cognito.ProviderAttribute.other("sub"),
          },
        },
      },
    );

    // UserPoolClient
    const userPoolClient = new cognito.UserPoolClient(
      this,
      `UserPoolClient-${envName}`,
      {
        userPool: userPool,
        authFlows: {
          userPassword: true,
          userSrp: true,
        },
        accessTokenValidity: cdk.Duration.hours(1), // アクセストークン有効期限
        idTokenValidity: cdk.Duration.hours(1), // IDトークン有効期限
        refreshTokenValidity: cdk.Duration.days(30), // リフレッシュトークン有効期限
        oAuth: {
          flows: {
            authorizationCodeGrant: true,
          },
          scopes: [
            cognito.OAuthScope.EMAIL,
            cognito.OAuthScope.OPENID,
            cognito.OAuthScope.PROFILE,
          ],
          callbackUrls: ["http://localhost:3000", "https://www.animeguri.app"],
          logoutUrls: ["http://localhost:3000", "https://www.animeguri.app"],
        },
        supportedIdentityProviders: [
          cognito.UserPoolClientIdentityProvider.COGNITO,
          cognito.UserPoolClientIdentityProvider.GOOGLE,
        ],
      },
    );
    userPoolClient.node.addDependency(googleProvider);

    // Cognito authorizer
    const authorizer = new HttpUserPoolAuthorizer(
      "UserPoolAuthorizer",
      userPool,
      {
        userPoolClients: [userPoolClient],
      },
    );

    // API Gateway
    const api = new HttpApi(this, "AnimeguriApi", {
      apiName: `animeguri-api-${envName}`,
      corsPreflight: {
        allowHeaders: ["Content-Type", "Authorization"],
        allowOrigins:
          envName === "prod" ? ["https://www.animeguri.app"] : ["*"],
        allowMethods: [
          CorsHttpMethod.GET,
          CorsHttpMethod.POST,
          CorsHttpMethod.PATCH,
          CorsHttpMethod.DELETE,
          CorsHttpMethod.OPTIONS,
        ],
      },
    });

    // util関数
    interface CreateLambdaProps {
      id: string;
      entryPath: string;
      functionName: string;
      environment?: Record<string, string>; // 個別の環境変数
      timeoutSeconds?: number;
      memorySize?: number;
      architecture?: Architecture;
      bundling?: NodejsFunctionProps["bundling"];
    }
    const createLambdaFn = (scope: Construct, props: CreateLambdaProps) => {
      const baseEnvironment = {
        SUPABASE_URL: SUPABASE_URL,
        SUPABASE_SERVICE_ROLE_KEY: SUPABASE_SERVICE_ROLE_KEY,
        CLOUDFRONT_DOMAIN: imagesDistribution.distributionDomainName,
        S3_BUCKET_NAME: imagesBucket.bucketName,
      };
      return new NodejsFunction(scope, `${props.id}-${envName}`, {
        handler: "handler",
        runtime: lambda.Runtime.NODEJS_22_X,
        entry: path.join(__dirname, props.entryPath),
        functionName: `animeguri-${props.functionName}-${envName}`,
        environment: {
          ...baseEnvironment,
          ...props.environment,
        },
        timeout: Duration.seconds(props.timeoutSeconds ?? 10),
        memorySize: props.memorySize ?? 256,
        architecture: props.architecture ?? Architecture.ARM_64, // コスト節約
        bundling: props.bundling ?? {
          minify: true, // コードを軽量化する
          sourceMap: true, // エラー時に元のTSコードの行数をログに出す
        },
      });
    };

    interface CreateApiRouteProps {
      id: string;
      lambdaFn: NodejsFunction;
      apiPath: string;
      methods: HttpMethod[];
    }

    const createApiRoute = (props: CreateApiRouteProps, auth = false) => {
      const integration = new HttpLambdaIntegration(
        `${props.id}Integration`,
        props.lambdaFn,
      );
      api.addRoutes({
        path: props.apiPath,
        methods: props.methods,
        integration: integration,
        authorizer: auth ? authorizer : undefined,
      });
    };

    // lambda関数
    const getPublicUserProfile = createLambdaFn(this, {
      id: "GetPublicUser",
      entryPath: "../lambda/getPublicUserProfile/index.ts",
      functionName: "get-public-user-profile",
    });
    createApiRoute({
      id: "GetPublicUserProfile",
      lambdaFn: getPublicUserProfile,
      apiPath: "/user/{userId}",
      methods: [HttpMethod.GET],
    });

    const getMyProfile = createLambdaFn(this, {
      id: "GetMyProfile",
      entryPath: "../lambda/getMyProfile/index.ts",
      functionName: "get-my-profile",
    });
    createApiRoute(
      {
        id: "GetMyProfile",
        lambdaFn: getMyProfile,
        apiPath: "/user/me",
        methods: [HttpMethod.GET],
      },
      true,
    );

    const createUserProfile = createLambdaFn(this, {
      id: "CreateUserProfile",
      entryPath: "../lambda/createUserProfile/index.ts",
      functionName: "create-user-profile",
    });
    createApiRoute(
      {
        id: "CreateUserProfile",
        lambdaFn: createUserProfile,
        apiPath: "/user/me",
        methods: [HttpMethod.POST],
      },
      true,
    );

    const patchUserProfile = createLambdaFn(this, {
      id: "PatchUserProfile",
      entryPath: "../lambda/patchUserProfile/index.ts",
      functionName: "patch-user-profile",
    });
    createApiRoute(
      {
        id: "PatchUserProfile",
        lambdaFn: patchUserProfile,
        apiPath: "/user/me",
        methods: [HttpMethod.PATCH],
      },
      true,
    );

    const getMyArticle = createLambdaFn(this, {
      id: "GetMyArticle",
      entryPath: "../lambda/getMyArticle/index.ts",
      functionName: "get-my-article",
    });
    createApiRoute(
      {
        id: "GetMyArticle",
        lambdaFn: getMyArticle,
        apiPath: "/user/me/articles/{id}",
        methods: [HttpMethod.GET],
      },
      true,
    );

    const getMyArticleList = createLambdaFn(this, {
      id: "GetMyArticleList",
      entryPath: "../lambda/getMyArticleList/index.ts",
      functionName: "get-my-article-list",
    });
    createApiRoute(
      {
        id: "GetMyArticleList",
        lambdaFn: getMyArticleList,
        apiPath: "/user/me/articles",
        methods: [HttpMethod.GET],
      },
      true,
    );

    const getArticleList = createLambdaFn(this, {
      id: "GetArticleList",
      entryPath: "../lambda/getArticleList/index.ts",
      functionName: "get-article-list",
    });
    createApiRoute({
      id: "GetArticleList",
      lambdaFn: getArticleList,
      apiPath: "/articles",
      methods: [HttpMethod.GET],
    });

    const getUserArticleList = createLambdaFn(this, {
      id: "GetUserArticleList",
      entryPath: "../lambda/getUserArticleList/index.ts",
      functionName: "get-user-article-list",
    });
    createApiRoute({
      id: "GetUserArticleList",
      lambdaFn: getUserArticleList,
      apiPath: "/user/{id}/articles",
      methods: [HttpMethod.GET],
    });

    const getArticle = createLambdaFn(this, {
      id: "GetArticle",
      entryPath: "../lambda/getArticle/index.ts",
      functionName: "get-article",
    });
    createApiRoute({
      id: "GetArticle",
      lambdaFn: getArticle,
      apiPath: "/articles/{id}",
      methods: [HttpMethod.GET],
    });

    const createArticle = createLambdaFn(this, {
      id: "CreateArticle",
      entryPath: "../lambda/createArticle/index.ts",
      functionName: "create-article",
    });
    createApiRoute(
      {
        id: "CreateArticle",
        lambdaFn: createArticle,
        apiPath: "/articles",
        methods: [HttpMethod.POST],
      },
      true,
    );

    const patchArticle = createLambdaFn(this, {
      id: "PatchArticle",
      entryPath: "../lambda/patchArticle/index.ts",
      functionName: "patch-article",
    });
    createApiRoute(
      {
        id: "PatchArticle",
        lambdaFn: patchArticle,
        apiPath: "/articles",
        methods: [HttpMethod.PATCH],
      },
      true,
    );

    const deleteArticle = createLambdaFn(this, {
      id: "DeleteArticle",
      entryPath: "../lambda/deleteArticle/index.ts",
      functionName: "delete-article",
    });
    createApiRoute(
      {
        id: "DeleteArticle",
        lambdaFn: deleteArticle,
        apiPath: "/articles/{id}",
        methods: [HttpMethod.DELETE],
      },
      true,
    );

    const getReportList = createLambdaFn(this, {
      id: "GetReportList",
      entryPath: "../lambda/getReportList/index.ts",
      functionName: "get-report-list",
    });
    createApiRoute({
      id: "GetReportList",
      lambdaFn: getReportList,
      apiPath: "/reports",
      methods: [HttpMethod.GET],
    });

    const generatePresignedUrl = createLambdaFn(this, {
      id: "GeneratePresignedUrl",
      entryPath: "../lambda/generatePresignedUrl/index.ts",
      functionName: "generate-presigned-url",
    });
    createApiRoute(
      {
        id: "GeneratePresignedUrl",
        lambdaFn: generatePresignedUrl,
        apiPath: "/presigned-url",
        methods: [HttpMethod.POST],
      },
      true,
    );

    const createBookmark = createLambdaFn(this, {
      id: "CreateBookmark",
      entryPath: "../lambda/createBookmark/index.ts",
      functionName: "create-bookmark",
    });
    createApiRoute(
      {
        id: "CreateBookmark",
        lambdaFn: createBookmark,
        apiPath: "/bookmarks",
        methods: [HttpMethod.POST],
      },
      true,
    );

    const deleteBookmark = createLambdaFn(this, {
      id: "DeleteBookmark",
      entryPath: "../lambda/deleteBookmark/index.ts",
      functionName: "delete-bookmark",
    });
    createApiRoute(
      {
        id: "DeleteBookmark",
        lambdaFn: deleteBookmark,
        apiPath: "/bookmarks/{id}",
        methods: [HttpMethod.DELETE],
      },
      true,
    );

    const getBookmarkArticleList = createLambdaFn(this, {
      id: "GetBookmarkArticleList",
      entryPath: "../lambda/getBookmarkArticleList/index.ts",
      functionName: "get-bookmark-article-list",
    });
    createApiRoute(
      {
        id: "GetBookmarkArticleList",
        lambdaFn: getBookmarkArticleList,
        apiPath: "/users/bookmarks",
        methods: [HttpMethod.GET],
      },
      true,
    );

    const getBookmarkCheckSingle = createLambdaFn(this, {
      id: "GetBookmarkCheckSingle",
      entryPath: "../lambda/getBookmarkCheckSingle/index.ts",
      functionName: "get-bookmark-check-single",
    });
    createApiRoute(
      {
        id: "GetBookmarkCheckSingle",
        lambdaFn: getBookmarkCheckSingle,
        apiPath: "/bookmarks/check",
        methods: [HttpMethod.GET],
      },
      true,
    );

    const createLike = createLambdaFn(this, {
      id: "CreateLike",
      entryPath: "../lambda/createLike/index.ts",
      functionName: "create-like",
    });
    createApiRoute(
      {
        id: "CreateLike",
        lambdaFn: createLike,
        apiPath: "/likes",
        methods: [HttpMethod.POST],
      },
      true,
    );

    const deleteLike = createLambdaFn(this, {
      id: "DeleteLike",
      entryPath: "../lambda/deleteLike/index.ts",
      functionName: "delete-like",
    });
    createApiRoute(
      {
        id: "DeleteLike",
        lambdaFn: deleteLike,
        apiPath: "/likes/{id}",
        methods: [HttpMethod.DELETE],
      },
      true,
    );

    const getLikeCheckSingle = createLambdaFn(this, {
      id: "GetLikeCheckSingle",
      entryPath: "../lambda/getLikeCheckSingle/index.ts",
      functionName: "get-like-check-single",
    });
    createApiRoute(
      {
        id: "GetLikeCheckSingle",
        lambdaFn: getLikeCheckSingle,
        apiPath: "/likes/check",
        methods: [HttpMethod.GET],
      },
      true,
    );

    const reverseGeocode = createLambdaFn(this, {
      id: "ReverseGeocode",
      entryPath: "../lambda/reverseGeocode/index.ts",
      functionName: "reverse-geocode",
      environment: {
        PLACE_INDEX_NAME: placeIndex.indexName,
      },
    });
    createApiRoute(
      {
        id: "ReverseGeocode",
        lambdaFn: reverseGeocode,
        apiPath: "/geocode/reverse",
        methods: [HttpMethod.GET],
      },
      true,
    );

    // lambda(trigger)
    const createGoogleUserProfile = createLambdaFn(this, {
      id: "CreateGoogleUserProfile",
      entryPath: "../lambda/trigger/createGoogleUserProfile/index.ts",
      functionName: "create-google-user-profile",
    });

    const imageCompression = createLambdaFn(this, {
      id: "ImageCompression",
      entryPath: "../lambda/trigger/imageCompression/index.ts",
      functionName: "image-compression",
      timeoutSeconds: 30,
      memorySize: 1024,
      architecture: Architecture.X86_64,
      bundling: {
        minify: true,
        sourceMap: true,
        nodeModules: ["sharp"],
      },
    });

    // addTrigger
    userPool.addTrigger(
      cognito.UserPoolOperation.POST_CONFIRMATION, // signUp確認後発火
      createGoogleUserProfile,
    );

    imagesBucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3n.LambdaDestination(imageCompression),
      { prefix: "originals/" }, // originals直下で無限ループ防止
    );

    // IAM権限付与
    // S3
    imagesBucket.grantReadWrite(imageCompression);
    imagesBucket.grantDelete(imageCompression);
    // S3への署名付きURL生成権限
    imagesBucket.grantPut(generatePresignedUrl);
    // AmazonLocationServiceを検索する権限
    reverseGeocode.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["geo:SearchPlaceIndexForPosition"],
        resources: [placeIndex.attrIndexArn],
      }),
    );
  }
}
