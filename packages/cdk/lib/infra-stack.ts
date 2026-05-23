import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as cognito from "aws-cdk-lib/aws-cognito";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as cloudfront_origins from "aws-cdk-lib/aws-cloudfront-origins";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as path from "path";
import { Duration } from "aws-cdk-lib";

interface InfraStackProps extends cdk.StackProps {
  envName: string;
}

export class InfraStack extends cdk.Stack {
  // 他スタックから使うために public に出す
  public readonly userPool: cognito.UserPool;
  public readonly userPoolClient: cognito.UserPoolClient;
  public readonly imagesBucket: s3.Bucket;
  public readonly imagesDistribution: cloudfront.Distribution;

  constructor(scope: Construct, id: string, props: InfraStackProps) {
    super(scope, id, props);
    const { envName } = props;

    const supabaseUrl =
      envName === "dev"
        ? process.env.SUPABASE_URL_DEV!
        : process.env.SUPABASE_URL_PROD!;
    const supabaseServiceRoleKey =
      envName === "dev"
        ? process.env.SUPABASE_SERVICE_ROLE_KEY_DEV!
        : process.env.SUPABASE_SERVICE_ROLE_KEY_PROD!;

    // 1. まず先にLambda関数を定義する（UserPoolより上に移動！）
    const createGoogleUserProfile = new NodejsFunction(
      this,
      `CreateGoogleUserProfile-${envName}`,
      {
        handler: "handler",
        runtime: lambda.Runtime.NODEJS_22_X,
        entry: path.join(
          __dirname,
          "../lambda/trigger/createGoogleUserProfile/index.ts",
        ),
        functionName: `animeguri-create-google-user-profile-${envName}`,
        environment: {
          SUPABASE_URL: supabaseUrl,
          SUPABASE_SERVICE_ROLE_KEY: supabaseServiceRoleKey,
        },
        timeout: Duration.seconds(10),
        memorySize: 128,
      },
    );

    // 2. UserPoolの作成時に、lambdaTriggers プロパティで直接指定する
    this.userPool = new cognito.UserPool(this, `UserPool-${envName}`, {
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
      // 🔥 ここで最初からトリガーを紐付ける（POST_CONFIRMATION に変更）
      lambdaTriggers: {
        postConfirmation: createGoogleUserProfile,
      },
    });

    // Cognitoドメイン
    this.userPool.addDomain(`UserPoolDomain-${envName}`, {
      cognitoDomain: {
        domainPrefix: `animeguri-auth-${envName}`,
      },
    });

    // Googleプロバイダー
    const googleProvider = new cognito.UserPoolIdentityProviderGoogle(
      this,
      `GoogleProvider-${envName}`,
      {
        userPool: this.userPool,
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

    this.userPoolClient = new cognito.UserPoolClient(
      this,
      `UserPoolClient-${envName}`,
      {
        userPool: this.userPool,
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
    this.userPoolClient.node.addDependency(googleProvider);

    // S3バケット
    this.imagesBucket = new s3.Bucket(this, `ImagesBucket-${envName}`, {
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
    this.imagesDistribution = new cloudfront.Distribution(
      this,
      `ImagesDistribution-${envName}`,
      {
        defaultRootObject: "", // 静的サイトじゃないので基本不要
        defaultBehavior: {
          // ← ここが「最新の OAC を使う S3 オリジン」の書き方
          origin: cloudfront_origins.S3BucketOrigin.withOriginAccessControl(
            this.imagesBucket,
          ),
          viewerProtocolPolicy:
            cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        },
      },
    );
  }
}
