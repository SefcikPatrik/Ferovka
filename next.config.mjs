/** Static export: the whole site is plain HTML/JS in `out/`, hosted for free on Vercel (Hobby) or any static host. */
const nextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
};
export default nextConfig;
