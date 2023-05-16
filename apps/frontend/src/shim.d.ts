declare module '*.vue' {
    import { defineComponent } from 'vue';
    const Component: ReturnType<typeof defineComponent>;
    export default Component;
}

interface AppConfig {
    network: string,
}

interface Window {
    config: AppConfig
}