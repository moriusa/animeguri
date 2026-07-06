use aws_lambda_events::event::s3::S3Event;
use aws_sdk_s3::primitives::ByteStream;
use aws_sdk_s3::Client as S3Client;
use lambda_runtime::{run, service_fn, Error, LambdaEvent};
use webp::Encoder;

#[tokio::main]
async fn main() -> Result<(), Error> {
    run(service_fn(function_handler)).await
}

async fn function_handler(event: LambdaEvent<S3Event>) -> Result<(), Error> {
    let config = aws_config::load_from_env().await;
    let s3_client = S3Client::new(&config);

    for record in event.payload.records {
        let bucket_name = record.s3.bucket.name.ok_or("Bucket name missing")?;
        let src_key = record.s3.object.key.ok_or("Object key missing")?;
        let src_key = src_key.replace('+', " ").replace("%20", " ");

        // 1. originals/ 以外のイベントは無視して無限ループを防ぐ
        if !src_key.starts_with("originals/") {
            continue;
        }

        // 2. S3 からオリジナル画像をダウンロード
        let get_obj_res = s3_client
            .get_object()
            .bucket(&bucket_name)
            .key(&src_key)
            .send()
            .await?;

        let data = get_obj_res.body.collect().await?.into_bytes();

        // 3. 画像のデコードと長辺 1600px へのリサイズ
        let img = image::load_from_memory(&data)?;
        let optimized_img = if img.width() > 1600 || img.height() > 1600 {
            img.resize(1600, 1600, image::imageops::FilterType::Lanczos3)
        } else {
            img
        };

        // 4. 品質80%の非可逆(Lossy) WebPを生成
        let webp_encoder = Encoder::from_image(&optimized_img)
            .map_err(|e| format!("WebP conversion error: {}", e))?;
        let webp_memory = webp_encoder.encode(80.0);
        let opt_webp = webp_memory.to_vec();

        // 5. 保存先のパスを作成 (originals/abc.jpg -> processed/abc.webp)
        let dst_key = src_key
            .replace("originals/", "processed/")
            .rsplit_once('.')
            .map(|(base, _)| format!("{}.webp", base))
            .unwrap_or_else(|| format!("{}.webp", src_key));

        // 6. 変換後の WebP データを S3 にアップロード
        s3_client
            .put_object()
            .bucket(&bucket_name)
            .key(&dst_key)
            .body(ByteStream::from(opt_webp))
            .content_type("image/webp")
            .send()
            .await?;

        println!("Successfully processed and saved to: {}", dst_key);
    }

    Ok(())
}