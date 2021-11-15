import flagsmith from 'flagsmith';

export const initFlags = async (name: string) => {
    await flagsmith.init({
        environmentID: 'VNe6BDbxYpeaJV66t8nMUX',
        api: 'https://flagsmith.jimber.io/api/v1/',
    });

    await flagsmith.identify(name);
    await flagsmith.getFlags();
};
