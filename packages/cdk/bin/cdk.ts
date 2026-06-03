#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { ApiStack } from "../lib/api-stack";
import { InfraStack } from "../lib/infra-stack";
import * as dotenv from "dotenv";
import * as path from "path";

// .envファイルを読み込み
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const app = new cdk.App();
const awsEnv = {
  account: "661303382183",
  region: "ap-northeast-1",
};

const envName = process.env.APP_ENV || "dev";

const infra = new InfraStack(app, `InfraStack-${envName}`, {
  env: awsEnv,
  envName: envName,
});

new ApiStack(app, `ApiStack-${envName}`, {
  env: awsEnv,
  envName: envName,
  userPool: infra.userPool,
  userPoolClient: infra.userPoolClient,
  imagesBucket: infra.imagesBucket,
  cloudFrontDistribution: infra.imagesDistribution,
  placeIndex: infra.placeIndex,
});
