import flagsmith from 'flagsmith';
import axios from 'axios';
import { isDev } from '@/modules/Core/utils/enviroment';

export const initFlags = async (name: string) => {
    const flagsmithEnvironmentOverideID = 'S5j22oQHTzUk7y4khnBxda';

    const environmentID = isDev ? flagsmithEnvironmentOverideID : (await axios.get('/api/v1/env')).data.flagsmith;
    console.log({ flagsmithEnv: environmentID });

    await flagsmith.init({
        environmentID,
        api: 'https://flagsmith.jimber.io/api/v1/',
    });

    await flagsmith.identify(name);
    await flagsmith.getFlags();

    console.table({ flags: flagsmith.getAllFlags() });
};
