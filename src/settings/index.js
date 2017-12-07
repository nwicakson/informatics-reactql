const settings = process.env.NODE_ENV === 'production' ? require('./prod.json') : require('./dev.json');

const webSettings = settings.web;
const publicSettings = settings.data.public;
const privateSettings = settings.data.private;

export { webSettings, publicSettings, privateSettings };
