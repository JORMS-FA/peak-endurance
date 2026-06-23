// Brings the @testing-library/jest-dom vitest matcher augmentations
// (toBeInTheDocument, toBeDisabled, …) into the tsc program that type-checks
// the test files under src/. The runtime side-effect import already lives in
// vitest.setup.ts; this file only exists so the type augmentations are part of
// tsconfig.app.json's compilation.
import '@testing-library/jest-dom/vitest'