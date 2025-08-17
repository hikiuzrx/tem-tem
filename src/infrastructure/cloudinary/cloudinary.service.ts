/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  v2 as Cloudinary,
  UploadApiResponse,
  UploadApiErrorResponse,
} from 'cloudinary';
import { CLOUDINARY } from './cloudinary.provider';
import toStream from 'buffer-to-stream';

@Injectable()
export class CloudinaryService {
  constructor(
    @Inject(CLOUDINARY) private readonly cloudinary: typeof Cloudinary,
  ) {}

  async uploadImage(file: { buffer: Buffer }): Promise<UploadApiResponse> {
    if (!file?.buffer) {
      throw new InternalServerErrorException('No file buffer provided');
    }

    return new Promise<UploadApiResponse>((resolve, reject) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      const uploadStream = this.cloudinary.uploader.upload_stream(
        (
          // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
          error: UploadApiErrorResponse | undefined,
          // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
          result: UploadApiResponse | undefined,
        ) => {
          if (error)
            return reject(new InternalServerErrorException(error.message));
          if (!result)
            return reject(
              new InternalServerErrorException('Upload result is undefined'),
            );
          resolve(result);
        },
      );

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      toStream(file.buffer).pipe(uploadStream);
    });
  }
}
