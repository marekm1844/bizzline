import { ImageAsset } from './image.model';

export interface IImageAssetRepository {
  uploadImage(
    fileBuffer: Buffer,
    fileName: string,
  ): Promise<{ imageAsset: ImageAsset | null; error: string | null }>;
  uploadImageFromUrl(url: string, fileName: string): Promise<ImageAsset>;
}
