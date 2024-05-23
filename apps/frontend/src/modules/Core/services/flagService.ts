import flagsmith from 'flagsmith';
import axios from 'axios';
import { isDev } from '@/modules/Core/utils/enviroment';

export const initFlags = async (name: string) => {
    const flagsmithEnvironmentOverideID = 'VGR7Kmd6qWqnYaZxXU7Gyw';

    const environmentID = isDev ? flagsmithEnvironmentOverideID : (await axios.get('/api/v1/env')).data.flagsmith;
    console.log({ flagsmithEnv: environmentID });

    await flagsmith.init({
        environmentID,
        api: 'https://flagsmith.threefold.me/api/v1/',
    });

    await flagsmith.identify(name);
    await flagsmith.getFlags();

    console.table({ flags: flagsmith.getAllFlags() });
};
