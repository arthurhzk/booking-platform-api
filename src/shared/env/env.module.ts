import { Module, Global } from '@nestjs/common'
import { EnvService } from "@src/shared/env/env.service"

@Global()
@Module({
    providers: [EnvService],
    exports: [EnvService],
})
export class EnvModule {}