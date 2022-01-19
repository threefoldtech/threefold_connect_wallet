import flagsmith from 'flagsmith';
import axios from 'axios';

export const initFlags = async (name: string) => {
    // @ts-ignore
    const isDev = import.meta.env.DEV;
    const environmentID = isDev ? 'VNe6BDbxYpeaJV66t8nMUX' : (await axios.get('/api/v1/env')).data.flagsmith;

    await flagsmith.init({
        environmentID,
        api: 'https://flagsmith.jimber.io/api/v1/',
    });

    await flagsmith.identify(name);
    await flagsmith.getFlags();

    console.table({ flags: flagsmith.getAllFlags() });
};
