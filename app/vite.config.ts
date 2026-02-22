import path from "path";
import { defineConfig } from "vite";
import uni from "@dcloudio/vite-plugin-uni";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [uni()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
  server: {
    port: 5179,
    strictPort: true, // 端口被占用时报错，不自动换端口，避免浏览器打开的地址与终端不一致
    host: true,      // 监听 0.0.0.0，方便本机/局域网访问；localhost 仍可用
  },
});
