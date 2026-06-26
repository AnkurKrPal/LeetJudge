import { getImageFileService } from '../services/storage.service.js';

export const serveImage = async (req, res) => {
    try {
        const imagePath = req.path.replace(/^\//, '');
        console.log(`[Image Proxy] Serving image: ${imagePath}`);
        const { buffer, contentType } = await getImageFileService(imagePath);

        res.set('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
        res.set('Content-Type', contentType);
        res.set('Content-Length', buffer.length);
        res.set('Content-Disposition', 'inline');
        console.log(`[Image Proxy] Sending ${buffer.length} bytes as ${contentType}`);
        res.send(buffer);
    } catch (error) {
        console.error(`[Image Proxy] Error serving image: ${error.message}`);
        const status = error.message.includes('not found') ? 404 : 500;
        if (status === 404) {
            res.set('Cache-Control', 'no-cache');
            res.set('Content-Type', 'image/svg+xml');
            return res.status(404).send('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="100%" height="100%" fill="#f3f4f6"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="system-ui, sans-serif" font-size="14" fill="#6b7280">Image not found</text></svg>');
        }
        res.status(status).json({ error: error.message || 'Failed to load image' });
    }
};
