/* eslint-disable @typescript-eslint/no-unsafe-call */
import { v2 as cloudinary, ConfigOptions } from 'cloudinary';
import { cloudinaryConstants } from '../../shared/cloudinary.constants';

export const CLOUDINARY = 'CLOUDINARY';

export const CloudinaryProvider = {
  provide: CLOUDINARY,
  useFactory: (): typeof cloudinary => {
    const options: ConfigOptions = {
      cloud_name: cloudinaryConstants.CLOUDINARY_NAME,
      api_key: cloudinaryConstants.CLOUDINARY_API_KEY,
      api_secret: cloudinaryConstants.CLOUDINARY_API_SECRET,
    };

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    cloudinary.config(options); // Now fully typed
    return cloudinary;
  },
};
