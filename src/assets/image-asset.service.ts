import { Inject, Injectable, Logger } from '@nestjs/common';
import { IImageAssetRepository } from './image-asset-repository.interface';
import { ImageAsset } from './image.model';
import Jimp from 'jimp';
import axios from 'axios';
import svg2img from 'svg2img';

@Injectable()
export class ImageAssetService {
  constructor(
    @Inject('IImageAssetRepository')
    private readonly assetRepository: IImageAssetRepository,
  ) {}

  async uploadImageFromUrl(
    url: string,
    fileName: string,
  ): Promise<{ imageAsset: ImageAsset | null; error: string | null }> {
    return this.assetRepository.uploadImage(
      await this.loadAndOptimizeImage(url),
      fileName,
    );
  }

  private async loadAndOptimizeImage(url: string): Promise<Buffer> {
    let image: Jimp;
    let buffer: Buffer;
    let response;

    try {
      response = await axios.get(url, { responseType: 'arraybuffer' });

      if (response.headers['content-type'] === 'image/svg+xml') {
        return new Promise<Buffer>((resolve, reject) => {
          svg2img(response.data, (err, buffer) => {
            if (err) {
              reject(err);
            } else {
              resolve(buffer);
            }
          });
        });
      }

      buffer = await Buffer.from(response.data);
    } catch (error) {
      Logger.error('Error uploading image:', error);
      throw error;
    }

    // Check if the image format is webp or avif
    if (
      response.headers['content-type'] === 'image/webp' ||
      response.headers['content-type'] === 'image/avif'
    ) {
      return buffer;
    } else {
      try {
        image = await Jimp.read(buffer);
      } catch (error) {
        // If reading the image fails (e.g., due to memory limit), return an empty string
        Logger.error('Error uploading image:', error);
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

    return new Promise<Buffer>((resolve, reject) => {
      image.getBuffer(Jimp.MIME_JPEG, (err, buffer) => {
        if (err) {
          reject(err);
        } else {
          resolve(buffer);
        }
      });
    });
  }
}
