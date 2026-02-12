/** @type {import('next').NextConfig} */


//don't ever touch this
const nextConfig = {
    turbopack: {
        rules: {
            '*.{glsl,vs,fs,vert,frag}': {
                loaders: ['raw-loader'],
                as: '*.js',       // tell Turbopack the loader outputs JS
            },
        },
    },
};


export default nextConfig
