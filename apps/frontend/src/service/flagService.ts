import flagsmith from 'flagsmith';
import axios from 'axios';

export const initFlags = async (name: string) => {
    const isDev = import.meta.env.DEV;
    const environmentID = isDev ? 'VGR7Kmd6qWqnYaZxXU7Gyw' : (await axios.get('/api/v1/env')).data.flagsmith;

    await flagsmith.init({
        environmentID,
        api: 'https://flagsmith.jimber.io/api/v1/',
    });

    await flagsmith.identify(name);
    await flagsmith.getFlags();

    console.table({ flags: flagsmith.getAllFlags() });
};
