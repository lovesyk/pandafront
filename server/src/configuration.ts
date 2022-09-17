import { ConfigService } from '@nestjs/config';

export default class Configuration {
    constructor(private configService: ConfigService) { }

    getPort() : number {
        return this.configService.get<number>('PORT');
    }
}
