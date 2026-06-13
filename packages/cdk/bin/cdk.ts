#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import * as dotenv from "dotenv";
import * as path from "path";
import { AnimeguriStack } from "../lib/animeguri-stack";

// .envファイルを読み込み
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const app = new cdk.App();
const awsEnv = {
  account: "661303382183",
  region: "ap-northeast-1",
};

const envName = process.env.APP_ENV || "dev";

new AnimeguriStack(app, `AnimeguriStack-${envName}`, {
  envName: envName,
});
