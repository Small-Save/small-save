/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.{html,ts,tsx,js,jsx}"],
    theme: {
        extend: {
            colors: {
                // Map Tailwind 'primary' to your Ionic primary variable
                primary: {
                    DEFAULT: "var(--ion-color-primary)",
                    rgb: "var(--ion-color-primary-rgb)",
                    contrast: "var(--ion-color-primary-contrast)",
                    shade: "var(--ion-color-primary-shade)",
                    tint: "var(--ion-color-primary-tint)"
                },
                dark: "var(--ion-color-dark)"
            },
            fontFamily: {
                // Use your custom Nexa font
                nexa: ["var(--ion-font-family)", "sans-serif"]
            }
        }
    },
    plugins: []
};
