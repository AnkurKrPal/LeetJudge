import { StorageProvider } from './StorageProvider.js';
import crypto from 'crypto';
import path from 'path';
import axios from 'axios';
import { getMimeTypeFromPath } from '../../utils/mime.util.js';

export class GithubStorageProvider extends StorageProvider {
    constructor() {
        super();
        this.token = process.env.GITHUB_TOKEN;
        this.repo = process.env.GITHUB_REPO; // format: 'username/repo'
        this.branch = process.env.GITHUB_BRANCH || 'main';
        
        if (!this.token || !this.repo) {
            console.warn("WARNING: GITHUB_TOKEN or GITHUB_REPO not provided. GithubStorageProvider will fail if used.");
        }
    }

    async uploadFile(file) {
        if (!this.token || !this.repo) {
            throw new Error("GitHub storage is not configured properly (missing GITHUB_TOKEN or GITHUB_REPO).");
        }

        const fileExt = path.extname(file.originalname);
        const fileName = `${crypto.randomUUID()}${fileExt}`;
        const uploadPath = `images/${fileName}`; // Store in an 'images' folder in the repo

        // GitHub API requires file content to be Base64 encoded
        const contentBase64 = file.buffer.toString('base64');

        const url = `https://api.github.com/repos/${this.repo}/contents/${uploadPath}`;

        let response;
        try {
            response = await axios.put(url, {
                message: `Upload image ${fileName} via LeetJudge`,
                content: contentBase64,
                branch: this.branch
            }, {
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json',
                    'User-Agent': 'LeetJudge-Storage-App'
                }
            });
        } catch (error) {
            console.error("GitHub API Error:", error.response?.data || error.message);
            throw new Error(`Failed to upload to GitHub: ${error.response?.statusText || error.message}`);
        }

        const sha = response.data.content?.sha;

        // Serve through our API proxy — raw.githubusercontent.com has CDN propagation delays
        const resultUrl = `/api/images/${uploadPath}`;

        await this.waitUntilReadable(uploadPath);

        return {
            url: resultUrl,
            fileId: { path: uploadPath, sha }
        };
    }

    async waitUntilReadable(filePath, maxAttempts = 4) {
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                await this.getFile(filePath);
                return;
            } catch (error) {
                if (attempt === maxAttempts) {
                    throw error;
                }
                await new Promise((resolve) => setTimeout(resolve, 250 * attempt));
            }
        }
    }

    async getFile(filePath) {
        if (!this.token || !this.repo) {
            throw new Error('GitHub storage is not configured properly.');
        }

        const url = `https://api.github.com/repos/${this.repo}/contents/${filePath}`;
        const response = await axios.get(url, {
            headers: {
                'Authorization': `Bearer ${this.token}`,
                'Accept': 'application/vnd.github.raw',
                'User-Agent': 'LeetJudge-Storage-App',
            },
            responseType: 'arraybuffer',
            validateStatus: (status) => status < 500,
        });

        if (response.status === 404) {
            throw new Error('Image not found on GitHub');
        }
        if (response.status !== 200) {
            throw new Error(`Failed to fetch image from GitHub: ${response.statusText}`);
        }

        // Always determine content-type from file extension.
        // GitHub's raw API returns 'application/octet-stream' which browsers won't render as images.
        const contentType = getMimeTypeFromPath(filePath);

        return {
            buffer: Buffer.from(response.data),
            contentType: contentType !== 'application/octet-stream' ? contentType : (response.headers['content-type'] || 'image/png'),
        };
    }

    async deleteFile(fileId) {
        if (!this.token || !this.repo) {
            throw new Error("GitHub storage is not configured properly.");
        }
        
        if (!fileId || !fileId.path || !fileId.sha) {
            console.warn("deleteFile called without valid fileId (missing path or sha)");
            return;
        }

        const url = `https://api.github.com/repos/${this.repo}/contents/${fileId.path}`;

        try {
            await axios.delete(url, {
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json',
                    'User-Agent': 'LeetJudge-Storage-App'
                },
                data: {
                    message: `Delete image ${fileId.path} via LeetJudge`,
                    sha: fileId.sha,
                    branch: this.branch
                }
            });
        } catch (error) {
            console.error("GitHub API Delete Error:", error.response?.data || error.message);
            throw new Error(`Failed to delete from GitHub: ${error.response?.statusText || error.message}`);
        }
    }
}
