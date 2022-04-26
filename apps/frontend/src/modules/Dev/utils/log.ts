import { ref } from 'vue';
import { isDev } from '@/modules/Core/utils/enviroment';

export const logs = ref<any[]>([]);

export const overrideConsole = () => {
    window.console.info({ isDev });
    if (isDev) return;
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
            if (args[0]?.toString() === '[object ErrorEvent]') {
                args[0] = `[${name.toUpperCase()}] ${args[0].message}`;
            }
            logs.value.push({ level: name, args, timestamp: new Date().toISOString() });

            originalFns[name].apply(console, args);
        };
    });

    window.addEventListener('error', (e: ErrorEvent) => {
        console.error({ message: e.message, type: e?.type, stack: e?.error?.stack, line: e?.lineno, column: e?.colno });
    });
    window.addEventListener('unhandledrejection', (e: PromiseRejectionEvent) => {
        console.error(e.reason.toString());

        return false;
    });
};
