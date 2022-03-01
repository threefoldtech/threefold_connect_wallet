import flagsmith from 'flagsmith';
import axios from 'axios';

export const initFlags = async (name: string) => {
    const isDev = import.meta.env.DEV;
    const flagsmithEnvironmentOverideID = import.meta.env.VITE_FLAGSMITH_ENV_ID ?? 'VGR7Kmd6qWqnYaZxXU7Gyw';

    console.log(flagsmithEnvironmentOverideID);
    const environmentID = isDev ? flagsmithEnvironmentOverideID : (await axios.get('/api/v1/env')).data.flagsmith;

    console.assert(flagsmithEnvironmentOverideID === environmentID, 'Flagsmith environment ID does not match');
    await flagsmith.init({
        environmentID,
        api: 'https://flagsmith.jimber.io/api/v1/',
    });

    await flagsmith.identify(name);
    await flagsmith.getFlags();

    console.table({ flags: flagsmith.getAllFlags() });
};
