import {Global, Module} from '@nestjs/common';
import { AppLogger } from '@src/shared/logger/logger.service';

@Global()
@Module({
  providers: [AppLogger],
  exports: [AppLogger],
})
export class LoggerModule {}