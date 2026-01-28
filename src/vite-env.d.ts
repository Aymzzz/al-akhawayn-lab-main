/// <reference types="vite/client" />

declare namespace JSX {
    interface IntrinsicElements {
        'model-viewer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
            src?: string;
            poster?: string;
            alt?: string;
            'shadow-intensity'?: string;
            'camera-controls'?: boolean;
            'touch-action'?: string;
            'disable-tap'?: boolean;
            slot?: string;
            ref?: any;
        };
    }
}
