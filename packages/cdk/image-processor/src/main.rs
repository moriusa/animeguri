use aws_lambda_events::event::s3::S3Event;
use lambda_runtime::{run, service_fn, Error, LambdaEvent};
use aws_config::BehaviorVersion;
use aws_sdk_s3::Client as S3Client;
use aws_sdk_s3::primitives::ByteStream;
use image::ImageFormat;
use std::env;
use std::io::Cursor;

async fn function_handler(event: LambdaEvent<S3Event>, s3_client: &S3Client) -> Result<(), Error> {
    // CDKから渡される環境変数（保存先バケット名）を取得
    let bucket_name = env::var("S3_BUCKET_NAME")
        .map_err(|_| Error::from("環境変数 S3_BUCKET_NAME が設定されていません"))?;

    for record in event.payload.records {
        // 1. S3からイベントが起きたファイルのキー（パス）を取得
        let src_key = record.s3.object.key.ok_or("S3 key is missing")?;

        // URLエンコード（スペースが+になっていたりする問題）をデコード
        let src_key = urlencoding::decode(&src_key)?.into_owned();

        // 無限ループ防止のため、originals/ 以外の画像は無視する
        if !src_key.starts_with("originals/") {
            println!("Skipping non-original file: {}", src_key);
            continue;
        }

        println!("変換処理を開始します: {}", src_key);

        // 2. 元画像を S3 からダウンロード
        let s3_object = s3_client
            .get_object()
            .bucket(&bucket_name)
            .key(&src_key)
            .send()
            .await?;

        let data = s3_object.body.collect().await?.into_bytes();

        // 3. image クレートを使ってメモリ上に画像を読み込む
        let img = image::load_from_memory(&data)?;

        // 【オプション】もしここで画像のリサイズもしたい場合、以下のコードを生かしてください
        // let img = img.resize(1200, 1200, image::imageops::FilterType::Lanczos3);

        // 4. メモリバッファを用意し、WebP 形式で書き込む
        let mut webp_data = Vec::new();
        img.write_to(&mut Cursor::new(&mut webp_data), ImageFormat::WebP)?;

        // 5. 保存用の新しいキーを生成 (originals/abc.jpg ➔ resized/abc.webp)
        let dst_key = src_key
            .replace("originals/", "resized/")
            .rsplit_once('.')
            .map(|(base, _)| format!("{}.webp", base))
            .unwrap_or_else(|| format!("{}.webp", src_key));

        // 6. 変換後の WebP データを S3 の resized/ フォルダにアップロード
        s3_client
            .put_object()
            .bucket(&bucket_name)
            .key(&dst_key)
            .body(ByteStream::from(webp_data))
            .content_type("image/webp")
            .send()
            .await?;

        println!("WebP変換・アップロードが成功しました: {}", dst_key);
    }

    Ok(())
}

#[tokio::main]
async fn main() -> Result<(), Error> {
    // AWS SDK の初期化
    let config = aws_config::load_defaults(BehaviorVersion::latest()).await;
    let s3_client = S3Client::new(&config);

    // Lambda ランタイムの起動
    run(service_fn(|event: LambdaEvent<S3Event>| {
        function_handler(event, &s3_client)
    })).await
}