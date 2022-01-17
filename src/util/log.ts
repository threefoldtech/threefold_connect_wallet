import { ref } from 'vue';

export const logs = ref<any[]>([]);

export const overrideConsole = () => {
    const console: any = window.console;
    if (!console) {
        return;
    }
    const logFnNames = [
        'log',
        'info',
        // 'warn',
        'error',
        'debug',
        'trace',
        'table',
    ];
    const originalFns = logFnNames.reduce((acc: { [key: string]: any }, name) => {
        acc[name] = console[name];
        return acc;
    }, {});

    logFnNames.forEach(name => {
        originalFns[name] = console[name];
        console[name] = (...args: any) => {
            if (typeof args[0] === 'string') {
                args[0] = `[${name.toUpperCase()}] ${args[0]}`;
            }
            logs.value.push({ level: name, args, timestamp: new Date().toISOString() });

            originalFns[name].apply(console, args);
        };
    });

    window.addEventListener('error', (e: ErrorEvent) => console.error(e));
    window.addEventListener('unhandledrejection', (e: PromiseRejectionEvent) => {
        console.error(e.reason.toString());

        return false;
    });
};
