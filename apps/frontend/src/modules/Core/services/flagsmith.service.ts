import flagsmith from 'flagsmith';
import axios from 'axios';
import { isDev } from '@/modules/Core/utils/enviroment';

const flagSmithUrl = 'https://flagsmith.jimber.io/api/v1/';

export const initializeFlagsmith = async (name: string) => {
    const fallbackId = 'VGR7Kmd6qWqnYaZxXU7Gyw';

    const envId = isDev ? fallbackId : (await axios.get('/api/v1/env')).data.flagsmith;
    console.info('Flagsmith Environment Id: ', envId);

    await flagsmith.init({ environmentID: envId, api: flagSmithUrl });

    await flagsmith.identify(name);
    await flagsmith.getFlags();

    console.table({ flags: flagsmith.getAllFlags() });
};
