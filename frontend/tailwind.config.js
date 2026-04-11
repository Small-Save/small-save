/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.{html,ts,tsx,js,jsx}"],
    theme: {
        extend: {
            // ─── Colors ──────────────────────────────────────────────────────
            colors: {
                // Ionic primary palette
                primary: {
                    DEFAULT: "var(--ion-color-primary)",
                    contrast: "var(--ion-color-primary-contrast)",
                    shade: "var(--ion-color-primary-shade)",
                    tint: "var(--ion-color-primary-tint)"
                },
                dark: "var(--ion-color-dark)",

                // Status colors  →  bg-success, text-success-dark, bg-warning-light …
                success: {
                    DEFAULT: "var(--color-success)",
                    light: "var(--color-success-light)",
                    dark: "var(--color-success-dark)"
                },
                warning: {
                    DEFAULT: "var(--color-warning)",
                    light: "var(--color-warning-light)",
                    dark: "var(--color-warning-dark)"
                },
                danger: {
                    DEFAULT: "var(--color-danger)",
                    light: "var(--color-danger-light)",
                    dark: "var(--color-danger-dark)"
                },
                info: {
                    DEFAULT: "var(--color-info)",
                    light: "var(--color-info-light)",
                    dark: "var(--color-info-dark)"
                },

                // Surfaces  →  bg-surface, bg-surface-muted
                surface: {
                    DEFAULT: "var(--color-surface)",
                    muted: "var(--color-surface-muted)",
                    overlay: "var(--color-surface-overlay)"
                },

                // Semantic text  →  text-content, text-content-secondary …
                content: {
                    DEFAULT: "var(--color-text-primary)",
                    secondary: "var(--color-text-secondary)",
                    muted: "var(--color-text-muted)",
                    "on-primary": "var(--color-text-on-primary)"
                },

                // Border  →  border-line, border-line-strong
                line: {
                    DEFAULT: "var(--color-border)",
                    strong: "var(--color-border-strong)"
                }
            },

            // ─── Border radius  →  rounded-sm / rounded-card / rounded-full …
            borderRadius: {
                sm: "var(--radius-sm)",
                md: "var(--radius-md)",
                lg: "var(--radius-lg)",
                xl: "var(--radius-xl)",
                full: "var(--radius-full)"
            },

            // ─── Box shadow  →  shadow-card / shadow-elevated / shadow-toolbar
            boxShadow: {
                card: "var(--shadow-card)",
                elevated: "var(--shadow-elevated)",
                toolbar: "var(--shadow-toolbar)"
            },

            // ─── Spacing  →  p-page / gap-section / p-card
            spacing: {
                page: "var(--spacing-page)",
                card: "var(--spacing-card)",
                section: "var(--spacing-section)"
            },

            // ─── Font family  →  font-nexa
            fontFamily: {
                nexa: ["var(--ion-font-family)", "sans-serif"]
            },

            // ─── Font size  →  text-base-app / text-lg-app …
            //     Prefixed to avoid colliding with Tailwind's built-in scale
            fontSize: {
                "app-xs": "var(--text-xs)",
                "app-sm": "var(--text-sm)",
                "app-base": "var(--text-base)",
                "app-lg": "var(--text-lg)",
                "app-xl": "var(--text-xl)",
                "app-2xl": "var(--text-2xl)",
                "app-3xl": "var(--text-3xl)"
            }
        }
    },
    plugins: []
};
