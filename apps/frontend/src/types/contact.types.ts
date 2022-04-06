export interface Contact {
    address: string;
    type: string;
    name: string;
}

export interface ContactValidation {
    valid: boolean;
    error?: string;
}

export interface ContactFormValidation {
    valid: boolean;
    error?: string;
    field?: string;
}
