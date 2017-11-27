const settings = process.env.NODE_ENV === 'production' ? require('./prod.json') : require('./dev.json');

const publicSettings = settings.public;
const privateSettings = settings.private;

export { publicSettings, privateSettings };
