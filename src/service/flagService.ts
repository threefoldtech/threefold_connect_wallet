import flagsmith from 'flagsmith';

export const initFlags = async (name: string) => {
    await flagsmith.init({
        // environmentID: 'VNe6BDbxYpeaJV66t8nMUX', //staging
        environmentID: 'S5j22oQHTzUk7y4khnBxda',
        api: 'https://flagsmith.jimber.io/api/v1/',
    });

    await flagsmith.identify(name);
    await flagsmith.getFlags();

    console.table({ flags: flagsmith.getAllFlags() });
};
