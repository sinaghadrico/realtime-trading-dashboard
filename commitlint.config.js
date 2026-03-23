export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'init',
        'feat',
        'fix',
        'test',
        'style',
        'refactor',
        'docs',
        'chore',
      ],
    ],
    'scope-enum': [
      1,
      'always',
      ['backend', 'frontend', 'docker', 'k8s'],
    ],
    'subject-max-length': [2, 'always', 100],
  },
};
