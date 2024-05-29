import createPreset from 'conventional-changelog-conventionalcommits';

export default createPreset({
    types: [
        { type: 'add', section: '✨ Features' },
        { type: 'feat', section: '✨ Features' },
        { type: 'feature', section: '✨ Features' },
        { type: 'fix', section: '🐛 Bug Fixes' },
        { type: 'perf', section: '⚡ Performance Improvements' },
        { type: 'revert', section: '⏪ Reverts' },
        { type: 'docs', scope: 'README', section: '📚 Documentation' },
        { type: 'build', scope: 'deps', section: '🔧 Build System' },
        { type: 'docs', section: '📚 Documentation', hidden: true },
        { type: 'style', section: '🎨 Styles', hidden: true },
        { type: 'chore', section: '🔧 Miscellaneous Chores', hidden: true },
        { type: 'refactor', section: '♻️ Code Refactoring', hidden: true },
        { type: 'test', section: '✅ Tests', hidden: true },
        { type: 'build', section: '🔧 Build System', hidden: true },
        { type: 'ci', section: '🔁 Continuous Integration', hidden: true },
    ],
});
