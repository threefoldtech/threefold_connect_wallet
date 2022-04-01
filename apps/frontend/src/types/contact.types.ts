export interface Contact {
    address: string;
    type: string;
    name: string;
}

export interface ContactValidation {
    valid: boolean;
    error?: string;
}
