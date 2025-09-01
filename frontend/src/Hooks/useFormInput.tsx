import { useState } from "react";


function useFormInput(initial: string, validate: (v: string) => ValidationResult, transform?: (v: string) => string) {
    const [value, setValue] = useState(initial);
    const [touched, setTouched] = useState(false);

    const result = validate(value);
    const isError = touched && !result.isValid;

    const handleInput = (e: CustomEvent) => {
        let newValue = (e.target as HTMLInputElement).value ?? "";
        if (transform) newValue = transform(newValue);
        setValue(newValue);
    };

    return {
        value,
        setValue,
        bind: {
            value,
            onIonInput: handleInput,
            onIonBlur: () => setTouched(true),
            errorText: result.errorText,
        },
        isError,
        touched,
        isValid: result.isValid,
    };
}

export default useFormInput;
