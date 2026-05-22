export const queryKeys = {
  module: {
    list: ['module', 'list'],
  },
  type: {
    all: ['typeModule'],
    list: (params) => ['typeModule', 'list', params],
    moduleList: (typeId) => ['typeModule', 'moduleList', typeId],
  },
};

export default queryKeys;
