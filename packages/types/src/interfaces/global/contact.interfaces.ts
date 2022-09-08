export interface IContactType {
    address: string;
    type: string;
    name: string;
}

export interface IContactValidation {
    valid: boolean;
    error?: string;
}

export interface IContactFormValidation {
    valid: boolean;
    error?: string;
    field?: string;
}
