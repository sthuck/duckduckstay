import { SearchResults, WebpageResult } from "./searchEs";
import { createHash } from "crypto";
import { S3 } from "aws-sdk";

export async function fillScreenshotUrls(s3Bucket: string, searchResults: SearchResults<{}>): Promise<SearchResults<string>> {
    const s3 = new S3();

    const resultPromises: Promise<WebpageResult<string>>[] = [];
    for (const result of searchResults.results) {
        resultPromises.push(fillResultScreenshot(s3, s3Bucket, result));
    }

    return {
        results: await Promise.all(resultPromises)
    };
}

async function fillResultScreenshot(s3: S3, s3Bucket: string, result: WebpageResult<{}>): Promise<WebpageResult<string>> {
    const key = webpageUrlScreenshotHash(result.url) + ".png";

    try {
        await s3.headObject({
            Bucket: s3Bucket,
            Key: key
        }).promise();

        const signedUrl = await s3.getSignedUrlPromise("getObject", {
            Bucket: s3Bucket,
            Key: key
        });

        return {
            ...result,
            screenshotUrl: signedUrl
        };
    } catch (err) {
        console.warn(err);
        return {
            ...result,
            screenshotUrl: "https://via.placeholder.com/144x144"
        };
    }
}

export function webpageUrlScreenshotHash(url: string): string {
    const sha1Hash = createHash('sha1');
    return sha1Hash.update(url).digest("hex");
}
