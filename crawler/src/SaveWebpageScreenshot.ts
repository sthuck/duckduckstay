import { S3 } from "aws-sdk"
import { createHash } from "crypto";
import jimp from "jimp";

const SCREENSHOT_SIZE = 144;

async function resizeScreenshot(screenshot: Buffer): Promise<Buffer> {
    const image = await jimp.read(screenshot);
    if (image.getWidth() <= image.getHeight()) {
        await image.crop(0, 0, image.getWidth(), image.getWidth());
    } else {
        await image.crop(0, 0, image.getHeight(), image.getHeight());
    }
    await image.resize(SCREENSHOT_SIZE, SCREENSHOT_SIZE, jimp.RESIZE_BICUBIC);

    return await image.getBufferAsync("image/png");
}

export async function saveWebpageScreenshot(s3Bucket: string, url: string, screenshot: Buffer): Promise<void> {
    const thumbnail = await resizeScreenshot(screenshot);

    const s3 = new S3();

    await s3.putObject({
        Bucket: s3Bucket,
        Key: webpageUrlScreenshotHash(url) + ".png",
        ContentType: "image/png",
        Body: thumbnail
    }).promise();
}

export function webpageUrlScreenshotHash(url: string): string {
    const sha1Hash = createHash('sha1');
    return sha1Hash.update(url).digest("hex");
}
