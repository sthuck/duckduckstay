export function getScreenshotsS3Bucket(): string {
    const bucket = process.env['SCREENSHOTS_S3_BUCKET'];
    if (!bucket) {
        throw new Error("SCREENSHOTS_S3_BUCKET env var required");
    }

    return bucket;
}
