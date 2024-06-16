import { Injectable } from '@nestjs/common';
import axios from 'axios';
import Jimp from 'jimp';

@Injectable()
export class ImageService {
  async imageUrlToOptimizedWebPBase64(url: string): Promise<string> {
    try {
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
      const isImage = imageExtensions.some((ext) =>
        url.toLowerCase().includes(ext),
      );
      if (!isImage) {
        return '';
      }

      let response;
      try {
        response = await axios.get(url, { responseType: 'arraybuffer' });
      } catch (error) {
        // If the request fails, return an empty string
        return '';
      }

      let buffer;
      try {
        buffer = Buffer.from(response.data);
      } catch (err) {
        //image too large
        return '';
      }

      // Check if the image size exceeds the limit
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (buffer.length > maxSize) {
        return '';
      }

      let image = null;

      // Check if the image format is webp
      if (response.headers['content-type'] === 'image/webp') {
        //TODO: webp not supported by Jimp
        return '';
      } else {
        try {
          image = await Jimp.read(buffer);
        } catch (error) {
          // If reading the image fails (e.g., due to memory limit), return an empty string
          return '';
        }
      }

      let quality = 80;
      let size = 0;

      // Step 3: Optimize the image size
      do {
        if (size === 0) {
          image = image.resize(600, Jimp.AUTO); // Maintain aspect ratio
        }

        // Adjust quality and check the size
        image = image.quality(quality);
        const testBuffer = await image.getBufferAsync(Jimp.MIME_JPEG);
        size = testBuffer.length;

        quality -= 10;
      } while (size > 200 * 1024 && quality > 10);

      // Step 3: Convert the processed image to JPEG and then to a base64 string
      return await image.getBase64Async(Jimp.MIME_JPEG);
    } catch (error) {
      throw new Error(`Failed to process and convert image: ${error.message}`);
    }
  }
}
