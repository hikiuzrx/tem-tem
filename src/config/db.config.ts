import { constants } from '../shared/constants';
import { LoggerService } from '../infrastructure/logger/logger.service';

export const dbConfig = (logger: LoggerService) => {
  logger.database(`Connecting to MongoDB at ${constants.DB_CONNECTION}`);

  return {
    uri: constants.DB_CONNECTION,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
  };
};
