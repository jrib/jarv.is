import dynamic from "next/dynamic";

// Bundle these components by default:
export { default as Image } from "../components/Image/Image";
export { default as Figure } from "../components/Figure/Figure";

// These (mostly very small) components are direct replacements for HTML tags generated by remark:
export { default as code } from "../components/CodeBlock/CodeBlock";

// ...and these components are technically passed into all posts, but next/dynamic ensures they're loaded only
// when they're referenced in the individual mdx files.
export const IFrame = dynamic(() => import("../components/IFrame/IFrame"));
export const Video = dynamic(() => import("../components/Video/Video"));
export const YouTube = dynamic(() => import("../components/YouTubeEmbed/YouTubeEmbed"));
export const Tweet = dynamic(() => import("../components/TweetEmbed/TweetEmbed"));
export const Gist = dynamic(() => import("../components/GistEmbed/GistEmbed"));

// One-offs for specific posts:
export const OctocatLink = dynamic(() => import("../components/OctocatLink/OctocatLink"));
