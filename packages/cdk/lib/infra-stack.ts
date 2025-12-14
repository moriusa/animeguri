import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as cognito from "aws-cdk-lib/aws-cognito";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as ssm from "aws-cdk-lib/aws-ssm";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as cloudfront_origins from "aws-cdk-lib/aws-cloudfront-origins";

export class InfraStack extends cdk.Stack {
  // 他スタックから使うために public に出す
  public readonly userPool: cognito.UserPool;
  public readonly userPoolClient: cognito.UserPoolClient;
  public readonly supabaseUrlParam: ssm.IStringParameter;
  public readonly supabaseAnonKeyParam: ssm.IStringParameter;
  public readonly imagesBucket: s3.Bucket;
  public readonly imagesDistribution: cloudfront.Distribution;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Cognito UserPool
    this.userPool = new cognito.UserPool(this, "UserPool", {
      userPoolName: "animeguri-user-pool",
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

    this.userPoolClient = new cognito.UserPoolClient(this, "UserPoolClient", {
      userPool: this.userPool,
    });

    // S3 (ユーザープロフィール画像)
    this.imagesBucket = new s3.Bucket(this, "ImagesBucket", {
      // bucketName は省略でも可（CDK に任せる方が安全）
      bucketName: `animeguri-images`,
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
          allowedOrigins: ["*"], // 本番では制限
          allowedHeaders: ["*"],
        },
      ],
    });

    this.imagesDistribution = new cloudfront.Distribution(
      this,
      "ImagesDistribution",
      {
        defaultRootObject: "", // 静的サイトじゃないので基本不要
        defaultBehavior: {
          // ← ここが「最新の OAC を使う S3 オリジン」の書き方
          origin: cloudfront_origins.S3BucketOrigin.withOriginAccessControl(
            this.imagesBucket
          ),
          viewerProtocolPolicy:
            cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        },
      }
    );

    // Supabase URL / anon-key を ParameterStore に作成
    this.supabaseUrlParam = new ssm.StringParameter(this, "SupabaseUrl", {
      parameterName: "/animeguri/supabase/url",
      stringValue: "CHANGE_AFTER_DEPLOY", // デプロイ後に手動で変更する
    });

    this.supabaseAnonKeyParam = new ssm.StringParameter(
      this,
      "SupabaseAnonKey",
      {
        parameterName: "/animeguri/supabase/anon-key",
        stringValue: "CHANGE_AFTER_DEPLOY", // デプロイ後に手動で変更する
      }
    );

    // CloudFront のドメインを SSM に
    new ssm.StringParameter(this, "ImagesCdnDomain", {
      parameterName: "/animeguri/cdn/images-domain",
      stringValue: this.imagesDistribution.distributionDomainName,
    });
  }
}
