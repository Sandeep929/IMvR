import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'

// Automatically copy the new right hand side logo if it exists in the temp media storage
try {
  const sourcePath = "C:\\Users\\sihar\\.gemini\\antigravity\\brain\\a9849a18-fa8b-4bee-8a3e-5a8d25757823\\.tempmediaStorage\\media_a9849a18-fa8b-4bee-8a3e-5a8d25757823_1781521042777.jpg";
  const destPath = path.resolve(__dirname, "./src/assets/print-logo.jpg");
  if (fs.existsSync(sourcePath)) {
    fs.copyFileSync(sourcePath, destPath);
    console.log("[Build] Successfully copied new right hand side logo (AshTag) to src/assets/print-logo.jpg");
  }
} catch (err) {
  console.error("[Build] Failed to copy new logo:", err);
}

export default defineConfig({
  base: "./",
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },
  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
  server: {
    allowedHosts: [
      "sneakily-nondeafened-faith.ngrok-free.dev"
    ]
  }
})
