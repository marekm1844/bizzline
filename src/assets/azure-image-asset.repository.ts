import { Injectable, Logger } from '@nestjs/common';
import { IImageAssetRepository } from './image-asset-repository.interface';
import { BlobServiceClient } from '@azure/storage-blob';
import { ConfigService } from '@nestjs/config';
import { ImageAsset } from './image.model';
import axios from 'axios';

@Injectable()
export class AzureImageAssetRepository implements IImageAssetRepository {
  private blobServiceClient: BlobServiceClient;
  private containerName = 'images';
  //private containerName = 'dev';

  constructor(private readonly configService: ConfigService) {
    this.blobServiceClient = BlobServiceClient.fromConnectionString(
      this.configService.get<string>('AZURE_STORAGE_CONNECTION_STRING'),
    );
    this.blobServiceClient
      .getContainerClient(this.containerName)
      .createIfNotExists();
  }

  async uploadImage(
    fileBuffer: Buffer,
    fileName: string,
  ): Promise<{ imageAsset: ImageAsset | null; error: string | null }> {
    const blobClient = this.blobServiceClient
      .getContainerClient(this.containerName)
      .getBlockBlobClient(fileName);

    try {
      await blobClient.uploadData(fileBuffer);
    } catch (error) {
      Logger.error('Error uploading image:', error);
      return { imageAsset: null, error: error.message };
    }

    const url = blobClient.url;
    const imageAsset = new ImageAsset(url);

    return { imageAsset: imageAsset, error: null };
  }

  async uploadImageFromUrl(url: string, fileName: string): Promise<ImageAsset> {
    const blobClient = this.blobServiceClient
      .getContainerClient(this.containerName)
      .getBlockBlobClient(fileName);

    try {
      const response = await axios.get(url, { responseType: 'arraybuffer' });
      const buffer = await Buffer.from(response.data);
      await blobClient.uploadData(buffer);
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }

    const imageUrl = blobClient.url;
    const imageAsset = new ImageAsset(imageUrl);

    return imageAsset;
  }
}
