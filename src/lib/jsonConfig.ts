import pipeline from '../../public/nixora-pipeline.json';
/** Only public content settings belong in the browser bundle. No certificates or private keys. */
export const jsonConfig = { pipeline } as const;
export default jsonConfig;
