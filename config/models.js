module.exports.models = {
  schema: true,
  //  migrate: 'alter',
  migrate: 'safe',
  attributes: {
    createdAt: { type: 'number', autoCreatedAt: true },
    id: { type: 'number', autoIncrement: true }
  },
  dataEncryptionKeys: {
    default: process.env.AT_REST_ENC
  },
  cascadeOnDestroy: true
};
