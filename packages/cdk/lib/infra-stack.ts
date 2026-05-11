import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as cognito from "aws-cdk-lib/aws-cognito";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as cloudfront_origins from "aws-cdk-lib/aws-cloudfront-origins";

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

    // Cognito UserPool
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
    });

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
      },
    );

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
          allowedOrigins: envName === "prod" ? ["https://animeguri.app"] : ["*"],
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
