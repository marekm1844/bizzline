import { Module } from '@nestjs/common';
import { ImageAssetService } from './image-asset.service';
import { AzureImageAssetRepository } from './azure-image-asset.repository';

@Module({
  providers: [
    ImageAssetService,
    {
      provide: 'IImageAssetRepository',
      useClass: AzureImageAssetRepository,
    },
  ],
  exports: [ImageAssetService],
})
export class ImageAssetsModule {}
