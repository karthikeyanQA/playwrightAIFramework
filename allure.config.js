module.exports = {
  categories: [
    {
      name: 'API Tests',
      matchedStatuses: ['passed', 'failed', 'broken'],
      messageRegex: '.*@api.*',
    },
    {
      name: 'UI Tests',
      matchedStatuses: ['passed', 'failed', 'broken'],
      messageRegex: '.*@ui.*',
    },
    {
      name: 'Smoke Tests',
      matchedStatuses: ['passed', 'failed', 'broken'],
      messageRegex: '.*@smoke.*',
    },
    {
      name: 'Product defects',
      matchedStatuses: ['failed'],
    },
    {
      name: 'Test defects',
      matchedStatuses: ['broken'],
    },
  ],
};
