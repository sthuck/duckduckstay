export function getScreenshotsS3Bucket(): string {
    const bucket = process.env['SCREENSHOTS_S3_BUCKET'];
    if (!bucket) {
        throw new Error("SCREENSHOTS_S3_BUCKET env var required");
    }

    return bucket;
}

export function getRedisUrl(): string | null {
    const redisUrl = process.env['REDIS_URL'];
    if (redisUrl) {
        return redisUrl;
    } else {
        return null;
    }
}